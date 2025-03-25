# BrasserieBot GCP Infrastructure - Vertex AI Module Outputs

output "service_account_email" {
  description = "The email of the Vertex AI service account"
  value       = google_service_account.vertex_ai_sa.email
}

output "service_account_id" {
  description = "The ID of the Vertex AI service account"
  value       = google_service_account.vertex_ai_sa.id
}

output "model_repository_id" {
  description = "The ID of the Artifact Registry repository for custom model containers"
  value       = google_artifact_registry_repository.model_repository.id
}

output "model_repository_name" {
  description = "The name of the Artifact Registry repository for custom model containers"
  value       = google_artifact_registry_repository.model_repository.name
}

output "workbench_instance_id" {
  description = "The ID of the Vertex AI Workbench instance"
  value       = google_notebooks_instance.autodev_workbench.id
}

output "workbench_instance_name" {
  description = "The name of the Vertex AI Workbench instance"
  value       = google_notebooks_instance.autodev_workbench.name
}

output "featurestore_id" {
  description = "The ID of the Vertex AI Feature Store"
  value       = google_vertex_ai_featurestore.autodev_featurestore.id
}

output "featurestore_name" {
  description = "The name of the Vertex AI Feature Store"
  value       = google_vertex_ai_featurestore.autodev_featurestore.name
}

output "knowledge_base_id" {
  description = "The ID of the Vertex AI Feature Store EntityType for knowledge base"
  value       = google_vertex_ai_featurestore_entitytype.knowledge_base.id
}

output "knowledge_base_name" {
  description = "The name of the Vertex AI Feature Store EntityType for knowledge base"
  value       = google_vertex_ai_featurestore_entitytype.knowledge_base.entity_type_id
}

output "endpoint_id" {
  description = "The ID of the Vertex AI Endpoint for AutoDev agent"
  value       = google_vertex_ai_endpoint.autodev_endpoint.id
}

output "endpoint_name" {
  description = "The name of the Vertex AI Endpoint for AutoDev agent"
  value       = google_vertex_ai_endpoint.autodev_endpoint.name
}

output "claude_api_key_secret_id" {
  description = "The ID of the Secret Manager secret for the Claude API key"
  value       = google_secret_manager_secret.claude_api_key.id
}

output "pinecone_api_key_secret_id" {
  description = "The ID of the Secret Manager secret for the Pinecone API key"
  value       = google_secret_manager_secret.pinecone_api_key.id
}