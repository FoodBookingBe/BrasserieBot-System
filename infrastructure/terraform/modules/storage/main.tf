# BrasserieBot GCP Infrastructure - Storage Module

# Enable required APIs
resource "google_project_service" "storage_api" {
  project = var.project_id
  service = "storage.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Create a service account for storage access
resource "google_service_account" "storage_sa" {
  project      = var.project_id
  account_id   = "storage-${var.bucket_name}-sa"
  display_name = "Storage Service Account for ${var.bucket_name}"
}

# Grant required roles to the storage service account
resource "google_project_iam_member" "storage_sa_roles" {
  for_each = toset([
    "roles/storage.objectAdmin",
    "roles/storage.hmacKeyAdmin"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.storage_sa.email}"
}

# Create main assets bucket
resource "google_storage_bucket" "assets_bucket" {
  name          = "${var.bucket_name}-assets"
  project       = var.project_id
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  cors {
    origin          = var.cors_origins
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["Content-Type", "Access-Control-Allow-Origin"]
    max_age_seconds = 3600
  }

  logging {
    log_bucket        = google_storage_bucket.logs_bucket.name
    log_object_prefix = "assets-bucket-logs"
  }
}

# Create backup bucket
resource "google_storage_bucket" "backup_bucket" {
  name          = "${var.bucket_name}-backups"
  project       = var.project_id
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "SetStorageClass"
      storage_class = "ARCHIVE"
    }
  }

  logging {
    log_bucket        = google_storage_bucket.logs_bucket.name
    log_object_prefix = "backup-bucket-logs"
  }
}

# Create logs bucket
resource "google_storage_bucket" "logs_bucket" {
  name          = "${var.bucket_name}-logs"
  project       = var.project_id
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }
}

# Create autodev bucket for knowledge base and artifacts
resource "google_storage_bucket" "autodev_bucket" {
  name          = "${var.bucket_name}-autodev"
  project       = var.project_id
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }

  logging {
    log_bucket        = google_storage_bucket.logs_bucket.name
    log_object_prefix = "autodev-bucket-logs"
  }
}

# Create IAM policy for assets bucket
resource "google_storage_bucket_iam_binding" "assets_bucket_admin" {
  bucket = google_storage_bucket.assets_bucket.name
  role   = "roles/storage.objectAdmin"
  members = [
    "serviceAccount:${google_service_account.storage_sa.email}"
  ]
}

# Create IAM policy for backup bucket
resource "google_storage_bucket_iam_binding" "backup_bucket_admin" {
  bucket = google_storage_bucket.backup_bucket.name
  role   = "roles/storage.objectAdmin"
  members = [
    "serviceAccount:${google_service_account.storage_sa.email}"
  ]
}

# Create IAM policy for logs bucket
resource "google_storage_bucket_iam_binding" "logs_bucket_admin" {
  bucket = google_storage_bucket.logs_bucket.name
  role   = "roles/storage.objectAdmin"
  members = [
    "serviceAccount:${google_service_account.storage_sa.email}"
  ]
}

# Create IAM policy for autodev bucket
resource "google_storage_bucket_iam_binding" "autodev_bucket_admin" {
  bucket = google_storage_bucket.autodev_bucket.name
  role   = "roles/storage.objectAdmin"
  members = [
    "serviceAccount:${google_service_account.storage_sa.email}"
  ]
}

# Create HMAC key for programmatic access
resource "google_storage_hmac_key" "key" {
  service_account_email = google_service_account.storage_sa.email
  project               = var.project_id
}

# Create Secret Manager secret for HMAC key
resource "google_secret_manager_secret" "hmac_key" {
  project   = var.project_id
  secret_id = "storage-${var.bucket_name}-hmac-key"

  replication {
    automatic = true
  }

  depends_on = [
    google_project_service.secretmanager_api
  ]
}

# Store HMAC key in Secret Manager
resource "google_secret_manager_secret_version" "hmac_key" {
  secret      = google_secret_manager_secret.hmac_key.id
  secret_data = "${google_storage_hmac_key.key.access_id}:${google_storage_hmac_key.key.secret}"
}

# Enable Secret Manager API
resource "google_project_service" "secretmanager_api" {
  project = var.project_id
  service = "secretmanager.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Grant access to the HMAC key secret to the storage service account
resource "google_secret_manager_secret_iam_member" "hmac_key_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.hmac_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.storage_sa.email}"
}