# BrasserieBot GCP Infrastructure - Production Environment Configuration

project_id               = "brasserie-bot-prod"
region                   = "europe-west1"
network_name             = "brasserie-bot-network-prod"
cluster_name             = "brasserie-bot-cluster-prod"
node_count               = 3
machine_type             = "e2-standard-4"
kubernetes_version       = "1.28"
enable_private_endpoint  = true
master_ipv4_cidr_block   = "172.16.0.0/28"
database_instance_name   = "brasserie-bot-db-prod"
database_version         = "POSTGRES_14"
database_tier            = "db-custom-2-7680"
database_name            = "brasseriebot"
database_user            = "brasseriebot"
firestore_location       = "europe-west1"
storage_bucket_name      = "brasserie-bot-assets-prod"
environment              = "prod"

# Subnet configuration for production
subnets = [
  {
    name          = "brasserie-bot-subnet-prod"
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

# Pub/Sub topics for production
pubsub_topics = [
  "order-events",
  "user-events",
  "system-events",
  "autodev-events",
  "monitoring-events",
  "deployment-events"
]