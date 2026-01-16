# Railway Deployment Guide

## Quick Deploy via CLI

### Option 1: Deploy from Local Directories (Recommended)

Railway automatically creates services when you deploy from a directory. Here's how:

#### 1. Deploy Frontend

```powershell
# Navigate to frontend directory
cd frontend

# Link to Railway project (creates service automatically)
railway link --project evolution-todo

# Deploy
railway up --detach
```

#### 2. Deploy Backend

```powershell
# Navigate to backend directory  
cd ..\backend

# Link to Railway project (creates service automatically)
railway link --project evolution-todo

# Deploy
railway up --detach
```

### Option 2: Deploy via Railway Dashboard (Easier for Multiple Services)

1. Go to https://railway.com/project/bbfadd1b-3a0a-4bd9-84ef-c331016a81f2
2. Click **"New"** → **"GitHub Repo"**
3. Select your repository: `abdul-kabir-jawed/agentic_ai_projects`
4. For **Root Directory**, enter: `frontend`
5. Railway will auto-detect it's a Node.js app
6. Repeat for backend with Root Directory: `backend`

## Setting Environment Variables

After deployment, set these environment variables in Railway dashboard or via CLI:

### Frontend Variables

```powershell
cd frontend
railway variables --set "NODE_ENV=production"
railway variables --set "BETTER_AUTH_URL=https://your-frontend-url.railway.app"
railway variables --set "BETTER_AUTH_SECRET=your-32-char-secret"
railway variables --set "DATABASE_URL=your-neon-connection-string"
railway variables --set "BREVO_API_KEY=your-brevo-key"
```

### Backend Variables

```powershell
cd backend
railway variables --set "PYTHON_ENV=production"
railway variables --set "API_PREFIX=/api/v1"
railway variables --set "ENVIRONMENT=production"
railway variables --set "DATABASE_URL=your-neon-connection-string"
railway variables --set "BETTER_AUTH_SECRET=your-32-char-secret"
railway variables --set "SECRET_KEY=your-jwt-secret"
railway variables --set "BETTER_AUTH_URL=https://your-frontend-url.railway.app"
railway variables --set "CORS_ORIGINS=https://your-frontend-url.railway.app"
railway variables --set "BREVO_API_KEY=your-brevo-key"
railway variables --set "GEMINI_API_KEY=your-gemini-key"  # Optional
railway variables --set "OPENAI_API_KEY=your-openai-key"  # Optional
```

## Important Notes

1. **Service Names**: Railway auto-generates service names. You can rename them in the dashboard.

2. **Frontend URL**: After deployment, get your frontend URL from Railway dashboard and update:
   - `BETTER_AUTH_URL` in frontend
   - `BETTER_AUTH_URL` and `CORS_ORIGINS` in backend

3. **Backend URL**: Railway will create a URL like `https://backend-xxxxx.railway.app`. Update frontend's `NEXT_PUBLIC_API_URL` to point to this.

4. **Database**: Make sure your Neon database allows connections from Railway IPs (usually no restriction needed for public databases).

## Checking Deployment Status

```powershell
# View all services
railway status

# View logs
railway logs

# View specific service logs
cd frontend
railway logs

cd ../backend  
railway logs
```

## Troubleshooting

### "Multiple services found"
- Specify the service: `railway up --service service-name`
- Or navigate to the specific directory first

### "Service not found"
- Make sure you've linked the directory: `railway link --project evolution-todo`
- Check service exists: `railway service status`

### Build Failures
- Check logs: `railway logs`
- Verify `package.json` (frontend) or `Dockerfile` (backend) exists
- Check Railway dashboard for detailed build logs

### Runtime Errors
- Verify all environment variables are set
- Check database connection string is correct
- Ensure CORS origins match your frontend URL
