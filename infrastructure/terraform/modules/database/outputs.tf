# BrasserieBot GCP Infrastructure - Database Module Outputs

output "instance_id" {
  description = "The ID of the Cloud SQL instance"
  value       = google_sql_database_instance.instance.id
}

output "instance_name" {
  description = "The name of the Cloud SQL instance"
  value       = google_sql_database_instance.instance.name
}

output "instance_self_link" {
  description = "The self-link of the Cloud SQL instance"
  value       = google_sql_database_instance.instance.self_link
}

output "connection_name" {
  description = "The connection name of the Cloud SQL instance"
  value       = google_sql_database_instance.instance.connection_name
}

output "public_ip_address" {
  description = "The public IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.instance.public_ip_address
  sensitive   = true
}

output "private_ip_address" {
  description = "The private IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.instance.private_ip_address
  sensitive   = true
}

output "database_name" {
  description = "The name of the database"
  value       = google_sql_database.database.name
}

output "database_user" {
  description = "The name of the database user"
  value       = google_sql_user.user.name
}

output "service_account_email" {
  description = "The email of the database service account"
  value       = google_service_account.database_sa.email
}

output "password_secret_id" {
  description = "The ID of the Secret Manager secret for the database password"
  value       = google_secret_manager_secret.database_password.id
}

output "connection_secret_id" {
  description = "The ID of the Secret Manager secret for the database connection string"
  value       = google_secret_manager_secret.database_connection.id
}