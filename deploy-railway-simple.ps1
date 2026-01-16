# Simple Railway Deployment Script
# This script deploys frontend and backend to Railway

Write-Host "=== Railway Deployment ===" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "D:\Abdul Kabir\agentic_ai\hackathon\todo_list_hackathon\evolution-of-todo - Copy"

# Deploy Frontend
Write-Host "Deploying Frontend..." -ForegroundColor Yellow
Push-Location "$projectRoot\frontend"

# Link to project
Write-Host "Linking frontend to project..." -ForegroundColor Cyan
railway link --project evolution-todo

# Deploy
Write-Host "Deploying frontend..." -ForegroundColor Cyan
railway up --detach

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend deployment started" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend deployment may have issues. Check Railway dashboard." -ForegroundColor Yellow
}

Pop-Location

Write-Host ""
Write-Host "Deploying Backend..." -ForegroundColor Yellow
Push-Location "$projectRoot\backend"

# Link to project
Write-Host "Linking backend to project..." -ForegroundColor Cyan
railway link --project evolution-todo

# Deploy
Write-Host "Deploying backend..." -ForegroundColor Cyan
railway up --detach

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployment started" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend deployment may have issues. Check Railway dashboard." -ForegroundColor Yellow
}

Pop-Location

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to Railway dashboard: https://railway.com/project/bbfadd1b-3a0a-4bd9-84ef-c331016a81f2" -ForegroundColor Cyan
Write-Host "2. Configure environment variables for both services" -ForegroundColor Cyan
Write-Host "3. Get your deployment URLs and update CORS/BETTER_AUTH_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "See RAILWAY_DEPLOYMENT.md for detailed instructions." -ForegroundColor Yellow
