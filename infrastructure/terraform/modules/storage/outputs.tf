# BrasserieBot GCP Infrastructure - Storage Module Outputs

output "assets_bucket_id" {
  description = "The ID of the assets bucket"
  value       = google_storage_bucket.assets_bucket.id
}

output "assets_bucket_name" {
  description = "The name of the assets bucket"
  value       = google_storage_bucket.assets_bucket.name
}

output "assets_bucket_url" {
  description = "The URL of the assets bucket"
  value       = google_storage_bucket.assets_bucket.url
}

output "backup_bucket_id" {
  description = "The ID of the backup bucket"
  value       = google_storage_bucket.backup_bucket.id
}

output "backup_bucket_name" {
  description = "The name of the backup bucket"
  value       = google_storage_bucket.backup_bucket.name
}

output "backup_bucket_url" {
  description = "The URL of the backup bucket"
  value       = google_storage_bucket.backup_bucket.url
}

output "logs_bucket_id" {
  description = "The ID of the logs bucket"
  value       = google_storage_bucket.logs_bucket.id
}

output "logs_bucket_name" {
  description = "The name of the logs bucket"
  value       = google_storage_bucket.logs_bucket.name
}

output "logs_bucket_url" {
  description = "The URL of the logs bucket"
  value       = google_storage_bucket.logs_bucket.url
}

output "autodev_bucket_id" {
  description = "The ID of the autodev bucket"
  value       = google_storage_bucket.autodev_bucket.id
}

output "autodev_bucket_name" {
  description = "The name of the autodev bucket"
  value       = google_storage_bucket.autodev_bucket.name
}

output "autodev_bucket_url" {
  description = "The URL of the autodev bucket"
  value       = google_storage_bucket.autodev_bucket.url
}

output "service_account_email" {
  description = "The email of the storage service account"
  value       = google_service_account.storage_sa.email
}

output "hmac_key_access_id" {
  description = "The access ID of the HMAC key"
  value       = google_storage_hmac_key.key.access_id
}

output "hmac_key_secret_id" {
  description = "The ID of the Secret Manager secret for the HMAC key"
  value       = google_secret_manager_secret.hmac_key.id
}

output "bucket_url" {
  description = "The URL of the main assets bucket"
  value       = google_storage_bucket.assets_bucket.url
}