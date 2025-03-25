# BrasserieBot GCP Infrastructure - Database Module

# Enable required APIs
resource "google_project_service" "sqladmin_api" {
  project = var.project_id
  service = "sqladmin.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Create a random password for the database user
resource "random_password" "database_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Create a service account for database access
resource "google_service_account" "database_sa" {
  project      = var.project_id
  account_id   = "cloudsql-${var.database_instance_name}-sa"
  display_name = "Cloud SQL Service Account for ${var.database_instance_name}"
}

# Grant required roles to the database service account
resource "google_project_iam_member" "database_sa_roles" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/cloudsql.instanceUser"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.database_sa.email}"
}

# Create a private IP address for the Cloud SQL instance
resource "google_compute_global_address" "private_ip_address" {
  count         = var.enable_private_ip ? 1 : 0
  project       = var.project_id
  name          = "private-ip-${var.database_instance_name}"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = var.network_id
}

# Create a VPC peering connection for private IP
resource "google_service_networking_connection" "private_vpc_connection" {
  count                   = var.enable_private_ip ? 1 : 0
  network                 = var.network_id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address[0].name]

  depends_on = [
    google_project_service.sqladmin_api
  ]
}

# Create a Cloud SQL instance
resource "google_sql_database_instance" "instance" {
  name             = var.database_instance_name
  project          = var.project_id
  region           = var.region
  database_version = var.database_version

  settings {
    tier              = var.database_tier
    availability_type = var.availability_type
    disk_size         = var.disk_size
    disk_type         = var.disk_type
    disk_autoresize   = true

    backup_configuration {
      enabled            = true
      binary_log_enabled = false
      start_time         = "02:00"
      location           = var.region
      
      backup_retention_settings {
        retained_backups = 7
        retention_unit   = "COUNT"
      }
    }

    maintenance_window {
      day          = 7  # Sunday
      hour         = 3
      update_track = "stable"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }

    ip_configuration {
      ipv4_enabled    = !var.enable_private_ip
      private_network = var.enable_private_ip ? var.network_id : null
      require_ssl     = true
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }

    database_flags {
      name  = "log_checkpoints"
      value = "on"
    }

    database_flags {
      name  = "log_connections"
      value = "on"
    }

    database_flags {
      name  = "log_disconnections"
      value = "on"
    }

    database_flags {
      name  = "log_lock_waits"
      value = "on"
    }

    database_flags {
      name  = "log_min_error_statement"
      value = "error"
    }

    database_flags {
      name  = "log_min_messages"
      value = "warning"
    }

    database_flags {
      name  = "log_temp_files"
      value = "0"
    }

    user_labels = {
      environment = var.environment
    }
  }

  deletion_protection = true

  depends_on = [
    google_service_networking_connection.private_vpc_connection
  ]

  lifecycle {
    prevent_destroy = true
  }
}

# Create a database
resource "google_sql_database" "database" {
  name     = var.database_name
  project  = var.project_id
  instance = google_sql_database_instance.instance.name
}

# Create a database user
resource "google_sql_user" "user" {
  name     = var.database_user
  project  = var.project_id
  instance = google_sql_database_instance.instance.name
  password = random_password.database_password.result
}

# Create a Secret Manager secret for the database password
resource "google_secret_manager_secret" "database_password" {
  project   = var.project_id
  secret_id = "cloudsql-${var.database_instance_name}-password"

  replication {
    automatic = true
  }

  depends_on = [
    google_project_service.secretmanager_api
  ]
}

# Store the database password in Secret Manager
resource "google_secret_manager_secret_version" "database_password" {
  secret      = google_secret_manager_secret.database_password.id
  secret_data = random_password.database_password.result
}

# Create a Secret Manager secret for the database connection string
resource "google_secret_manager_secret" "database_connection" {
  project   = var.project_id
  secret_id = "cloudsql-${var.database_instance_name}-connection"

  replication {
    automatic = true
  }

  depends_on = [
    google_project_service.secretmanager_api
  ]
}

# Store the database connection string in Secret Manager
resource "google_secret_manager_secret_version" "database_connection" {
  secret = google_secret_manager_secret.database_connection.id
  secret_data = var.enable_private_ip ? (
    "postgresql://${var.database_user}:${random_password.database_password.result}@${google_sql_database_instance.instance.private_ip_address}:5432/${var.database_name}"
    ) : (
    "postgresql://${var.database_user}:${random_password.database_password.result}@${google_sql_database_instance.instance.public_ip_address}:5432/${var.database_name}"
  )
}

# Enable Secret Manager API
resource "google_project_service" "secretmanager_api" {
  project = var.project_id
  service = "secretmanager.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Grant access to the database password secret to the database service account
resource "google_secret_manager_secret_iam_member" "database_password_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.database_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.database_sa.email}"
}

# Grant access to the database connection secret to the database service account
resource "google_secret_manager_secret_iam_member" "database_connection_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.database_connection.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.database_sa.email}"
}