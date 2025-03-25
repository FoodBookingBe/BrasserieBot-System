# BrasserieBot GCP Infrastructure - Monitoring Module Variables

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources"
  type        = string
}

variable "cluster_name" {
  description = "The name of the GKE cluster"
  type        = string
  default     = "brasserie-bot-cluster"
}

variable "notification_email_addresses" {
  description = "The list of email addresses to send notifications to"
  type        = list(string)
  default     = ["admin@example.com"]
}

variable "enable_datadog" {
  description = "Whether to enable Datadog integration"
  type        = bool
  default     = false
}