# BrasserieBot GCP Infrastructure - Pub/Sub Module

# Enable required APIs
resource "google_project_service" "pubsub_api" {
  project = var.project_id
  service = "pubsub.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Create a service account for Pub/Sub access
resource "google_service_account" "pubsub_sa" {
  project      = var.project_id
  account_id   = "pubsub-${var.project_id}-sa"
  display_name = "Pub/Sub Service Account for ${var.project_id}"
}

# Grant required roles to the Pub/Sub service account
resource "google_project_iam_member" "pubsub_sa_roles" {
  for_each = toset([
    "roles/pubsub.publisher",
    "roles/pubsub.subscriber",
    "roles/pubsub.viewer"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.pubsub_sa.email}"
}

# Create Pub/Sub topics
resource "google_pubsub_topic" "topics" {
  for_each = toset(var.topics)
  
  name    = each.value
  project = var.project_id

  message_retention_duration = "604800s"  # 7 days

  depends_on = [
    google_project_service.pubsub_api
  ]
}

# Create dead-letter topics for each main topic
resource "google_pubsub_topic" "dead_letter_topics" {
  for_each = toset(var.topics)
  
  name    = "${each.value}-dead-letter"
  project = var.project_id

  message_retention_duration = "604800s"  # 7 days

  depends_on = [
    google_project_service.pubsub_api
  ]
}

# Create default subscriptions for each topic
resource "google_pubsub_subscription" "default_subscriptions" {
  for_each = toset(var.topics)
  
  name    = "${each.value}-default-sub"
  topic   = google_pubsub_topic.topics[each.value].name
  project = var.project_id

  message_retention_duration = "604800s"  # 7 days
  retain_acked_messages      = true
  ack_deadline_seconds       = 20

  expiration_policy {
    ttl = ""  # Never expire
  }

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"  # 10 minutes
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter_topics[each.value].id
    max_delivery_attempts = 5
  }

  depends_on = [
    google_pubsub_topic.topics,
    google_pubsub_topic.dead_letter_topics
  ]
}

# Create dead-letter subscriptions for each dead-letter topic
resource "google_pubsub_subscription" "dead_letter_subscriptions" {
  for_each = toset(var.topics)
  
  name    = "${each.value}-dead-letter-sub"
  topic   = google_pubsub_topic.dead_letter_topics[each.value].name
  project = var.project_id

  message_retention_duration = "1209600s"  # 14 days
  retain_acked_messages      = true
  ack_deadline_seconds       = 20

  expiration_policy {
    ttl = ""  # Never expire
  }

  depends_on = [
    google_pubsub_topic.dead_letter_topics
  ]
}

# Create specific subscriptions for AutoDev events
resource "google_pubsub_subscription" "autodev_events_subscription" {
  count   = contains(var.topics, "autodev-events") ? 1 : 0
  
  name    = "autodev-events-processor-sub"
  topic   = google_pubsub_topic.topics["autodev-events"].name
  project = var.project_id

  message_retention_duration = "604800s"  # 7 days
  retain_acked_messages      = true
  ack_deadline_seconds       = 60  # Longer processing time for AutoDev events

  expiration_policy {
    ttl = ""  # Never expire
  }

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"  # 10 minutes
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter_topics["autodev-events"].id
    max_delivery_attempts = 5
  }

  depends_on = [
    google_pubsub_topic.topics,
    google_pubsub_topic.dead_letter_topics
  ]
}

# Create IAM policy for each topic
resource "google_pubsub_topic_iam_binding" "topic_publisher" {
  for_each = toset(var.topics)
  
  project = var.project_id
  topic   = google_pubsub_topic.topics[each.value].name
  role    = "roles/pubsub.publisher"
  members = [
    "serviceAccount:${google_service_account.pubsub_sa.email}"
  ]
}

# Create IAM policy for each subscription
resource "google_pubsub_subscription_iam_binding" "subscription_subscriber" {
  for_each = toset(var.topics)
  
  project      = var.project_id
  subscription = google_pubsub_subscription.default_subscriptions[each.value].name
  role         = "roles/pubsub.subscriber"
  members = [
    "serviceAccount:${google_service_account.pubsub_sa.email}"
  ]
}