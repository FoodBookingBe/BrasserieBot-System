# BrasserieBot GCP Infrastructure - Vertex AI Module Variables

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources"
  type        = string
}

variable "zone" {
  description = "The GCP zone to deploy resources"
  type        = string
  default     = "europe-west1-b"
}

variable "network_name" {
  description = "The name of the VPC network"
  type        = string
  default     = ""
}

variable "subnet_name" {
  description = "The name of the subnet"
  type        = string
  default     = ""
}

variable "workbench_machine_type" {
  description = "The machine type for the Vertex AI Workbench instance"
  type        = string
  default     = "n1-standard-4"
}

variable "workbench_gpu_enabled" {
  description = "Whether to enable GPU for the Vertex AI Workbench instance"
  type        = bool
  default     = false
}

variable "workbench_gpu_type" {
  description = "The GPU type for the Vertex AI Workbench instance"
  type        = string
  default     = "NVIDIA_TESLA_T4"
}

variable "workbench_gpu_count" {
  description = "The number of GPUs for the Vertex AI Workbench instance"
  type        = number
  default     = 1
}

variable "claude_api_key" {
  description = "The API key for Claude AI"
  type        = string
  default     = ""
  sensitive   = true
}

variable "pinecone_api_key" {
  description = "The API key for Pinecone vector database"
  type        = string
  default     = ""
  sensitive   = true
}