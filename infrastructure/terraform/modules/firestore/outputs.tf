# BrasserieBot GCP Infrastructure - Firestore Module Outputs

output "database_id" {
  description = "The ID of the Firestore database"
  value       = google_firestore_database.database.id
}

output "database_name" {
  description = "The name of the Firestore database"
  value       = google_firestore_database.database.name
}

output "database_location" {
  description = "The location of the Firestore database"
  value       = google_firestore_database.database.location_id
}

output "service_account_email" {
  description = "The email of the Firestore service account"
  value       = google_service_account.firestore_sa.email
}

output "service_account_id" {
  description = "The ID of the Firestore service account"
  value       = google_service_account.firestore_sa.id
}