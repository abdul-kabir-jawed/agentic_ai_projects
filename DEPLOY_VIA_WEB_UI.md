# Deploy to DigitalOcean App Platform via Web UI

This guide shows you how to deploy without needing CLI or access tokens - just use the web interface!

## Step-by-Step Instructions

### Step 1: Go to DigitalOcean App Platform

1. Visit: https://cloud.digitalocean.com/apps
2. Click the **"Create App"** button

### Step 2: Connect Your GitHub Repository

1. Select **"GitHub"** as your source
2. If this is your first time, you'll be asked to authorize DigitalOcean to access your GitHub account
3. Click **"Authorize DigitalOcean"** and approve the permissions
4. Select your repository: **`abdul-kabir-jawed/agentic_ai_projects`**
5. Select branch: **`main`**
6. Click **"Next"**

### Step 3: Configure App (Auto-Detection)

DigitalOcean should automatically detect your `.do-app.yaml` file and configure both services:

- ✅ **Frontend** (Next.js) - from `frontend/` directory
- ✅ **Backend** (Python/Docker) - from `backend/` directory

**If it shows "No components detected":**

1. Click **"Edit Plan"** or **"Edit Components"**
2. Make sure the **Source Directory** is set to the **root** of your repository (leave it empty or as `/`)
3. DigitalOcean should detect:
   - `frontend/package.json` → Frontend service
   - `backend/Dockerfile` → Backend service
   - `.do-app.yaml` → App spec file

### Step 4: Review Configuration

You should see:
- **Frontend Service:**
  - Source: `frontend/`
  - Build: `npm ci --legacy-peer-deps && npm run build`
  - Run: `npm start`
  - Port: `3000`

- **Backend Service:**
  - Source: `backend/`
  - Type: Docker
  - Dockerfile: `Dockerfile`
  - Port: `8000`

### Step 5: Configure Environment Variables (Secrets)

1. Scroll down to **"Environment Variables"** section
2. Click **"Edit"** or **"Add Variable"**
3. Add the following as **SECRET** variables (click the lock icon 🔒):

#### Required Secrets:

| Variable Name | Type | Description |
|--------------|------|-------------|
| `DATABASE_URL` | Secret | Your Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret | Random 32+ character string (generate one) |
| `SECRET_KEY` | Secret | Random string for JWT signing |
| `BREVO_API_KEY` | Secret | Your Brevo email API key |
| `GEMINI_API_KEY` | Secret | (Optional) Gemini API key for AI features |
| `OPENAI_API_KEY` | Secret | (Optional) OpenAI API key for AI features |

#### Regular Variables (already set in .do-app.yaml):

These should be auto-configured, but verify:
- `NODE_ENV` = `production`
- `PYTHON_ENV` = `production`
- `API_PREFIX` = `/api/v1`
- `ENVIRONMENT` = `production`
- `EMAIL_FROM_ADDRESS` = `noreply@evolutionoftodo.com`
- `EMAIL_FROM_NAME` = `Evolution of Todo`

**Note:** The frontend and backend will automatically get the correct URLs via `${frontend.PUBLIC_URL}` and `${backend.PUBLIC_URL}` variables.

### Step 6: Choose a Plan

1. Select an **instance size** for each service:
   - **Basic ($5/month)** - Good for testing
   - **Professional ($12/month)** - Better performance
2. Click **"Next"**

### Step 7: Review and Deploy

1. Review your configuration
2. Give your app a name (e.g., "evolution-todo")
3. Select a region (e.g., "New York")
4. Click **"Create Resources"** or **"Deploy"**

### Step 8: Wait for Deployment

DigitalOcean will:
1. Build your frontend (npm install + build)
2. Build your backend Docker image
3. Deploy both services
4. Show you the deployment URLs

This usually takes 5-10 minutes.

### Step 9: Access Your App

Once deployed, you'll get:
- **Frontend URL:** `https://your-app-name-xxxxx.ondigitalocean.app`
- **Backend URL:** `https://your-app-name-xxxxx.ondigitalocean.app/api`

## Troubleshooting

### "No components detected"

**Solution 1: Check Source Directory**
- Make sure Source Directory is empty (root) or set to `/`
- DigitalOcean should scan from the repository root

**Solution 2: Use App Spec**
- In the App Platform UI, go to **Settings** → **App Spec**
- Enable **"Use App Spec"**
- The `.do-app.yaml` file should be automatically detected

**Solution 3: Manual Configuration**
- If auto-detection fails, manually add services:
  1. Click **"Edit Components"**
  2. Click **"Add Component"** → **"Web Service"**
  3. For Frontend:
     - Name: `frontend`
     - Source Directory: `frontend`
     - Build Command: `npm ci --legacy-peer-deps && npm run build`
     - Run Command: `npm start`
     - Port: `3000`
  4. Click **"Add Component"** → **"Web Service"**
  5. For Backend:
     - Name: `backend`
     - Source Directory: `backend`
     - Type: Docker
     - Dockerfile Path: `Dockerfile`
     - Port: `8000`

### Build Failures

**Frontend Build Issues:**
- Check that `frontend/package.json` exists
- Verify Node.js version (should be 20.x)
- Check build logs in DigitalOcean dashboard

**Backend Build Issues:**
- Check that `backend/Dockerfile` exists
- Verify Python version in Dockerfile (should be 3.11)
- Check build logs for dependency errors

### Runtime Errors

**Database Connection:**
- Verify `DATABASE_URL` is set correctly
- Check that your Neon database allows connections from DigitalOcean IPs
- Test the connection string locally first

**API Errors:**
- Check that `BETTER_AUTH_SECRET` and `SECRET_KEY` are set
- Verify CORS settings (should be auto-configured)
- Check backend logs in DigitalOcean dashboard

## Next Steps

After successful deployment:

1. **Set up a custom domain** (optional):
   - Go to **Settings** → **Domains**
   - Add your domain
   - Update DNS records as instructed

2. **Monitor your app**:
   - View logs: **Runtime Logs** tab
   - Check metrics: **Metrics** tab
   - Set up alerts: **Alerts** section

3. **Update environment variables**:
   - Go to **Settings** → **App-Level Environment Variables**
   - Add or modify variables as needed
   - Changes require a new deployment

## Cost Estimate

- **Basic Plan:** ~$10/month (Frontend $5 + Backend $5)
- **Professional Plan:** ~$24/month (Frontend $12 + Backend $12)
- **Database:** Neon PostgreSQL (free tier available)

## Support

If you encounter issues:
1. Check the deployment logs in DigitalOcean dashboard
2. Review the `.do-app.yaml` file configuration
3. Verify all environment variables are set correctly
4. Check DigitalOcean status page: https://status.digitalocean.com/
