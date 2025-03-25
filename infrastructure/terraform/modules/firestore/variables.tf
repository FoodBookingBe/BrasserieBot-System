# BrasserieBot GCP Infrastructure - Firestore Module Variables

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "location" {
  description = "The location for Firestore"
  type        = string
  default     = "europe-west1"
}