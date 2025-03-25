# BrasserieBot GCP Infrastructure - Main Terraform Configuration

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  backend "gcs" {
    # This will be configured per environment
    # bucket = "brasserie-bot-terraform-state"
    # prefix = "terraform/state"
  }
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Kubernetes provider configuration - will be configured after GKE cluster is created
provider "kubernetes" {
  host                   = module.gke.cluster_endpoint
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(module.gke.cluster_ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = module.gke.cluster_endpoint
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(module.gke.cluster_ca_certificate)
  }
}

# Get current client configuration
data "google_client_config" "default" {}

# Network module
module "network" {
  source       = "./modules/network"
  project_id   = var.project_id
  region       = var.region
  network_name = var.network_name
  subnets      = var.subnets
}

# GKE module
module "gke" {
  source                   = "./modules/gke"
  project_id               = var.project_id
  region                   = var.region
  network_name             = module.network.network_name
  subnet_name              = module.network.subnet_names[0]
  cluster_name             = var.cluster_name
  node_count               = var.node_count
  machine_type             = var.machine_type
  kubernetes_version       = var.kubernetes_version
  enable_private_endpoint  = var.enable_private_endpoint
  master_ipv4_cidr_block   = var.master_ipv4_cidr_block
  enable_workload_identity = true
  depends_on               = [module.network]
}

# Cloud SQL module
module "cloudsql" {
  source                 = "./modules/database"
  project_id             = var.project_id
  region                 = var.region
  network_id             = module.network.network_id
  database_instance_name = var.database_instance_name
  database_version       = var.database_version
  database_tier          = var.database_tier
  database_name          = var.database_name
  database_user          = var.database_user
  enable_private_ip      = true
  availability_type      = "REGIONAL"  # High availability
  depends_on             = [module.network]
}

# Firestore module
module "firestore" {
  source     = "./modules/firestore"
  project_id = var.project_id
  location   = var.firestore_location
}

# Storage module
module "storage" {
  source      = "./modules/storage"
  project_id  = var.project_id
  region      = var.region
  bucket_name = var.storage_bucket_name
}

# Pub/Sub module
module "pubsub" {
  source     = "./modules/pubsub"
  project_id = var.project_id
  topics     = var.pubsub_topics
}

# IAM module
module "iam" {
  source     = "./modules/iam"
  project_id = var.project_id
  cluster_id = module.gke.cluster_id
  depends_on = [module.gke]
}

# Vertex AI module
module "vertex_ai" {
  source     = "./modules/vertex-ai"
  project_id = var.project_id
  region     = var.region
}

# Monitoring module
module "monitoring" {
  source     = "./modules/monitoring"
  project_id = var.project_id
}

# Outputs
output "kubernetes_cluster_name" {
  value = module.gke.cluster_name
}

output "kubernetes_cluster_endpoint" {
  value     = module.gke.cluster_endpoint
  sensitive = true
}

output "database_connection_name" {
  value     = module.cloudsql.connection_name
  sensitive = true
}

output "database_private_ip" {
  value     = module.cloudsql.private_ip_address
  sensitive = true
}

output "storage_bucket_url" {
  value = module.storage.bucket_url
}