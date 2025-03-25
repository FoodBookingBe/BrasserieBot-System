# BrasserieBot GCP Infrastructure - GKE Module

# Create GKE cluster
resource "google_container_cluster" "primary" {
  name                     = var.cluster_name
  project                  = var.project_id
  location                 = var.region
  remove_default_node_pool = true
  initial_node_count       = 1
  networking_mode          = "VPC_NATIVE"
  network                  = var.network_name
  subnetwork               = var.subnet_name
  min_master_version       = var.kubernetes_version == "latest" ? null : var.kubernetes_version

  # Enable Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Enable private cluster
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = var.enable_private_endpoint
    master_ipv4_cidr_block  = var.master_ipv4_cidr_block
  }

  # Configure IP allocation policy for VPC-native cluster
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  # Configure master authorized networks
  master_authorized_networks_config {
    dynamic "cidr_blocks" {
      for_each = var.master_authorized_networks
      content {
        cidr_block   = cidr_blocks.value.cidr_block
        display_name = cidr_blocks.value.display_name
      }
    }
  }

  # Configure network policy
  network_policy {
    enabled  = true
    provider = "CALICO"
  }

  # Configure pod security policy
  pod_security_policy_config {
    enabled = var.pod_security_policy_enabled
  }

  # Configure binary authorization
  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }

  # Configure release channel
  release_channel {
    channel = var.release_channel
  }

  # Configure maintenance policy
  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"
    }
  }

  # Configure cluster autoscaling
  cluster_autoscaling {
    enabled = true
    resource_limits {
      resource_type = "cpu"
      minimum       = 1
      maximum       = 32
    }
    resource_limits {
      resource_type = "memory"
      minimum       = 1
      maximum       = 128
    }
  }

  # Configure vertical pod autoscaling
  vertical_pod_autoscaling {
    enabled = true
  }

  # Configure logging and monitoring
  logging_service    = "logging.googleapis.com/kubernetes"
  monitoring_service = "monitoring.googleapis.com/kubernetes"

  # Configure addons
  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
    network_policy_config {
      disabled = false
    }
    gcp_filestore_csi_driver_config {
      enabled = true
    }
    gce_persistent_disk_csi_driver_config {
      enabled = true
    }
    dns_cache_config {
      enabled = true
    }
  }

  # Configure node config defaults
  node_config {
    # Empty placeholder for default node pool that will be removed
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }

  # Configure database encryption
  database_encryption {
    state    = "ENCRYPTED"
    key_name = google_kms_crypto_key.crypto_key.id
  }

  # Configure resource usage export
  resource_usage_export_config {
    enable_network_egress_metering = true
    enable_resource_consumption_metering = true
    
    bigquery_destination {
      dataset_id = google_bigquery_dataset.gke_dataset.dataset_id
    }
  }

  depends_on = [
    google_kms_crypto_key_iam_binding.crypto_key_binding,
    google_project_service.container_api
  ]

  lifecycle {
    ignore_changes = [
      node_config,
    ]
  }
}

# Create node pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.cluster_name}-node-pool"
  project    = var.project_id
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = var.node_count

  # Configure auto-scaling
  autoscaling {
    min_node_count = var.min_node_count
    max_node_count = var.max_node_count
  }

  # Configure auto-upgrade
  management {
    auto_repair  = true
    auto_upgrade = true
  }

  # Configure node
  node_config {
    preemptible  = var.preemptible
    machine_type = var.machine_type
    disk_size_gb = var.disk_size_gb
    disk_type    = var.disk_type

    # Google recommends custom service accounts with minimal permissions
    service_account = google_service_account.gke_sa.email

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    # Enable workload identity on the node pool
    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    # Apply labels to nodes
    labels = {
      environment = var.environment
    }

    # Apply tags to nodes
    tags = ["gke-node", var.cluster_name]

    # Configure shielded nodes
    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }
  }

  depends_on = [
    google_container_cluster.primary
  ]
}

# Create service account for GKE nodes
resource "google_service_account" "gke_sa" {
  project      = var.project_id
  account_id   = "gke-${var.cluster_name}-sa"
  display_name = "GKE Service Account for ${var.cluster_name}"
}

# Grant required roles to the GKE service account
resource "google_project_iam_member" "gke_sa_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/stackdriver.resourceMetadata.writer",
    "roles/storage.objectViewer",
    "roles/artifactregistry.reader"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.gke_sa.email}"
}

# Enable required APIs
resource "google_project_service" "container_api" {
  project = var.project_id
  service = "container.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Create KMS key for GKE database encryption
resource "google_kms_key_ring" "key_ring" {
  project  = var.project_id
  name     = "${var.cluster_name}-keyring"
  location = var.region
}

resource "google_kms_crypto_key" "crypto_key" {
  name     = "${var.cluster_name}-key"
  key_ring = google_kms_key_ring.key_ring.id
  purpose  = "ENCRYPT_DECRYPT"

  version_template {
    algorithm = "GOOGLE_SYMMETRIC_ENCRYPTION"
  }

  lifecycle {
    prevent_destroy = false
  }
}

# Grant GKE service account access to the KMS key
resource "google_kms_crypto_key_iam_binding" "crypto_key_binding" {
  crypto_key_id = google_kms_crypto_key.crypto_key.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  members = [
    "serviceAccount:service-${data.google_project.project.number}@container-engine-robot.iam.gserviceaccount.com"
  ]
}

# Get project information
data "google_project" "project" {
  project_id = var.project_id
}

# Create BigQuery dataset for GKE resource usage export
resource "google_bigquery_dataset" "gke_dataset" {
  project    = var.project_id
  dataset_id = "gke_resource_usage_${replace(var.cluster_name, "-", "_")}"
  location   = var.region

  access {
    role          = "OWNER"
    special_group = "projectOwners"
  }

  access {
    role          = "WRITER"
    user_by_email = "service-${data.google_project.project.number}@container-engine-robot.iam.gserviceaccount.com"
  }
}