# DigitalOcean App Platform Deployment Script
# This script deploys the Evolution of Todo app to DigitalOcean App Platform

Write-Host "=== DigitalOcean App Platform Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if doctl is available
$doctlPath = "$env:TEMP\doctl\doctl.exe"
if (-not (Test-Path $doctlPath)) {
    Write-Host "Downloading doctl..." -ForegroundColor Yellow
    $doctlVersion = "1.148.0"
    $url = "https://github.com/digitalocean/doctl/releases/download/v$doctlVersion/doctl-$doctlVersion-windows-amd64.zip"
    $output = "$env:TEMP\doctl.zip"
    Invoke-WebRequest -Uri $url -OutFile $output
    Expand-Archive -Path $output -DestinationPath "$env:TEMP\doctl" -Force
    Remove-Item $output
}

# Add doctl to PATH for this session
$env:PATH += ";$env:TEMP\doctl"

# Check authentication
Write-Host "Checking authentication..." -ForegroundColor Yellow
$authCheck = & doctl auth list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Not authenticated with DigitalOcean" -ForegroundColor Red
    Write-Host ""
    Write-Host "To authenticate, you need a DigitalOcean access token." -ForegroundColor Yellow
    Write-Host "1. Get your token from: https://cloud.digitalocean.com/account/api/tokens" -ForegroundColor Yellow
    Write-Host "2. Run: doctl auth init" -ForegroundColor Yellow
    Write-Host "3. Enter your token when prompted" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, set the DIGITALOCEAN_ACCESS_TOKEN environment variable:" -ForegroundColor Yellow
    Write-Host '  $env:DIGITALOCEAN_ACCESS_TOKEN = "your-token-here"' -ForegroundColor Cyan
    Write-Host "  Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Authenticated" -ForegroundColor Green
Write-Host ""

# Check if app already exists
Write-Host "Checking for existing apps..." -ForegroundColor Yellow
$apps = & doctl apps list --format ID,Spec.Name 2>&1
$existingApp = $apps | Select-String "evolution-todo"

if ($existingApp) {
    Write-Host "⚠️  App 'evolution-todo' already exists" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to update the existing app? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host ""
        Write-Host "Updating app..." -ForegroundColor Yellow
        $appId = ($apps | Select-String "evolution-todo" | ForEach-Object { ($_ -split '\s+')[0] })[0]
        & doctl apps update $appId --spec .do-app.yaml
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ App updated successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Getting app details..." -ForegroundColor Yellow
            & doctl apps get $appId
        } else {
            Write-Host "❌ Failed to update app" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Deployment cancelled." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "Creating new app..." -ForegroundColor Yellow
    & doctl apps create --spec .do-app.yaml
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ App created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Getting app details..." -ForegroundColor Yellow
        & doctl apps list --format ID,Spec.Name,ActiveDeployment.ID
    } else {
        Write-Host "❌ Failed to create app" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure secrets in DigitalOcean App Platform dashboard" -ForegroundColor Yellow
Write-Host "2. Set up your domain (if needed)" -ForegroundColor Yellow
Write-Host "3. Monitor deployment status: doctl apps list" -ForegroundColor Yellow
