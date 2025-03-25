# BrasserieBot GCP Infrastructure - Network Module Variables

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
}