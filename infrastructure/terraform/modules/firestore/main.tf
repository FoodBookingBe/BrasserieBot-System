# BrasserieBot GCP Infrastructure - Firestore Module

# Enable required APIs
resource "google_project_service" "firestore_api" {
  project = var.project_id
  service = "firestore.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Create Firestore database in Native mode
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.location
  type        = "FIRESTORE_NATIVE"

  concurrency_mode = "OPTIMISTIC"

  depends_on = [
    google_project_service.firestore_api
  ]
}

# Create a service account for Firestore access
resource "google_service_account" "firestore_sa" {
  project      = var.project_id
  account_id   = "firestore-${var.project_id}-sa"
  display_name = "Firestore Service Account for ${var.project_id}"
}

# Grant required roles to the Firestore service account
resource "google_project_iam_member" "firestore_sa_roles" {
  for_each = toset([
    "roles/datastore.user",
    "roles/datastore.viewer"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.firestore_sa.email}"
}

# Create Firestore indexes for common queries
resource "google_firestore_index" "orders_by_status_and_date" {
  project = var.project_id
  database = google_firestore_database.database.name
  collection = "orders"

  fields {
    field_path = "status"
    order      = "ASCENDING"
  }

  fields {
    field_path = "createdAt"
    order      = "DESCENDING"
  }

  depends_on = [
    google_firestore_database.database
  ]
}

resource "google_firestore_index" "users_by_role_and_name" {
  project = var.project_id
  database = google_firestore_database.database.name
  collection = "users"

  fields {
    field_path = "role"
    order      = "ASCENDING"
  }

  fields {
    field_path = "name"
    order      = "ASCENDING"
  }

  depends_on = [
    google_firestore_database.database
  ]
}

resource "google_firestore_index" "autodev_tasks_by_status_and_priority" {
  project = var.project_id
  database = google_firestore_database.database.name
  collection = "autodev_tasks"

  fields {
    field_path = "status"
    order      = "ASCENDING"
  }

  fields {
    field_path = "priority"
    order      = "DESCENDING"
  }

  fields {
    field_path = "createdAt"
    order      = "ASCENDING"
  }

  depends_on = [
    google_firestore_database.database
  ]
}

# Create Firestore field TTL configuration for logs
resource "google_firestore_field" "logs_ttl" {
  project = var.project_id
  database = google_firestore_database.database.name
  collection = "logs"
  field = "ttl"
  ttl_config {}

  depends_on = [
    google_firestore_database.database
  ]
}

# Create Firestore field TTL configuration for temporary data
resource "google_firestore_field" "temp_data_ttl" {
  project = var.project_id
  database = google_firestore_database.database.name
  collection = "temp_data"
  field = "expiresAt"
  ttl_config {}

  depends_on = [
    google_firestore_database.database
  ]
}