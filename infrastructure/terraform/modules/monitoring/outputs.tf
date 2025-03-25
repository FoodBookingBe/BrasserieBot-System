# BrasserieBot GCP Infrastructure - Monitoring Module Outputs

output "service_account_email" {
  description = "The email of the monitoring service account"
  value       = google_service_account.monitoring_sa.email
}

output "service_account_id" {
  description = "The ID of the monitoring service account"
  value       = google_service_account.monitoring_sa.id
}

output "notification_channels" {
  description = "The IDs of the notification channels"
  value       = [for channel in google_monitoring_notification_channel.email : channel.id]
}

output "alert_policies" {
  description = "The IDs of the alert policies"
  value = {
    high_cpu_usage     = google_monitoring_alert_policy.high_cpu_usage.id
    high_memory_usage  = google_monitoring_alert_policy.high_memory_usage.id
    high_error_rate    = google_monitoring_alert_policy.high_error_rate.id
    database_high_cpu  = google_monitoring_alert_policy.database_high_cpu.id
    autodev_error      = google_monitoring_alert_policy.autodev_error.id
  }
}

output "log_metrics" {
  description = "The names of the log-based metrics"
  value = {
    autodev_task_completion      = google_logging_metric.autodev_task_completion.name
    autodev_knowledge_base_updates = google_logging_metric.autodev_knowledge_base_updates.name
  }
}

output "autodev_dashboard_id" {
  description = "The ID of the AutoDev dashboard"
  value       = google_monitoring_dashboard.autodev_dashboard.id
}

output "autodev_dashboard_name" {
  description = "The name of the AutoDev dashboard"
  value       = google_monitoring_dashboard.autodev_dashboard.dashboard_json
}

output "logs_dataset_id" {
  description = "The ID of the BigQuery dataset for logs"
  value       = google_bigquery_dataset.logs_dataset.id
}

output "logs_sink_id" {
  description = "The ID of the log sink"
  value       = google_logging_project_sink.bigquery_sink.id
}

output "logs_sink_destination" {
  description = "The destination of the log sink"
  value       = google_logging_project_sink.bigquery_sink.destination
}

output "datadog_channel_id" {
  description = "The ID of the Datadog notification channel"
  value       = var.enable_datadog ? google_monitoring_notification_channel.datadog[0].id : null
}