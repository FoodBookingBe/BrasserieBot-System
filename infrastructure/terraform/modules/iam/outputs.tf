# BrasserieBot GCP Infrastructure - IAM Module Outputs

output "app_service_account_email" {
  description = "The email of the application service account"
  value       = google_service_account.app_sa.email
}

output "app_service_account_id" {
  description = "The ID of the application service account"
  value       = google_service_account.app_sa.id
}

output "autodev_service_account_email" {
  description = "The email of the AutoDev service account"
  value       = google_service_account.autodev_sa.email
}

output "autodev_service_account_id" {
  description = "The ID of the AutoDev service account"
  value       = google_service_account.autodev_sa.id
}

output "cicd_service_account_email" {
  description = "The email of the CI/CD service account"
  value       = google_service_account.cicd_sa.email
}

output "cicd_service_account_id" {
  description = "The ID of the CI/CD service account"
  value       = google_service_account.cicd_sa.id
}

output "autodev_custom_role_id" {
  description = "The ID of the custom AutoDev role"
  value       = google_project_iam_custom_role.autodev_role.id
}

output "cicd_sa_key_secret_id" {
  description = "The ID of the Secret Manager secret for the CI/CD service account key"
  value       = google_secret_manager_secret.cicd_sa_key.id
}