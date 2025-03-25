# BrasserieBot GCP Infrastructure - Terraform Variables

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources"
  type        = string
  default     = "europe-west1"
}

variable "network_name" {
  description = "The name of the VPC network"
  type        = string
  default     = "brasserie-bot-network"
}

variable "subnets" {
  description = "The list of subnets to create"
  type = list(object({
    name          = string
    ip_cidr_range = string
    region        = string
    secondary_ip_ranges = list(object({
      range_name    = string
      ip_cidr_range = string
    }))
  }))
  default = [
    {
      name          = "brasserie-bot-subnet"
      ip_cidr_range = "10.0.0.0/20"
      region        = "europe-west1"
      secondary_ip_ranges = [
        {
          range_name    = "pods"
          ip_cidr_range = "10.16.0.0/14"
        },
        {
          range_name    = "services"
          ip_cidr_range = "10.20.0.0/20"
        }
      ]
    }
  ]
}

variable "cluster_name" {
  description = "The name of the GKE cluster"
  type        = string
  default     = "brasserie-bot-cluster"
}

variable "node_count" {
  description = "The number of nodes in the GKE cluster"
  type        = number
  default     = 3
}

variable "machine_type" {
  description = "The machine type for the GKE nodes"
  type        = string
  default     = "e2-standard-4"
}

variable "kubernetes_version" {
  description = "The Kubernetes version for the GKE cluster"
  type        = string
  default     = "latest"
}

variable "enable_private_endpoint" {
  description = "Whether to enable private endpoint for the GKE cluster"
  type        = bool
  default     = true
}

variable "master_ipv4_cidr_block" {
  description = "The IP range for the GKE master"
  type        = string
  default     = "172.16.0.0/28"
}

variable "database_instance_name" {
  description = "The name of the Cloud SQL instance"
  type        = string
  default     = "brasserie-bot-db"
}

variable "database_version" {
  description = "The database version for Cloud SQL"
  type        = string
  default     = "POSTGRES_14"
}

variable "database_tier" {
  description = "The machine tier for Cloud SQL"
  type        = string
  default     = "db-custom-2-7680"  # 2 vCPUs, 7.5 GB RAM
}

variable "database_name" {
  description = "The name of the database to create"
  type        = string
  default     = "brasseriebot"
}

variable "database_user" {
  description = "The name of the database user to create"
  type        = string
  default     = "brasseriebot"
}

variable "firestore_location" {
  description = "The location for Firestore"
  type        = string
  default     = "europe-west1"
}

variable "storage_bucket_name" {
  description = "The name of the storage bucket"
  type        = string
  default     = "brasserie-bot-assets"
}

variable "pubsub_topics" {
  description = "The list of Pub/Sub topics to create"
  type        = list(string)
  default = [
    "order-events",
    "user-events",
    "system-events",
    "autodev-events"
  ]
}

variable "pinecone_api_key" {
  description = "The API key for Pinecone vector database"
  type        = string
  sensitive   = true
}

variable "claude_api_key" {
  description = "The API key for Claude AI"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}