# BrasserieBot GCP Infrastructure - Deployment Guide

This guide provides step-by-step instructions for deploying the BrasserieBot platform on Google Cloud Platform (GCP), including the AutoDev system and dashboard.

## Prerequisites

Before you begin, ensure you have the following:

- Google Cloud Platform account with billing enabled
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and configured
- [Terraform](https://www.terraform.io/downloads.html) (v1.5.0 or later) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) installed
- [Docker](https://docs.docker.com/get-docker/) installed
- [Node.js](https://nodejs.org/) (v18 or later) and npm installed
- [Git](https://git-scm.com/downloads) installed

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/brasserie-bot.git
cd brasserie-bot
```

### 2. Set Up GCP Project

Create a new GCP project or use an existing one:

```bash
# Create a new project
gcloud projects create brasserie-bot-prod --name="BrasserieBot Production"

# Set the project as active
gcloud config set project brasserie-bot-prod

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable servicenetworking.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
```

### 3. Create a Terraform State Bucket

Create a GCS bucket to store the Terraform state:

```bash
gsutil mb -l europe-west1 gs://brasserie-bot-terraform-state-prod
gsutil versioning set on gs://brasserie-bot-terraform-state-prod
```

## Terraform Deployment

### 1. Initialize Terraform

```bash
cd infrastructure/terraform/environments/prod
terraform init -backend-config=backend.tf
```

### 2. Configure Variables

Create a `terraform.tfvars` file with your specific values or use the provided template:

```bash
# Copy the template
cp terraform.tfvars.example terraform.tfvars

# Edit the file with your values
nano terraform.tfvars
```

Ensure you set the following required variables:
- `project_id`: Your GCP project ID
- `pinecone_api_key`: Your Pinecone API key
- `claude_api_key`: Your Claude API key

### 3. Plan the Deployment

```bash
terraform plan -out=tfplan
```

Review the plan to ensure it will create the expected resources.

### 4. Apply the Terraform Configuration

```bash
terraform apply tfplan
```

This will create all the GCP infrastructure resources, including:
- VPC network and subnets
- GKE cluster
- Cloud SQL PostgreSQL database
- Firestore database
- Cloud Storage buckets
- Pub/Sub topics
- IAM service accounts and permissions
- Vertex AI resources
- Monitoring resources

The process may take 20-30 minutes to complete.

## Kubernetes Deployment

After the GCP infrastructure is provisioned, deploy the Kubernetes resources:

### 1. Get GKE Credentials

```bash
gcloud container clusters get-credentials brasserie-bot-cluster-prod --zone europe-west1 --project brasserie-bot-prod
```

### 2. Update Kubernetes Manifests

Update the Kubernetes manifest files with your project-specific values:

```bash
cd ../../kubernetes

# Replace PROJECT_ID placeholder with your actual project ID
find . -type f -name "*.yaml" -exec sed -i "s/PROJECT_ID/brasserie-bot-prod/g" {} \;
```

### 3. Create Kubernetes Secrets

Create the necessary Kubernetes secrets:

```bash
# Create database credentials secret
kubectl create secret generic database-credentials \
  --namespace=brasserie-bot \
  --from-literal=url="postgresql://brasseriebot:PASSWORD@10.0.0.1:5432/brasseriebot"

# Create app secrets
kubectl create secret generic app-secrets \
  --namespace=brasserie-bot \
  --from-literal=jwt-secret="YOUR_SECURE_JWT_SECRET"

# Create AI credentials secret
kubectl create secret generic ai-credentials \
  --namespace=brasserie-bot \
  --from-literal=claude-api-key="YOUR_CLAUDE_API_KEY" \
  --from-literal=pinecone-api-key="YOUR_PINECONE_API_KEY"

# Create the same secrets in the autodev namespace
kubectl create secret generic database-credentials \
  --namespace=brasserie-bot-autodev \
  --from-literal=url="postgresql://brasseriebot:PASSWORD@10.0.0.1:5432/brasseriebot"

kubectl create secret generic ai-credentials \
  --namespace=brasserie-bot-autodev \
  --from-literal=claude-api-key="YOUR_CLAUDE_API_KEY" \
  --from-literal=pinecone-api-key="YOUR_PINECONE_API_KEY"
```

Replace the placeholder values with your actual credentials.

### 4. Deploy Kubernetes Resources

Deploy the Kubernetes resources in the following order:

```bash
# Apply namespaces first
kubectl apply -f namespaces/namespaces.yaml

# Apply service accounts and config
kubectl apply -f config/service-accounts.yaml
kubectl apply -f config/config-maps.yaml

# Apply deployments
kubectl apply -f deployments/backend-deployment.yaml
kubectl apply -f deployments/frontend-deployment.yaml
kubectl apply -f deployments/autodev-deployment.yaml
kubectl apply -f deployments/autodev-dashboard-deployment.yaml

# Apply ingress
kubectl apply -f ingress/ingress.yaml
```

### 5. Verify Deployments

Check that all deployments are running correctly:

```bash
# Check pods
kubectl get pods -n brasserie-bot
kubectl get pods -n brasserie-bot-autodev

# Check services
kubectl get services -n brasserie-bot
kubectl get services -n brasserie-bot-autodev

# Check ingress
kubectl get ingress -n brasserie-bot
kubectl get ingress -n brasserie-bot-autodev
```

## Database Migration

Run the database migrations to set up the schema:

```bash
cd ../../database
npm install -g prisma
DATABASE_URL="postgresql://brasseriebot:PASSWORD@10.0.0.1:5432/brasseriebot" prisma migrate deploy
```

Replace the `DATABASE_URL` with your actual database connection string.

## CI/CD Setup

### GitHub Actions

To set up GitHub Actions for CI/CD:

1. Copy the GitHub Actions workflow file to your repository:

```bash
mkdir -p .github/workflows
cp infrastructure/ci-cd/github-actions/main.yml .github/workflows/
```

2. Add the following secrets to your GitHub repository:
   - `GCP_PROJECT_ID`: Your GCP project ID
   - `GCP_SA_KEY`: The JSON key of a GCP service account with necessary permissions
   - `CLOUDSQL_INSTANCE`: Your Cloud SQL instance connection name
   - `DATABASE_URL`: Your database connection URL
   - `CLAUDE_API_KEY`: Your Claude API key
   - `PINECONE_API_KEY`: Your Pinecone API key
   - `SLACK_WEBHOOK_URL`: Your Slack webhook URL for notifications
   - `SNYK_TOKEN`: Your Snyk token for security scanning
   - `AUTODEV_API_KEY`: API key for the AutoDev system

### Cloud Build

To set up Cloud Build for CI/CD:

1. Create a Cloud Build trigger:

```bash
gcloud builds triggers create github \
  --repo=your-org/brasserie-bot \
  --branch-pattern=main \
  --build-config=infrastructure/ci-cd/cloud-build/cloudbuild.yaml
```

2. Add the necessary secrets to Secret Manager:

```bash
# Create secrets
echo -n "postgresql://brasseriebot:PASSWORD@10.0.0.1:5432/brasseriebot" | \
  gcloud secrets create database-url --data-file=-

echo -n "YOUR_AUTODEV_API_KEY" | \
  gcloud secrets create autodev-api-key --data-file=-

# Grant access to Cloud Build service account
gcloud secrets add-iam-policy-binding database-url \
  --member=serviceAccount:$(gcloud projects describe brasserie-bot-prod --format="value(projectNumber)")@cloudbuild.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding autodev-api-key \
  --member=serviceAccount:$(gcloud projects describe brasserie-bot-prod --format="value(projectNumber)")@cloudbuild.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

## Monitoring Setup

### Datadog Integration

To set up Datadog monitoring:

1. Install the Datadog Helm chart:

```bash
# Add Datadog Helm repository
helm repo add datadog https://helm.datadoghq.com
helm repo update

# Install Datadog
helm install datadog -f infrastructure/monitoring/datadog/datadog-values.yaml \
  --set datadog.apiKey=YOUR_DATADOG_API_KEY \
  --set datadog.appKey=YOUR_DATADOG_APP_KEY \
  datadog/datadog
```

Replace `YOUR_DATADOG_API_KEY` and `YOUR_DATADOG_APP_KEY` with your actual Datadog API and app keys.

## Development Environment Setup

For setting up a development environment:

1. Run the PowerShell script:

```powershell
.\infrastructure\scripts\startup\Start-DevEnvironment.ps1 -GcpProject "brasserie-bot-prod" -ClusterName "brasserie-bot-cluster-prod" -ClusterZone "europe-west1"
```

This script will:
- Open Visual Studio with the solution
- Configure GCP authentication
- Verify Docker status
- Start local services via Docker Compose
- Open the BrasserieBot AutoDev dashboard
- Show the current cluster status
- Initialize the AutoDev agent and knowledge base if needed

## Troubleshooting

### Common Issues

1. **GKE Cluster Creation Fails**
   - Check that you have enabled the necessary APIs
   - Verify that your service account has the required permissions

2. **Database Connection Issues**
   - Ensure the Cloud SQL instance is running
   - Check that the database credentials are correct
   - Verify that the network connectivity is properly configured

3. **Kubernetes Deployment Issues**
   - Check the pod logs: `kubectl logs <pod-name> -n <namespace>`
   - Describe the pod: `kubectl describe pod <pod-name> -n <namespace>`
   - Verify that the service accounts have the necessary permissions

4. **AutoDev System Issues**
   - Check the AutoDev logs: `kubectl logs <autodev-pod-name> -n brasserie-bot-autodev`
   - Verify that the Claude API key and Pinecone API key are correctly configured
   - Check that the knowledge base is properly initialized

### Getting Help

If you encounter issues that you cannot resolve, please:

1. Check the project documentation
2. Review the logs for error messages
3. Contact the BrasserieBot team for support

## Maintenance

### Updating the Infrastructure

To update the infrastructure:

1. Update the Terraform configuration files
2. Run `terraform plan` to see the changes
3. Run `terraform apply` to apply the changes

### Updating Kubernetes Resources

To update Kubernetes resources:

1. Update the Kubernetes manifest files
2. Run `kubectl apply -f <file>` to apply the changes

### Backing Up Data

Regular backups are essential:

1. Database backups are automatically configured in the Terraform configuration
2. Additional manual backups can be created using:
   ```bash
   gcloud sql backups create --instance=brasserie-bot-db-prod
   ```

3. Knowledge base backups can be created using:
   ```bash
   gsutil cp -r gs://brasserie-bot-assets-prod-autodev gs://brasserie-bot-backups-prod/autodev-$(date +%Y%m%d)
   ```

## Conclusion

You have successfully deployed the BrasserieBot platform on Google Cloud Platform, including the AutoDev system and dashboard. The infrastructure is now ready for use.

For more information, refer to the documentation in the `infrastructure/docs` directory.