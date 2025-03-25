# BrasserieBot GCP Infrastructure - Network Module

# Create VPC network
resource "google_compute_network" "vpc_network" {
  name                    = var.network_name
  project                 = var.project_id
  auto_create_subnetworks = false
  routing_mode            = "GLOBAL"
}

# Create subnets
resource "google_compute_subnetwork" "subnets" {
  for_each                 = { for subnet in var.subnets : subnet.name => subnet }
  name                     = each.value.name
  project                  = var.project_id
  region                   = each.value.region
  network                  = google_compute_network.vpc_network.self_link
  ip_cidr_range            = each.value.ip_cidr_range
  private_ip_google_access = true

  dynamic "secondary_ip_range" {
    for_each = each.value.secondary_ip_ranges
    content {
      range_name    = secondary_ip_range.value.range_name
      ip_cidr_range = secondary_ip_range.value.ip_cidr_range
    }
  }
}

# Create Cloud Router for NAT gateway
resource "google_compute_router" "router" {
  name    = "${var.network_name}-router"
  project = var.project_id
  region  = var.region
  network = google_compute_network.vpc_network.self_link
}

# Create NAT gateway
resource "google_compute_router_nat" "nat" {
  name                               = "${var.network_name}-nat"
  project                            = var.project_id
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Create firewall rule for internal communication
resource "google_compute_firewall" "allow_internal" {
  name    = "${var.network_name}-allow-internal"
  project = var.project_id
  network = google_compute_network.vpc_network.self_link

  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "tcp"
  }

  allow {
    protocol = "udp"
  }

  source_ranges = [for subnet in var.subnets : subnet.ip_cidr_range]
}

# Create firewall rule for health checks
resource "google_compute_firewall" "allow_health_checks" {
  name    = "${var.network_name}-allow-health-checks"
  project = var.project_id
  network = google_compute_network.vpc_network.self_link

  allow {
    protocol = "tcp"
  }

  source_ranges = ["35.191.0.0/16", "130.211.0.0/22"]
}

# Create firewall rule for IAP access
resource "google_compute_firewall" "allow_iap" {
  name    = "${var.network_name}-allow-iap"
  project = var.project_id
  network = google_compute_network.vpc_network.self_link

  allow {
    protocol = "tcp"
    ports    = ["22", "3389"]
  }

  source_ranges = ["35.235.240.0/20"]
}

# Create VPC peering connection for Vertex AI
resource "google_compute_network_peering" "vertex_ai_peering" {
  name                 = "${var.network_name}-vertex-ai-peering"
  network              = google_compute_network.vpc_network.self_link
  peer_network         = "projects/${var.project_id}/global/networks/default"
  export_custom_routes = true
  import_custom_routes = true
}