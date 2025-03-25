# BrasserieBot GCP Infrastructure - Pub/Sub Module Variables

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "topics" {
  description = "The list of Pub/Sub topics to create"
  type        = list(string)
  default = [
    "order-events",
    "user-events",
    "system-events",
    "autodev-events"
  ]
}