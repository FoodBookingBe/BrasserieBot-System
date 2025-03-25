# BrasserieBot GCP Infrastructure - Storage Module Variables

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources"
  type        = string
}

variable "bucket_name" {
  description = "The base name for the storage buckets"
  type        = string
}

variable "cors_origins" {
  description = "The list of origins to allow CORS requests from"
  type        = list(string)
  default     = ["*"]
}