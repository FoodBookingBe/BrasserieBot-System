# BrasserieBot GCP Infrastructure - IAM Module

# Create a service account for the application
resource "google_service_account" "app_sa" {
  project      = var.project_id
  account_id   = "brasserie-bot-app-sa"
  display_name = "BrasserieBot Application Service Account"
}

# Create a service account for the AutoDev system
resource "google_service_account" "autodev_sa" {
  project      = var.project_id
  account_id   = "brasserie-bot-autodev-sa"
  display_name = "BrasserieBot AutoDev Service Account"
}

# Create a service account for CI/CD
resource "google_service_account" "cicd_sa" {
  project      = var.project_id
  account_id   = "brasserie-bot-cicd-sa"
  display_name = "BrasserieBot CI/CD Service Account"
}

# Grant roles to the application service account
resource "google_project_iam_member" "app_sa_roles" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/datastore.user",
    "roles/pubsub.publisher",
    "roles/pubsub.subscriber",
    "roles/storage.objectUser",
    "roles/secretmanager.secretAccessor",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/aiplatform.user"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.app_sa.email}"
}

# Grant roles to the AutoDev service account
resource "google_project_iam_member" "autodev_sa_roles" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/datastore.user",
    "roles/pubsub.publisher",
    "roles/pubsub.subscriber",
    "roles/storage.objectAdmin",
    "roles/secretmanager.secretAccessor",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/aiplatform.user",
    "roles/artifactregistry.reader",
    "roles/artifactregistry.writer"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.autodev_sa.email}"
}

# Grant roles to the CI/CD service account
resource "google_project_iam_member" "cicd_sa_roles" {
  for_each = toset([
    "roles/container.developer",
    "roles/storage.objectAdmin",
    "roles/cloudsql.client",
    "roles/cloudbuild.builds.editor",
    "roles/artifactregistry.admin",
    "roles/secretmanager.secretAccessor",
    "roles/iam.serviceAccountUser"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.cicd_sa.email}"
}

# Create Workload Identity binding for the application service account
resource "google_service_account_iam_binding" "app_sa_workload_identity" {
  service_account_id = google_service_account.app_sa.name
  role               = "roles/iam.workloadIdentityUser"
  members = [
    "serviceAccount:${var.project_id}.svc.id.goog[default/brasserie-bot-app]"
  ]
}

# Create Workload Identity binding for the AutoDev service account
resource "google_service_account_iam_binding" "autodev_sa_workload_identity" {
  service_account_id = google_service_account.autodev_sa.name
  role               = "roles/iam.workloadIdentityUser"
  members = [
    "serviceAccount:${var.project_id}.svc.id.goog[default/brasserie-bot-autodev]"
  ]
}

# Create IAM policy binding for the CI/CD service account to use the application service account
resource "google_service_account_iam_binding" "cicd_sa_app_sa_user" {
  service_account_id = google_service_account.app_sa.name
  role               = "roles/iam.serviceAccountUser"
  members = [
    "serviceAccount:${google_service_account.cicd_sa.email}"
  ]
}

# Create IAM policy binding for the CI/CD service account to use the AutoDev service account
resource "google_service_account_iam_binding" "cicd_sa_autodev_sa_user" {
  service_account_id = google_service_account.autodev_sa.name
  role               = "roles/iam.serviceAccountUser"
  members = [
    "serviceAccount:${google_service_account.cicd_sa.email}"
  ]
}

# Create custom IAM role for AutoDev system
resource "google_project_iam_custom_role" "autodev_role" {
  project     = var.project_id
  role_id     = "autodevSystemRole"
  title       = "AutoDev System Role"
  description = "Custom role for the AutoDev system with specific permissions"
  permissions = [
    "aiplatform.models.predict",
    "aiplatform.endpoints.predict",
    "storage.objects.get",
    "storage.objects.list",
    "storage.objects.create",
    "storage.objects.update",
    "pubsub.topics.publish",
    "pubsub.subscriptions.consume",
    "logging.logEntries.create",
    "monitoring.timeSeries.create"
  ]
}

# Grant the custom AutoDev role to the AutoDev service account
resource "google_project_iam_member" "autodev_sa_custom_role" {
  project = var.project_id
  role    = google_project_iam_custom_role.autodev_role.id
  member  = "serviceAccount:${google_service_account.autodev_sa.email}"
}

# Create service account key for CI/CD (for GitHub Actions)
resource "google_service_account_key" "cicd_sa_key" {
  service_account_id = google_service_account.cicd_sa.name
}

# Store CI/CD service account key in Secret Manager
resource "google_secret_manager_secret" "cicd_sa_key" {
  project   = var.project_id
  secret_id = "cicd-sa-key"

  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "cicd_sa_key" {
  secret      = google_secret_manager_secret.cicd_sa_key.id
  secret_data = base64decode(google_service_account_key.cicd_sa_key.private_key)
}