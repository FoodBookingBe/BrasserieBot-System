# BrasserieBot GCP Infrastructure - Database Module Variables

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources"
  type        = string
}

variable "network_id" {
  description = "The ID of the VPC network"
  type        = string
}

variable "database_instance_name" {
  description = "The name of the Cloud SQL instance"
  type        = string
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

variable "enable_private_ip" {
  description = "Whether to enable private IP for the Cloud SQL instance"
  type        = bool
  default     = true
}

variable "availability_type" {
  description = "The availability type for the Cloud SQL instance (REGIONAL or ZONAL)"
  type        = string
  default     = "REGIONAL"
}

variable "disk_size" {
  description = "The disk size for the Cloud SQL instance in GB"
  type        = number
  default     = 100
}

variable "disk_type" {
  description = "The disk type for the Cloud SQL instance (PD_SSD or PD_HDD)"
  type        = string
  default     = "PD_SSD"
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}