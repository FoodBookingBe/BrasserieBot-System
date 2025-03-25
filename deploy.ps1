# BrasserieBot Deployment Script
# Dit script helpt bij het deployen van de BrasserieBot applicatie naar cloud diensten

# Functie voor kleurrijke output
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

# Functie om te controleren of een commando bestaat
function Test-CommandExists {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Command
    )
    
    $exists = $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
    return $exists
}

# Functie om te controleren of een URL bereikbaar is
function Test-UrlReachable {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Url
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Functie om te wachten tot een URL bereikbaar is
function Wait-ForUrl {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Url,
        [Parameter(Mandatory=$false)]
        [int]$TimeoutSeconds = 300,
        [Parameter(Mandatory=$false)]
        [string]$Message = "Wachten tot de URL bereikbaar is..."
    )
    
    $startTime = Get-Date
    $timeout = New-TimeSpan -Seconds $TimeoutSeconds
    $reachable = $false
    
    Write-Host $Message -ForegroundColor Yellow
    
    while (-not $reachable -and ((Get-Date) - $startTime) -lt $timeout) {
        $reachable = Test-UrlReachable -Url $Url
        
        if (-not $reachable) {
            Write-Host "." -NoNewline -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host ""
    
    if ($reachable) {
        Write-ColorOutput "URL is bereikbaar: $Url" -ForegroundColor Green
        return $true
    }
    else {
        Write-ColorOutput "Timeout: URL is niet bereikbaar geworden binnen $TimeoutSeconds seconden: $Url" -ForegroundColor Red
        return $false
    }
}

# Hoofdscript begint hier
Clear-Host
Write-ColorOutput "BrasserieBot Deployment Script" -ForegroundColor Magenta

# Controleer vereisten
Write-ColorOutput "Vereisten controleren..." -ForegroundColor Yellow

$requiredCommands = @("git", "npm", "netlify", "gh")
$missingCommands = @()

foreach ($command in $requiredCommands) {
    if (-not (Test-CommandExists -Command $command)) {
        $missingCommands += $command
    }
}

if ($missingCommands.Count -gt 0) {
    Write-ColorOutput "De volgende vereiste commando's ontbreken: $($missingCommands -join ', ')" -ForegroundColor Red
    
    if ($missingCommands -contains "netlify") {
        Write-Host "Installeer de Netlify CLI met: npm install -g netlify-cli" -ForegroundColor Yellow
    }
    
    if ($missingCommands -contains "gh") {
        Write-Host "Installeer de GitHub CLI met: https://cli.github.com/" -ForegroundColor Yellow
    }
    
    exit 1
}

# Vraag om de benodigde API keys en credentials
$githubUsername = Read-Host "Voer je GitHub gebruikersnaam in"
$claudeApiKey = Read-Host "Voer je Claude API key in"
$pineconeApiKey = Read-Host "Voer je Pinecone API key in"
$pineconeEnvironment = Read-Host "Voer je Pinecone environment in (standaard: gcp-starter)"

if ([string]::IsNullOrEmpty($pineconeEnvironment)) {
    $pineconeEnvironment = "gcp-starter"
}

$pineconeIndex = Read-Host "Voer je Pinecone index naam in (standaard: brasserie-bot-knowledge)"

if ([string]::IsNullOrEmpty($pineconeIndex)) {
    $pineconeIndex = "brasserie-bot-knowledge"
}

# Genereer een JWT secret
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })

# Stap 1: Push de code naar GitHub
Write-ColorOutput "Stap 1: Code naar GitHub pushen..." -ForegroundColor Yellow

# Frontend repository
Write-Host "Frontend repository aanmaken..." -ForegroundColor Yellow
Set-Location BrasserieBot/frontend

# Controleer of git al is geïnitialiseerd
if (-not (Test-Path ".git")) {
    git init
}

git add .
git commit -m "Prepare for deployment"

# Maak de repository aan op GitHub
$frontendRepoName = "brasserie-bot-frontend"
gh repo create $frontendRepoName --private --source=. --remote=origin --push

# Backend repository
Write-Host "Backend repository aanmaken..." -ForegroundColor Yellow
Set-Location ../backend

# Controleer of git al is geïnitialiseerd
if (-not (Test-Path ".git")) {
    git init
}

git add .
git commit -m "Prepare for deployment"

# Maak de repository aan op GitHub
$backendRepoName = "brasserie-bot-backend"
gh repo create $backendRepoName --private --source=. --remote=origin --push

# AutoDev repository
Write-Host "AutoDev repository aanmaken..." -ForegroundColor Yellow
Set-Location ../autodev

# Controleer of git al is geïnitialiseerd
if (-not (Test-Path ".git")) {
    git init
}

git add .
git commit -m "Prepare for deployment"

# Maak de repository aan op GitHub
$autodevRepoName = "brasserie-bot-autodev"
gh repo create $autodevRepoName --private --source=. --remote=origin --push

# Ga terug naar de hoofdmap
Set-Location ../..

Write-ColorOutput "Code is succesvol naar GitHub gepusht!" -ForegroundColor Green

# Stap 2: Deploy de frontend naar Netlify
Write-ColorOutput "Stap 2: Frontend naar Netlify deployen..." -ForegroundColor Yellow

Set-Location BrasserieBot/frontend

# Log in bij Netlify als dat nog niet is gebeurd
netlify status
if ($LASTEXITCODE -ne 0) {
    netlify login
}

# Maak een nieuwe Netlify site aan
$netlifyOutput = netlify sites:create --name "brasserie-bot" --manual
$netlifyUrl = ($netlifyOutput | Select-String -Pattern "https://.*netlify.app").Matches.Value

# Configureer de site
netlify env:set NEXT_PUBLIC_API_URL "https://brasserie-bot-api.onrender.com"

# Deploy de site
netlify deploy --prod

Write-ColorOutput "Frontend is succesvol gedeployed naar Netlify: $netlifyUrl" -ForegroundColor Green

# Stap 3: Open de Render.com dashboard voor handmatige setup
Write-ColorOutput "Stap 3: Backend en AutoDev naar Render.com deployen..." -ForegroundColor Yellow

Write-Host "Open de volgende URL's in je browser om de Render.com Blueprint te configureren:" -ForegroundColor Yellow
Write-Host "1. Backend: https://dashboard.render.com/select-repo?type=blueprint" -ForegroundColor Yellow
Write-Host "2. AutoDev: https://dashboard.render.com/select-repo?type=blueprint" -ForegroundColor Yellow

Write-Host "Volg deze stappen voor elke repository:" -ForegroundColor Yellow
Write-Host "1. Selecteer de repository ($backendRepoName of $autodevRepoName)" -ForegroundColor Yellow
Write-Host "2. Klik op 'Apply Blueprint'" -ForegroundColor Yellow
Write-Host "3. Vul de volgende environment variabelen in:" -ForegroundColor Yellow
Write-Host "   - JWT_SECRET: $jwtSecret" -ForegroundColor Yellow
Write-Host "   - CLAUDE_API_KEY: $claudeApiKey" -ForegroundColor Yellow
Write-Host "   - PINECONE_API_KEY: $pineconeApiKey" -ForegroundColor Yellow
Write-Host "   - PINECONE_ENVIRONMENT: $pineconeEnvironment" -ForegroundColor Yellow
Write-Host "   - PINECONE_INDEX: $pineconeIndex" -ForegroundColor Yellow
Write-Host "4. Klik op 'Create Resources'" -ForegroundColor Yellow

$renderSetupComplete = Read-Host "Druk op Enter als je de Render.com setup hebt voltooid"

# Stap 4: Update de frontend API URL
Write-ColorOutput "Stap 4: Frontend API URL updaten..." -ForegroundColor Yellow

$backendUrl = Read-Host "Voer de URL van je backend API in (bijv. https://brasserie-bot-api.onrender.com)"

if (-not [string]::IsNullOrEmpty($backendUrl)) {
    netlify env:set NEXT_PUBLIC_API_URL $backendUrl
    netlify deploy --prod
    
    Write-ColorOutput "Frontend API URL is succesvol geüpdatet!" -ForegroundColor Green
}

# Stap 5: Test de applicatie
Write-ColorOutput "Stap 5: Applicatie testen..." -ForegroundColor Yellow

Write-Host "Test de volgende URL's in je browser:" -ForegroundColor Yellow
Write-Host "1. Frontend: $netlifyUrl" -ForegroundColor Yellow
Write-Host "2. Backend API: $backendUrl/health" -ForegroundColor Yellow
Write-Host "3. AutoDev: https://brasserie-bot-autodev.onrender.com/health" -ForegroundColor Yellow
Write-Host "4. AutoDev Dashboard: https://brasserie-bot-autodev-dashboard.onrender.com" -ForegroundColor Yellow

# Wacht tot de URL's bereikbaar zijn
Wait-ForUrl -Url $netlifyUrl -Message "Wachten tot de frontend bereikbaar is..."
Wait-ForUrl -Url "$backendUrl/health" -Message "Wachten tot de backend API bereikbaar is..."

# Gefeliciteerd!
Write-ColorOutput "Gefeliciteerd! De BrasserieBot applicatie is succesvol gedeployed!" -ForegroundColor Green
Write-Host "Frontend: $netlifyUrl" -ForegroundColor Green
Write-Host "Backend API: $backendUrl" -ForegroundColor Green
Write-Host "AutoDev: https://brasserie-bot-autodev.onrender.com" -ForegroundColor Green
Write-Host "AutoDev Dashboard: https://brasserie-bot-autodev-dashboard.onrender.com" -ForegroundColor Green

Write-Host "`nVoor meer informatie, zie de deployment handleiding: ./deployment-guide.md" -ForegroundColor Yellow