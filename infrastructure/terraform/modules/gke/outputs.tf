# BrasserieBot GCP Infrastructure - GKE Module Outputs

output "cluster_id" {
  description = "The ID of the GKE cluster"
  value       = google_container_cluster.primary.id
}

output "cluster_name" {
  description = "The name of the GKE cluster"
  value       = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  description = "The endpoint of the GKE cluster"
  value       = google_container_cluster.primary.endpoint
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "The CA certificate of the GKE cluster"
  value       = google_container_cluster.primary.master_auth[0].cluster_ca_certificate
  sensitive   = true
}

output "cluster_location" {
  description = "The location of the GKE cluster"
  value       = google_container_cluster.primary.location
}

output "cluster_self_link" {
  description = "The self-link of the GKE cluster"
  value       = google_container_cluster.primary.self_link
}

output "node_pool_id" {
  description = "The ID of the GKE node pool"
  value       = google_container_node_pool.primary_nodes.id
}

output "node_pool_name" {
  description = "The name of the GKE node pool"
  value       = google_container_node_pool.primary_nodes.name
}

output "service_account_email" {
  description = "The email of the GKE service account"
  value       = google_service_account.gke_sa.email
}

output "service_account_id" {
  description = "The ID of the GKE service account"
  value       = google_service_account.gke_sa.id
}

output "kms_key_id" {
  description = "The ID of the KMS key used for database encryption"
  value       = google_kms_crypto_key.crypto_key.id
}

output "bigquery_dataset_id" {
  description = "The ID of the BigQuery dataset used for resource usage export"
  value       = google_bigquery_dataset.gke_dataset.id
}