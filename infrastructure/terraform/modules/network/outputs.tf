# BrasserieBot GCP Infrastructure - Network Module Outputs

output "network_id" {
  description = "The ID of the VPC network"
  value       = google_compute_network.vpc_network.id
}

output "network_name" {
  description = "The name of the VPC network"
  value       = google_compute_network.vpc_network.name
}

output "network_self_link" {
  description = "The self-link of the VPC network"
  value       = google_compute_network.vpc_network.self_link
}

output "subnet_ids" {
  description = "The IDs of the subnets"
  value       = { for name, subnet in google_compute_subnetwork.subnets : name => subnet.id }
}

output "subnet_names" {
  description = "The names of the subnets"
  value       = [for subnet in google_compute_subnetwork.subnets : subnet.name]
}

output "subnet_self_links" {
  description = "The self-links of the subnets"
  value       = { for name, subnet in google_compute_subnetwork.subnets : name => subnet.self_link }
}

output "subnet_secondary_ranges" {
  description = "The secondary IP ranges of the subnets"
  value = {
    for name, subnet in google_compute_subnetwork.subnets : name => {
      for range in subnet.secondary_ip_range : range.range_name => range.ip_cidr_range
    }
  }
}

output "router_id" {
  description = "The ID of the Cloud Router"
  value       = google_compute_router.router.id
}

output "nat_id" {
  description = "The ID of the Cloud NAT"
  value       = google_compute_router_nat.nat.id
}