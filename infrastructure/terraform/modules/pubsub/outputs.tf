# BrasserieBot GCP Infrastructure - Pub/Sub Module Outputs

output "topic_ids" {
  description = "The IDs of the Pub/Sub topics"
  value       = { for name, topic in google_pubsub_topic.topics : name => topic.id }
}

output "topic_names" {
  description = "The names of the Pub/Sub topics"
  value       = { for name, topic in google_pubsub_topic.topics : name => topic.name }
}

output "dead_letter_topic_ids" {
  description = "The IDs of the Pub/Sub dead-letter topics"
  value       = { for name, topic in google_pubsub_topic.dead_letter_topics : name => topic.id }
}

output "dead_letter_topic_names" {
  description = "The names of the Pub/Sub dead-letter topics"
  value       = { for name, topic in google_pubsub_topic.dead_letter_topics : name => topic.name }
}

output "subscription_ids" {
  description = "The IDs of the Pub/Sub subscriptions"
  value       = { for name, subscription in google_pubsub_subscription.default_subscriptions : name => subscription.id }
}

output "subscription_names" {
  description = "The names of the Pub/Sub subscriptions"
  value       = { for name, subscription in google_pubsub_subscription.default_subscriptions : name => subscription.name }
}

output "dead_letter_subscription_ids" {
  description = "The IDs of the Pub/Sub dead-letter subscriptions"
  value       = { for name, subscription in google_pubsub_subscription.dead_letter_subscriptions : name => subscription.id }
}

output "dead_letter_subscription_names" {
  description = "The names of the Pub/Sub dead-letter subscriptions"
  value       = { for name, subscription in google_pubsub_subscription.dead_letter_subscriptions : name => subscription.name }
}

output "service_account_email" {
  description = "The email of the Pub/Sub service account"
  value       = google_service_account.pubsub_sa.email
}

output "service_account_id" {
  description = "The ID of the Pub/Sub service account"
  value       = google_service_account.pubsub_sa.id
}