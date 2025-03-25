# BrasserieBot GCP Infrastructure - Monitoring Module

# Enable required APIs
resource "google_project_service" "monitoring_api" {
  project = var.project_id
  service = "monitoring.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

resource "google_project_service" "logging_api" {
  project = var.project_id
  service = "logging.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Create a service account for monitoring
resource "google_service_account" "monitoring_sa" {
  project      = var.project_id
  account_id   = "monitoring-${var.project_id}-sa"
  display_name = "Monitoring Service Account for ${var.project_id}"
}

# Grant required roles to the monitoring service account
resource "google_project_iam_member" "monitoring_sa_roles" {
  for_each = toset([
    "roles/monitoring.admin",
    "roles/logging.admin",
    "roles/monitoring.metricWriter",
    "roles/logging.logWriter"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.monitoring_sa.email}"
}

# Create monitoring notification channels
resource "google_monitoring_notification_channel" "email" {
  for_each = toset(var.notification_email_addresses)

  project      = var.project_id
  display_name = "Email Notification Channel - ${each.value}"
  type         = "email"
  
  labels = {
    email_address = each.value
  }

  depends_on = [
    google_project_service.monitoring_api
  ]
}

# Create alert policies for critical services
resource "google_monitoring_alert_policy" "high_cpu_usage" {
  project      = var.project_id
  display_name = "High CPU Usage"
  combiner     = "OR"
  
  conditions {
    display_name = "CPU usage above 80%"
    
    condition_threshold {
      filter          = "resource.type = \"k8s_container\" AND metric.type = \"kubernetes.io/container/cpu/limit_utilization\" AND resource.labels.cluster_name = \"${var.cluster_name}\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.8
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [for channel in google_monitoring_notification_channel.email : channel.id]

  documentation {
    content   = "CPU usage is above 80% for more than 1 minute. Please check the affected services."
    mime_type = "text/markdown"
  }

  depends_on = [
    google_project_service.monitoring_api
  ]
}

resource "google_monitoring_alert_policy" "high_memory_usage" {
  project      = var.project_id
  display_name = "High Memory Usage"
  combiner     = "OR"
  
  conditions {
    display_name = "Memory usage above 80%"
    
    condition_threshold {
      filter          = "resource.type = \"k8s_container\" AND metric.type = \"kubernetes.io/container/memory/limit_utilization\" AND resource.labels.cluster_name = \"${var.cluster_name}\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.8
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [for channel in google_monitoring_notification_channel.email : channel.id]

  documentation {
    content   = "Memory usage is above 80% for more than 1 minute. Please check the affected services."
    mime_type = "text/markdown"
  }

  depends_on = [
    google_project_service.monitoring_api
  ]
}

resource "google_monitoring_alert_policy" "high_error_rate" {
  project      = var.project_id
  display_name = "High Error Rate"
  combiner     = "OR"
  
  conditions {
    display_name = "Error rate above 5%"
    
    condition_threshold {
      filter          = "resource.type = \"k8s_service\" AND metric.type = \"kubernetes.io/service/network/http_error_rate\" AND resource.labels.cluster_name = \"${var.cluster_name}\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [for channel in google_monitoring_notification_channel.email : channel.id]

  documentation {
    content   = "HTTP error rate is above 5% for more than 1 minute. Please check the affected services."
    mime_type = "text/markdown"
  }

  depends_on = [
    google_project_service.monitoring_api
  ]
}

resource "google_monitoring_alert_policy" "database_high_cpu" {
  project      = var.project_id
  display_name = "Database High CPU Usage"
  combiner     = "OR"
  
  conditions {
    display_name = "Database CPU usage above 70%"
    
    condition_threshold {
      filter          = "resource.type = \"cloudsql_database\" AND metric.type = \"cloudsql.googleapis.com/database/cpu/utilization\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.7
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [for channel in google_monitoring_notification_channel.email : channel.id]

  documentation {
    content   = "Database CPU usage is above 70% for more than 5 minutes. Please check the database performance."
    mime_type = "text/markdown"
  }

  depends_on = [
    google_project_service.monitoring_api
  ]
}

resource "google_monitoring_alert_policy" "autodev_error" {
  project      = var.project_id
  display_name = "AutoDev System Errors"
  combiner     = "OR"
  
  conditions {
    display_name = "AutoDev system error logs"
    
    condition_threshold {
      filter          = "resource.type = \"k8s_container\" AND resource.labels.container_name = \"autodev\" AND severity >= ERROR"
      duration        = "0s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_COUNT"
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [for channel in google_monitoring_notification_channel.email : channel.id]

  documentation {
    content   = "AutoDev system has reported errors. Please check the logs for more details."
    mime_type = "text/markdown"
  }

  depends_on = [
    google_project_service.monitoring_api,
    google_project_service.logging_api
  ]
}

# Create log-based metrics for AutoDev system
resource "google_logging_metric" "autodev_task_completion" {
  name        = "autodev_task_completion"
  project     = var.project_id
  description = "Count of completed tasks by the AutoDev system"
  filter      = "resource.type = \"k8s_container\" AND resource.labels.container_name = \"autodev\" AND jsonPayload.event = \"task_completed\""
  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    labels {
      key         = "task_type"
      value_type  = "STRING"
      description = "Type of task completed"
    }
    labels {
      key         = "status"
      value_type  = "STRING"
      description = "Status of task completion"
    }
  }
  label_extractors = {
    "task_type" = "EXTRACT(jsonPayload.task_type)"
    "status"    = "EXTRACT(jsonPayload.status)"
  }
  depends_on = [
    google_project_service.logging_api
  ]
}

resource "google_logging_metric" "autodev_knowledge_base_updates" {
  name        = "autodev_knowledge_base_updates"
  project     = var.project_id
  description = "Count of knowledge base updates by the AutoDev system"
  filter      = "resource.type = \"k8s_container\" AND resource.labels.container_name = \"autodev\" AND jsonPayload.event = \"knowledge_base_updated\""
  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    labels {
      key         = "update_type"
      value_type  = "STRING"
      description = "Type of knowledge base update"
    }
  }
  label_extractors = {
    "update_type" = "EXTRACT(jsonPayload.update_type)"
  }
  depends_on = [
    google_project_service.logging_api
  ]
}

# Create custom dashboard for AutoDev system
resource "google_monitoring_dashboard" "autodev_dashboard" {
  project        = var.project_id
  dashboard_json = <<EOF
{
  "displayName": "AutoDev System Dashboard",
  "gridLayout": {
    "widgets": [
      {
        "title": "AutoDev Task Completion",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"logging.googleapis.com/user/autodev_task_completion\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_RATE"
                  },
                  "secondaryAggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_MEAN"
                  }
                },
                "unitOverride": "1"
              },
              "plotType": "LINE"
            }
          ],
          "timeshiftDuration": "0s",
          "yAxis": {
            "label": "Tasks per minute",
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "AutoDev Knowledge Base Updates",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"logging.googleapis.com/user/autodev_knowledge_base_updates\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_RATE"
                  },
                  "secondaryAggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_MEAN"
                  }
                },
                "unitOverride": "1"
              },
              "plotType": "LINE"
            }
          ],
          "timeshiftDuration": "0s",
          "yAxis": {
            "label": "Updates per minute",
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "AutoDev System Errors",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type = \"k8s_container\" AND resource.labels.container_name = \"autodev\" AND severity >= ERROR",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_COUNT"
                  }
                },
                "unitOverride": "1"
              },
              "plotType": "LINE"
            }
          ],
          "timeshiftDuration": "0s",
          "yAxis": {
            "label": "Error count",
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "AutoDev CPU Usage",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type = \"k8s_container\" AND resource.labels.container_name = \"autodev\" AND metric.type = \"kubernetes.io/container/cpu/limit_utilization\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_MEAN"
                  }
                },
                "unitOverride": "percent"
              },
              "plotType": "LINE"
            }
          ],
          "timeshiftDuration": "0s",
          "yAxis": {
            "label": "CPU utilization",
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "AutoDev Memory Usage",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type = \"k8s_container\" AND resource.labels.container_name = \"autodev\" AND metric.type = \"kubernetes.io/container/memory/limit_utilization\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_MEAN"
                  }
                },
                "unitOverride": "percent"
              },
              "plotType": "LINE"
            }
          ],
          "timeshiftDuration": "0s",
          "yAxis": {
            "label": "Memory utilization",
            "scale": "LINEAR"
          }
        }
      }
    ]
  }
}
EOF

  depends_on = [
    google_project_service.monitoring_api,
    google_logging_metric.autodev_task_completion,
    google_logging_metric.autodev_knowledge_base_updates
  ]
}

# Create log sink for exporting logs to BigQuery
resource "google_logging_project_sink" "bigquery_sink" {
  name        = "autodev-logs-sink"
  project     = var.project_id
  destination = "bigquery.googleapis.com/projects/${var.project_id}/datasets/${google_bigquery_dataset.logs_dataset.dataset_id}"
  filter      = "resource.type = \"k8s_container\" AND resource.labels.container_name = \"autodev\""

  unique_writer_identity = true

  depends_on = [
    google_project_service.logging_api,
    google_bigquery_dataset.logs_dataset
  ]
}

# Create BigQuery dataset for logs
resource "google_bigquery_dataset" "logs_dataset" {
  project     = var.project_id
  dataset_id  = "autodev_logs"
  location    = var.region
  description = "Dataset for AutoDev system logs"

  default_table_expiration_ms = 2592000000  # 30 days

  access {
    role          = "OWNER"
    special_group = "projectOwners"
  }

  access {
    role          = "WRITER"
    user_by_email = google_service_account.monitoring_sa.email
  }

  depends_on = [
    google_project_service.bigquery_api
  ]
}

# Enable BigQuery API
resource "google_project_service" "bigquery_api" {
  project = var.project_id
  service = "bigquery.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Grant permissions to the log sink service account
resource "google_project_iam_member" "bigquery_sink_member" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = google_logging_project_sink.bigquery_sink.writer_identity

  depends_on = [
    google_logging_project_sink.bigquery_sink
  ]
}

# Create Datadog integration (configuration only, actual integration requires API key)
resource "google_monitoring_notification_channel" "datadog" {
  count        = var.enable_datadog ? 1 : 0
  project      = var.project_id
  display_name = "Datadog Integration"
  type         = "webhook_tokenauth"
  
  labels = {
    url = "https://api.datadoghq.eu/api/v1/integration/gcp"
  }

  sensitive_labels {
    auth_token = "DATADOG_API_KEY_PLACEHOLDER"  # Will be replaced with actual key
  }

  depends_on = [
    google_project_service.monitoring_api
  ]
}