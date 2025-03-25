# BrasserieBot GCP Infrastructure - GKE Module Variables

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources"
  type        = string
}

variable "network_name" {
  description = "The name of the VPC network"
  type        = string
}

variable "subnet_name" {
  description = "The name of the subnet"
  type        = string
}

variable "cluster_name" {
  description = "The name of the GKE cluster"
  type        = string
}

variable "kubernetes_version" {
  description = "The Kubernetes version for the GKE cluster"
  type        = string
  default     = "latest"
}

variable "node_count" {
  description = "The number of nodes in the GKE cluster"
  type        = number
  default     = 3
}

variable "min_node_count" {
  description = "The minimum number of nodes in the GKE cluster"
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "The maximum number of nodes in the GKE cluster"
  type        = number
  default     = 5
}

variable "machine_type" {
  description = "The machine type for the GKE nodes"
  type        = string
  default     = "e2-standard-4"
}

variable "disk_size_gb" {
  description = "The disk size for the GKE nodes"
  type        = number
  default     = 100
}

variable "disk_type" {
  description = "The disk type for the GKE nodes"
  type        = string
  default     = "pd-standard"
}

variable "preemptible" {
  description = "Whether to use preemptible nodes"
  type        = bool
  default     = false
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

variable "master_authorized_networks" {
  description = "The list of CIDR blocks that can access the Kubernetes master"
  type = list(object({
    cidr_block   = string
    display_name = string
  }))
  default = []
}

variable "pod_security_policy_enabled" {
  description = "Whether to enable pod security policy"
  type        = bool
  default     = true
}

variable "release_channel" {
  description = "The release channel for the GKE cluster"
  type        = string
  default     = "REGULAR"
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "enable_workload_identity" {
  description = "Whether to enable workload identity"
  type        = bool
  default     = true
}