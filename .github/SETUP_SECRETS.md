# GitHub Secrets Setup Guide

This workflow requires GitHub Secrets to be configured for deployment to DigitalOcean.

## Required Secrets

### For Kubernetes Deployment (DOKS)

1. **DIGITALOCEAN_ACCESS_TOKEN**
   - Go to [DigitalOcean API Tokens](https://cloud.digitalocean.com/account/api/tokens)
   - Click "Generate New Token"
   - Give it a name (e.g., "GitHub Actions")
   - Select "Write" scope
   - Copy the token
   - Add to GitHub: Settings → Secrets and variables → Actions → New repository secret
   - Name: `DIGITALOCEAN_ACCESS_TOKEN`
   - Value: Your token

## How to Add Secrets to GitHub

1. Go to your repository: `https://github.com/abdul-kabir-jawed/agentic_ai_projects`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the name and value above
5. Click **Add secret**

## Workflow Behavior

- **Test job**: Always runs (no secrets required)
- **Build-and-push job**: Only runs if `DIGITALOCEAN_ACCESS_TOKEN` is set
- **Deploy job**: Only runs if `DIGITALOCEAN_ACCESS_TOKEN` is set

If secrets are not configured, the workflow will:
- ✅ Run tests successfully
- ⏭️ Skip deployment steps (with a note)

## Alternative: Use DigitalOcean App Platform

If you prefer to use DigitalOcean App Platform (simpler, no Kubernetes):
1. Use the `.do-app.yaml` file in the root directory
2. Connect your GitHub repo in DigitalOcean App Platform
3. No GitHub secrets needed (configured in App Platform UI)

See `DEPLOYMENT_GUIDE.md` for detailed instructions.
