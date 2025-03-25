# BrasserieBot GCP Infrastructure

This directory contains all the infrastructure-as-code resources for deploying the BrasserieBot platform to Google Cloud Platform, including the AutoDev system and dashboard.

## Directory Structure

- `terraform/`: Terraform modules for provisioning GCP resources
  - `modules/`: Reusable Terraform modules
    - `network/`: VPC and networking resources
    - `gke/`: Google Kubernetes Engine cluster configuration
    - `database/`: Cloud SQL PostgreSQL configuration
    - `firestore/`: Firestore in Native mode setup
    - `storage/`: Cloud Storage buckets configuration
    - `pubsub/`: Pub/Sub topics and subscriptions
    - `iam/`: IAM roles and service accounts
    - `vertex-ai/`: Vertex AI configuration for AutoDev
    - `monitoring/`: Monitoring and logging resources
  - `environments/`: Environment-specific configurations
    - `dev/`: Development environment
    - `staging/`: Staging environment
    - `prod/`: Production environment

- `kubernetes/`: Kubernetes manifest files
  - `namespaces/`: Namespace configurations
  - `deployments/`: Deployment configurations
  - `services/`: Service configurations
  - `ingress/`: Ingress configurations
  - `config/`: ConfigMaps and Secrets
  - `autoscaling/`: HorizontalPodAutoscalers
  - `network-policies/`: NetworkPolicies for micro-segmentation

- `ci-cd/`: CI/CD pipeline configurations
  - `github-actions/`: GitHub Actions workflow files
  - `cloud-build/`: Google Cloud Build configurations

- `monitoring/`: Monitoring and observability configurations
  - `datadog/`: Datadog agent configuration
  - `dashboards/`: Custom dashboard configurations
  - `alerts/`: Alert policy configurations
  - `logging/`: Logging configurations

- `scripts/`: Utility scripts
  - `dev-environment/`: Development environment setup scripts
  - `migrations/`: Database migration scripts
  - `startup/`: One-click startup PowerShell script

## Getting Started

See the deployment guide in `docs/deployment-guide.md` for instructions on how to deploy the infrastructure.