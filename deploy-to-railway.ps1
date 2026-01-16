# Railway Deployment Script for Evolution of Todo
# Deploys both frontend and backend services

Write-Host "=== Railway Deployment Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
$railwayCheck = & railway --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    Write-Host "Please install Railway CLI from: https://docs.railway.app/develop/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Railway CLI found" -ForegroundColor Green
Write-Host ""

# Check authentication
Write-Host "Checking authentication..." -ForegroundColor Yellow
$whoami = & railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated. Please run: railway login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ $whoami" -ForegroundColor Green
Write-Host ""

# Create or select project
Write-Host "Setting up project..." -ForegroundColor Yellow
$projectName = "evolution-todo"

# Check if project exists
$projects = & railway list 2>&1
if ($projects -match $projectName) {
    Write-Host "Project '$projectName' already exists" -ForegroundColor Yellow
    Write-Host "Linking to existing project..." -ForegroundColor Yellow
} else {
    Write-Host "Creating new project: $projectName" -ForegroundColor Yellow
    & railway init --name $projectName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create project" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== Deploying Frontend ===" -ForegroundColor Cyan
Write-Host ""

# Deploy frontend
Push-Location frontend

Write-Host "Linking frontend service..." -ForegroundColor Yellow
& railway link --project $projectName
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Link failed, continuing..." -ForegroundColor Yellow
}

Write-Host "Setting up frontend environment variables..." -ForegroundColor Yellow
# Set frontend environment variables
& railway variables set NODE_ENV=production
& railway variables set NEXT_PUBLIC_API_URL="`${RAILWAY_PUBLIC_DOMAIN}/api/v1"

Write-Host "Deploying frontend..." -ForegroundColor Yellow
& railway up --detach
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend deployment initiated" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend deployment failed" -ForegroundColor Red
}

Pop-Location

Write-Host ""
Write-Host "=== Deploying Backend ===" -ForegroundColor Cyan
Write-Host ""

# Deploy backend
Push-Location backend

Write-Host "Linking backend service..." -ForegroundColor Yellow
& railway link --project $projectName
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Link failed, continuing..." -ForegroundColor Yellow
}

Write-Host "Setting up backend environment variables..." -ForegroundColor Yellow
# Set backend environment variables (user will need to add secrets manually)
& railway variables set PYTHON_ENV=production
& railway variables set API_PREFIX=/api/v1
& railway variables set ENVIRONMENT=production
& railway variables set CORS_ORIGINS="`${RAILWAY_PUBLIC_DOMAIN}"

Write-Host "Deploying backend..." -ForegroundColor Yellow
& railway up --detach
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployment initiated" -ForegroundColor Green
} else {
    Write-Host "❌ Backend deployment failed" -ForegroundColor Red
}

Pop-Location

Write-Host ""
Write-Host "=== Deployment Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: You need to set the following SECRET environment variables:" -ForegroundColor Yellow
Write-Host ""
Write-Host "For Frontend:" -ForegroundColor Cyan
Write-Host "  - BETTER_AUTH_URL (set to your Railway frontend URL)" -ForegroundColor Yellow
Write-Host "  - BETTER_AUTH_SECRET (random 32+ character string)" -ForegroundColor Yellow
Write-Host "  - DATABASE_URL (your Neon PostgreSQL connection string)" -ForegroundColor Yellow
Write-Host "  - BREVO_API_KEY (your Brevo email API key)" -ForegroundColor Yellow
Write-Host ""
Write-Host "For Backend:" -ForegroundColor Cyan
Write-Host "  - DATABASE_URL (your Neon PostgreSQL connection string)" -ForegroundColor Yellow
Write-Host "  - BETTER_AUTH_SECRET (same as frontend)" -ForegroundColor Yellow
Write-Host "  - SECRET_KEY (random string for JWT)" -ForegroundColor Yellow
Write-Host "  - BETTER_AUTH_URL (set to your Railway frontend URL)" -ForegroundColor Yellow
Write-Host "  - BREVO_API_KEY (your Brevo email API key)" -ForegroundColor Yellow
Write-Host "  - GEMINI_API_KEY (optional)" -ForegroundColor Yellow
Write-Host "  - OPENAI_API_KEY (optional)" -ForegroundColor Yellow
Write-Host ""
Write-Host "To set variables, run:" -ForegroundColor Cyan
Write-Host "  cd frontend" -ForegroundColor Green
Write-Host "  railway variables set VARIABLE_NAME=value" -ForegroundColor Green
Write-Host ""
Write-Host "Or use the Railway dashboard:" -ForegroundColor Cyan
Write-Host "  https://railway.com/project/$projectName" -ForegroundColor Green
Write-Host ""
Write-Host "To view deployment status:" -ForegroundColor Cyan
Write-Host "  railway status" -ForegroundColor Green
Write-Host "  railway logs" -ForegroundColor Green
