# BrasserieBot GCP Infrastructure - Vertex AI Module

# Enable required APIs
resource "google_project_service" "aiplatform_api" {
  project = var.project_id
  service = "aiplatform.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

resource "google_project_service" "artifactregistry_api" {
  project = var.project_id
  service = "artifactregistry.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Create a service account for Vertex AI access
resource "google_service_account" "vertex_ai_sa" {
  project      = var.project_id
  account_id   = "vertex-ai-${var.project_id}-sa"
  display_name = "Vertex AI Service Account for ${var.project_id}"
}

# Grant required roles to the Vertex AI service account
resource "google_project_iam_member" "vertex_ai_sa_roles" {
  for_each = toset([
    "roles/aiplatform.user",
    "roles/storage.objectUser",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.vertex_ai_sa.email}"
}

# Create Artifact Registry repository for custom model containers
resource "google_artifact_registry_repository" "model_repository" {
  project       = var.project_id
  location      = var.region
  repository_id = "autodev-models"
  format        = "DOCKER"
  description   = "Docker repository for AutoDev custom models"

  depends_on = [
    google_project_service.artifactregistry_api
  ]
}

# Create Vertex AI Workbench instance for AutoDev development
resource "google_notebooks_instance" "autodev_workbench" {
  project      = var.project_id
  name         = "autodev-workbench"
  location     = var.zone
  machine_type = var.workbench_machine_type

  vm_image {
    project      = "deeplearning-platform-release"
    image_family = "tf-ent-2-9-cu113-notebooks"
  }

  install_gpu_driver = var.workbench_gpu_enabled

  accelerator_config {
    type       = var.workbench_gpu_enabled ? var.workbench_gpu_type : ""
    core_count = var.workbench_gpu_enabled ? var.workbench_gpu_count : 0
  }

  boot_disk_type    = "PD_SSD"
  boot_disk_size_gb = 100

  no_public_ip    = true
  no_proxy_access = false

  network = var.network_name
  subnet  = var.subnet_name

  service_account = google_service_account.vertex_ai_sa.email

  depends_on = [
    google_project_service.aiplatform_api
  ]
}

# Create Vertex AI Feature Store for AutoDev
resource "google_vertex_ai_featurestore" "autodev_featurestore" {
  provider = google-beta
  project  = var.project_id
  region   = var.region
  name     = "autodev-featurestore"

  online_serving_config {
    fixed_node_count = 1
  }

  depends_on = [
    google_project_service.aiplatform_api
  ]
}

# Create Vertex AI Feature Store EntityType for AutoDev knowledge base
resource "google_vertex_ai_featurestore_entitytype" "knowledge_base" {
  provider      = google-beta
  project       = var.project_id
  region        = var.region
  featurestore  = google_vertex_ai_featurestore.autodev_featurestore.name
  entity_type_id = "knowledge_base"

  monitoring_config {
    snapshot_analysis {
      disabled = false
      monitoring_interval = "86400s"  # 24 hours
    }
  }

  depends_on = [
    google_vertex_ai_featurestore.autodev_featurestore
  ]
}

# Create Vertex AI Endpoint for AutoDev agent
resource "google_vertex_ai_endpoint" "autodev_endpoint" {
  provider    = google-beta
  project     = var.project_id
  region      = var.region
  name        = "autodev-endpoint"
  description = "Endpoint for AutoDev agent"

  network     = var.network_name
  
  depends_on = [
    google_project_service.aiplatform_api
  ]
}

# Create Secret Manager secret for Claude API key
resource "google_secret_manager_secret" "claude_api_key" {
  project   = var.project_id
  secret_id = "claude-api-key"

  replication {
    automatic = true
  }

  depends_on = [
    google_project_service.secretmanager_api
  ]
}

# Store Claude API key in Secret Manager (placeholder, will be updated manually)
resource "google_secret_manager_secret_version" "claude_api_key" {
  secret      = google_secret_manager_secret.claude_api_key.id
  secret_data = var.claude_api_key != "" ? var.claude_api_key : "placeholder-replace-with-actual-key"
}

# Create Secret Manager secret for Pinecone API key
resource "google_secret_manager_secret" "pinecone_api_key" {
  project   = var.project_id
  secret_id = "pinecone-api-key"

  replication {
    automatic = true
  }

  depends_on = [
    google_project_service.secretmanager_api
  ]
}

# Store Pinecone API key in Secret Manager (placeholder, will be updated manually)
resource "google_secret_manager_secret_version" "pinecone_api_key" {
  secret      = google_secret_manager_secret.pinecone_api_key.id
  secret_data = var.pinecone_api_key != "" ? var.pinecone_api_key : "placeholder-replace-with-actual-key"
}

# Enable Secret Manager API
resource "google_project_service" "secretmanager_api" {
  project = var.project_id
  service = "secretmanager.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Grant access to the Claude API key secret to the Vertex AI service account
resource "google_secret_manager_secret_iam_member" "claude_api_key_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.claude_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.vertex_ai_sa.email}"
}

# Grant access to the Pinecone API key secret to the Vertex AI service account
resource "google_secret_manager_secret_iam_member" "pinecone_api_key_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.pinecone_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.vertex_ai_sa.email}"
}