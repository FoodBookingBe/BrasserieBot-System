# BrasserieBot GCP Infrastructure - Development Environment Startup Script

<#
.SYNOPSIS
    One-click startup tool for the BrasserieBot development environment.

.DESCRIPTION
    This PowerShell script automates the setup and initialization of the BrasserieBot development environment.
    It performs the following tasks:
    - Opens Visual Studio with the solution
    - Configures GCP authentication
    - Verifies Docker status
    - Starts local services via Docker Compose
    - Opens the BrasserieBot AutoDev dashboard
    - Shows the current cluster status
    - Initializes the AutoDev agent and knowledge base if needed

.PARAMETER ProjectPath
    Path to the BrasserieBot project directory. Defaults to the current directory.

.PARAMETER GcpProject
    The Google Cloud Platform project ID to use.

.PARAMETER ClusterName
    The name of the GKE cluster to connect to.

.PARAMETER ClusterZone
    The zone where the GKE cluster is located.

.PARAMETER SkipVsCode
    If specified, skips opening Visual Studio Code.

.PARAMETER SkipGcpAuth
    If specified, skips GCP authentication.

.PARAMETER SkipDockerCompose
    If specified, skips starting Docker Compose services.

.PARAMETER SkipAutoDevDashboard
    If specified, skips opening the AutoDev dashboard.

.EXAMPLE
    .\Start-DevEnvironment.ps1 -GcpProject "brasserie-bot-dev" -ClusterName "brasserie-bot-cluster-dev" -ClusterZone "europe-west1-b"

.NOTES
    Author: BrasserieBot Team
    Version: 1.0
    Date: 2025-03-24
#>

param (
    [string]$ProjectPath = (Get-Location),
    [Parameter(Mandatory=$true)]
    [string]$GcpProject,
    [Parameter(Mandatory=$true)]
    [string]$ClusterName,
    [Parameter(Mandatory=$true)]
    [string]$ClusterZone,
    [switch]$SkipVsCode,
    [switch]$SkipGcpAuth,
    [switch]$SkipDockerCompose,
    [switch]$SkipAutoDevDashboard
)

# Function to display colorful messages
function Write-ColorOutput {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor $ForegroundColor
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host ""
}

# Function to check if a command exists
function Test-CommandExists {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Command
    )
    
    $exists = $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
    return $exists
}

# Function to check if a process is running
function Test-ProcessRunning {
    param (
        [Parameter(Mandatory=$true)]
        [string]$ProcessName
    )
    
    $running = $null -ne (Get-Process $ProcessName -ErrorAction SilentlyContinue)
    return $running
}

# Function to check Docker status
function Test-DockerRunning {
    try {
        $dockerStatus = docker info 2>&1
        return $true
    }
    catch {
        return $false
    }
}

# Function to initialize the AutoDev knowledge base
function Initialize-AutoDevKnowledgeBase {
    param (
        [Parameter(Mandatory=$true)]
        [string]$ProjectPath
    )
    
    $autodevPath = Join-Path -Path $ProjectPath -ChildPath "BrasserieBot\autodev"
    
    if (Test-Path $autodevPath) {
        Write-ColorOutput "Initializing AutoDev knowledge base..." -ForegroundColor Yellow
        
        Set-Location $autodevPath
        npm run initialize-knowledge-base
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "AutoDev knowledge base initialized successfully!" -ForegroundColor Green
        }
        else {
            Write-ColorOutput "Failed to initialize AutoDev knowledge base." -ForegroundColor Red
        }
    }
    else {
        Write-ColorOutput "AutoDev directory not found at: $autodevPath" -ForegroundColor Red
    }
}

# Main script execution starts here
Clear-Host
Write-ColorOutput "BrasserieBot Development Environment Startup" -ForegroundColor Magenta

# Validate project path
if (-not (Test-Path (Join-Path -Path $ProjectPath -ChildPath "BrasserieBot"))) {
    Write-ColorOutput "Error: BrasserieBot directory not found at: $ProjectPath" -ForegroundColor Red
    exit 1
}

# Set the working directory to the project path
Set-Location $ProjectPath
Write-ColorOutput "Working directory set to: $ProjectPath" -ForegroundColor Green

# Check prerequisites
Write-ColorOutput "Checking prerequisites..." -ForegroundColor Yellow

$prerequisites = @(
    @{Name = "git"; DisplayName = "Git"},
    @{Name = "node"; DisplayName = "Node.js"},
    @{Name = "npm"; DisplayName = "NPM"},
    @{Name = "docker"; DisplayName = "Docker"},
    @{Name = "gcloud"; DisplayName = "Google Cloud SDK"}
)

$missingPrerequisites = @()

foreach ($prereq in $prerequisites) {
    if (-not (Test-CommandExists $prereq.Name)) {
        $missingPrerequisites += $prereq.DisplayName
    }
}

if ($missingPrerequisites.Count -gt 0) {
    Write-ColorOutput "Error: The following prerequisites are missing: $($missingPrerequisites -join ', ')" -ForegroundColor Red
    exit 1
}

# Check Docker status
Write-ColorOutput "Checking Docker status..." -ForegroundColor Yellow

if (-not (Test-DockerRunning)) {
    Write-ColorOutput "Docker is not running. Starting Docker..." -ForegroundColor Yellow
    
    # Try to start Docker Desktop if installed
    $dockerDesktopPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerDesktopPath) {
        Start-Process $dockerDesktopPath
        
        # Wait for Docker to start
        $retries = 0
        $maxRetries = 30
        $dockerStarted = $false
        
        while (-not $dockerStarted -and $retries -lt $maxRetries) {
            Start-Sleep -Seconds 2
            $retries++
            Write-Host "Waiting for Docker to start... ($retries/$maxRetries)" -ForegroundColor Yellow
            
            if (Test-DockerRunning) {
                $dockerStarted = $true
            }
        }
        
        if ($dockerStarted) {
            Write-ColorOutput "Docker started successfully!" -ForegroundColor Green
        }
        else {
            Write-ColorOutput "Error: Failed to start Docker after $maxRetries retries." -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-ColorOutput "Error: Docker is not running and Docker Desktop was not found." -ForegroundColor Red
        exit 1
    }
}
else {
    Write-ColorOutput "Docker is running!" -ForegroundColor Green
}

# Open Visual Studio Code with the solution
if (-not $SkipVsCode) {
    Write-ColorOutput "Opening Visual Studio Code..." -ForegroundColor Yellow
    
    if (Test-CommandExists "code") {
        Start-Process "code" -ArgumentList $ProjectPath
        Write-ColorOutput "Visual Studio Code opened successfully!" -ForegroundColor Green
    }
    else {
        Write-ColorOutput "Error: Visual Studio Code command 'code' not found." -ForegroundColor Red
    }
}

# Configure GCP authentication
if (-not $SkipGcpAuth) {
    Write-ColorOutput "Configuring GCP authentication..." -ForegroundColor Yellow
    
    try {
        # Check if already authenticated
        $currentAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1
        
        if ([string]::IsNullOrEmpty($currentAccount)) {
            # Not authenticated, run login
            gcloud auth login
        }
        else {
            Write-ColorOutput "Already authenticated as: $currentAccount" -ForegroundColor Green
        }
        
        # Set the current project
        gcloud config set project $GcpProject
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "GCP project set to: $GcpProject" -ForegroundColor Green
        }
        else {
            Write-ColorOutput "Error: Failed to set GCP project." -ForegroundColor Red
        }
        
        # Get GKE cluster credentials
        gcloud container clusters get-credentials $ClusterName --zone $ClusterZone --project $GcpProject
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "GKE credentials obtained for cluster: $ClusterName" -ForegroundColor Green
        }
        else {
            Write-ColorOutput "Error: Failed to get GKE credentials." -ForegroundColor Red
        }
    }
    catch {
        Write-ColorOutput "Error during GCP authentication: $_" -ForegroundColor Red
    }
}

# Start local services via Docker Compose
if (-not $SkipDockerCompose) {
    Write-ColorOutput "Starting local services via Docker Compose..." -ForegroundColor Yellow
    
    $dockerComposePath = Join-Path -Path $ProjectPath -ChildPath "BrasserieBot\docker-compose.yml"
    
    if (Test-Path $dockerComposePath) {
        Set-Location (Join-Path -Path $ProjectPath -ChildPath "BrasserieBot")
        docker-compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "Docker Compose services started successfully!" -ForegroundColor Green
        }
        else {
            Write-ColorOutput "Error: Failed to start Docker Compose services." -ForegroundColor Red
        }
    }
    else {
        Write-ColorOutput "Error: docker-compose.yml not found at: $dockerComposePath" -ForegroundColor Red
    }
}

# Open the BrasserieBot AutoDev dashboard
if (-not $SkipAutoDevDashboard) {
    Write-ColorOutput "Opening BrasserieBot AutoDev dashboard..." -ForegroundColor Yellow
    
    $autodevDashboardPath = Join-Path -Path $ProjectPath -ChildPath "BrasserieBot\autodev\start-dashboard.bat"
    
    if (Test-Path $autodevDashboardPath) {
        Start-Process $autodevDashboardPath
        Write-ColorOutput "AutoDev dashboard started successfully!" -ForegroundColor Green
    }
    else {
        Write-ColorOutput "Error: AutoDev dashboard script not found at: $autodevDashboardPath" -ForegroundColor Red
    }
}

# Show current cluster status
Write-ColorOutput "Fetching current cluster status..." -ForegroundColor Yellow

try {
    # Get nodes
    $nodes = kubectl get nodes -o wide
    Write-Host "Cluster Nodes:" -ForegroundColor Cyan
    Write-Host $nodes
    
    # Get pods
    $pods = kubectl get pods --all-namespaces
    Write-Host "`nCluster Pods:" -ForegroundColor Cyan
    Write-Host $pods
    
    # Get services
    $services = kubectl get services --all-namespaces
    Write-Host "`nCluster Services:" -ForegroundColor Cyan
    Write-Host $services
    
    Write-ColorOutput "Cluster status retrieved successfully!" -ForegroundColor Green
}
catch {
    Write-ColorOutput "Error retrieving cluster status: $_" -ForegroundColor Red
}

# Initialize the AutoDev agent and knowledge base if needed
$initializeKnowledgeBase = Read-Host "Do you want to initialize the AutoDev knowledge base? (y/n)"

if ($initializeKnowledgeBase -eq "y" -or $initializeKnowledgeBase -eq "Y") {
    Initialize-AutoDevKnowledgeBase -ProjectPath $ProjectPath
}

# Final message
Write-ColorOutput "BrasserieBot development environment is ready!" -ForegroundColor Green
Write-Host "- Project Path: $ProjectPath" -ForegroundColor White
Write-Host "- GCP Project: $GcpProject" -ForegroundColor White
Write-Host "- GKE Cluster: $ClusterName ($ClusterZone)" -ForegroundColor White
Write-Host "`nHappy coding! 🚀" -ForegroundColor Magenta