# BrasserieBot GCP Infrastructure - Production Environment Backend Configuration

terraform {
  backend "gcs" {
    bucket = "brasserie-bot-terraform-state-prod"
    prefix = "terraform/state"
  }
}