# Evolution of Todo - DigitalOcean Deployment Guide

This guide covers deploying the Evolution of Todo application to DigitalOcean using two approaches:
1. **App Platform** (Recommended for simplicity)
2. **Kubernetes (DOKS)** (Recommended for scalability)

## Prerequisites

Before deploying, ensure you have:

- [ ] DigitalOcean account with billing enabled
- [ ] GitHub repository with your code pushed
- [ ] Neon PostgreSQL database created (https://neon.tech)
- [ ] Domain name (optional but recommended)
- [ ] The following secrets ready:
  - `DATABASE_URL` - Neon PostgreSQL connection string
  - `BETTER_AUTH_SECRET` - Random 32+ character string for auth
  - `SECRET_KEY` - Random string for JWT signing
  - `BREVO_API_KEY` - API key from Brevo for emails
  - `OPENAI_API_KEY` - OpenAI API key for AI features

---

## Option 1: DigitalOcean App Platform (Easiest)

App Platform is a PaaS that automatically builds and deploys your app.

### Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for deployment"

# Create GitHub repo and push
gh repo create evolution-of-todo --public
git push -u origin main
```

### Step 2: Create App on DigitalOcean

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Select **GitHub** as source
4. Authorize DigitalOcean to access your repository
5. Select the `evolution-of-todo` repository
6. Select the `main` branch

### Step 3: Configure Services

DigitalOcean will auto-detect your app structure. Configure as follows:

#### Frontend Service:
- **Name:** `frontend`
- **Source Directory:** `/frontend`
- **Build Command:** `npm run build`
- **Run Command:** `npm start`
- **HTTP Port:** `3000`
- **Instance Size:** Basic ($5/mo) or Professional ($12/mo)

#### Backend Service:
- **Name:** `backend`
- **Source Directory:** `/backend`
- **Dockerfile Path:** `Dockerfile`
- **HTTP Port:** `8000`
- **Instance Size:** Basic ($5/mo) or Professional ($12/mo)

### Step 4: Configure Environment Variables

In the App Platform UI, add the following environment variables:

#### Frontend Environment Variables:
```
NEXT_PUBLIC_API_URL=${backend.PUBLIC_URL}/api/v1
BETTER_AUTH_URL=${APP_URL}
BETTER_AUTH_SECRET=<your-secret>
DATABASE_URL=<your-neon-url>
BREVO_API_KEY=<your-brevo-key>
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Evolution of Todo
```

#### Backend Environment Variables:
```
DATABASE_URL=<your-neon-url>
SECRET_KEY=<your-secret-key>
CORS_ORIGINS=${frontend.PUBLIC_URL}
BREVO_API_KEY=<your-brevo-key>
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Evolution of Todo
OPENAI_API_KEY=<your-openai-key>
```

### Step 5: Configure Routes

Set up routing so the frontend serves the main domain and backend handles API:

- Frontend: `/` -> frontend:3000
- Backend: `/api` -> backend:8000 (preserve path prefix)

### Step 6: Deploy

Click **"Create Resources"** and wait for deployment (5-10 minutes).

### Step 7: Verify Deployment

1. Check the **Deployments** tab for status
2. Visit your app URL (e.g., `https://evolution-todo-xxxxx.ondigitalocean.app`)
3. Test the API at `/api/v1/health`

### Step 8: Custom Domain (Optional)

1. Go to **Settings** > **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `evolutionoftodo.com`)
4. Add the provided DNS records to your domain registrar:
   - CNAME record pointing to your app URL
5. Enable HTTPS (automatic with Let's Encrypt)

---

## Option 2: DigitalOcean Kubernetes (DOKS)

For more control and scalability, use Kubernetes.

### Step 1: Install Required Tools

```bash
# Install doctl (DigitalOcean CLI)
# Windows (using scoop)
scoop install doctl

# macOS
brew install doctl

# Authenticate with DigitalOcean
doctl auth init

# Install kubectl
# Windows
scoop install kubectl

# macOS
brew install kubectl

# Install Helm
# Windows
scoop install helm

# macOS
brew install helm
```

### Step 2: Create Kubernetes Cluster

```bash
# Create a DOKS cluster
doctl kubernetes cluster create evolution-todo \
  --region nyc1 \
  --size s-2vcpu-4gb \
  --count 2 \
  --auto-upgrade

# Configure kubectl
doctl kubernetes cluster kubeconfig save evolution-todo

# Verify connection
kubectl get nodes
```

### Step 3: Create Container Registry

```bash
# Create a container registry
doctl registry create evolution-todo-registry

# Login to registry
doctl registry login

# Get registry endpoint
doctl registry get
```

### Step 4: Build and Push Docker Images

```bash
# Set registry URL
export REGISTRY_URL=registry.digitalocean.com/evolution-todo-registry

# Build and push frontend
cd frontend
docker build -t $REGISTRY_URL/evolution-todo-frontend:latest .
docker push $REGISTRY_URL/evolution-todo-frontend:latest
cd ..

# Build and push backend
cd backend
docker build -t $REGISTRY_URL/evolution-todo-backend:latest .
docker push $REGISTRY_URL/evolution-todo-backend:latest
cd ..
```

### Step 5: Configure Kubernetes Secrets

Create a secrets file (do NOT commit this file):

```bash
# Create namespace
kubectl create namespace evolution-todo

# Create secrets
kubectl create secret generic evolution-todo-secrets \
  --namespace evolution-todo \
  --from-literal=database-url='postgresql://user:pass@host/db?sslmode=require' \
  --from-literal=better-auth-secret='your-32-char-secret-here' \
  --from-literal=secret-key='your-jwt-secret-key' \
  --from-literal=brevo-api-key='your-brevo-api-key' \
  --from-literal=openai-api-key='your-openai-api-key'
```

### Step 6: Install NGINX Ingress Controller

```bash
# Add ingress-nginx helm repo
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install ingress controller
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.publishService.enabled=true
```

### Step 7: Deploy with Helm

```bash
# Navigate to helm chart directory
cd k8s/helm/evolution-todo

# Create values override file
cat > values-production.yaml << EOF
global:
  imageRegistry: registry.digitalocean.com/evolution-todo-registry

frontend:
  replicaCount: 2
  image:
    repository: evolution-todo-frontend
    tag: latest
  ingress:
    enabled: true
    className: nginx
    hosts:
      - host: evolutionoftodo.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: frontend-tls
        hosts:
          - evolutionoftodo.com

backend:
  replicaCount: 2
  image:
    repository: evolution-todo-backend
    tag: latest
  ingress:
    enabled: true
    className: nginx
    hosts:
      - host: api.evolutionoftodo.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: backend-tls
        hosts:
          - api.evolutionoftodo.com

secrets:
  create: false
  existingSecret: evolution-todo-secrets
EOF

# Deploy
helm install evolution-todo . \
  --namespace evolution-todo \
  -f values-production.yaml
```

### Step 8: Configure DNS

Get the Load Balancer IP:

```bash
kubectl get svc -n ingress-nginx
```

Add DNS records at your registrar:
- `A` record: `evolutionoftodo.com` -> Load Balancer IP
- `A` record: `api.evolutionoftodo.com` -> Load Balancer IP

### Step 9: Install cert-manager for HTTPS

```bash
# Add cert-manager repo
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Install cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

# Create ClusterIssuer for Let's Encrypt
cat << EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Step 10: Verify Deployment

```bash
# Check pods
kubectl get pods -n evolution-todo

# Check services
kubectl get svc -n evolution-todo

# Check ingress
kubectl get ingress -n evolution-todo

# View logs
kubectl logs -n evolution-todo -l app=frontend
kubectl logs -n evolution-todo -l app=backend
```

---

## Post-Deployment Steps

### 1. Configure Neon Database

Ensure your Neon database allows connections from DigitalOcean:

1. Go to Neon Dashboard
2. Navigate to **Settings** > **Connection Pooling**
3. Enable connection pooling for better performance
4. Note the pooled connection string

### 2. Configure Better Auth

Update your Better Auth configuration with production URLs:

```typescript
// frontend/src/lib/auth.ts
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
});
```

### 3. Configure Email (Brevo)

1. Go to Brevo Dashboard
2. Verify your sending domain
3. Add SPF, DKIM, and DMARC records
4. Test email sending

### 4. Set Up Monitoring

#### App Platform:
- Built-in metrics available in the dashboard
- Set up alerts for CPU/Memory usage

#### Kubernetes:
```bash
# Install Prometheus + Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

### 5. Configure Backups

Neon PostgreSQL provides automatic backups. Configure retention:
1. Go to Neon Dashboard
2. Navigate to **Settings** > **Backup**
3. Configure point-in-time recovery window

---

## Continuous Deployment

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install doctl
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}

      # For App Platform
      - name: Deploy to App Platform
        run: doctl apps create-deployment ${{ secrets.APP_ID }}

      # For Kubernetes
      - name: Login to Container Registry
        run: doctl registry login

      - name: Build and Push Frontend
        run: |
          docker build -t registry.digitalocean.com/${{ secrets.REGISTRY }}/frontend:${{ github.sha }} ./frontend
          docker push registry.digitalocean.com/${{ secrets.REGISTRY }}/frontend:${{ github.sha }}

      - name: Build and Push Backend
        run: |
          docker build -t registry.digitalocean.com/${{ secrets.REGISTRY }}/backend:${{ github.sha }} ./backend
          docker push registry.digitalocean.com/${{ secrets.REGISTRY }}/backend:${{ github.sha }}

      - name: Deploy to Kubernetes
        run: |
          doctl kubernetes cluster kubeconfig save evolution-todo
          helm upgrade evolution-todo ./k8s/helm/evolution-todo \
            --namespace evolution-todo \
            --set frontend.image.tag=${{ github.sha }} \
            --set backend.image.tag=${{ github.sha }}
```

---

## Cost Estimation

### App Platform (Minimal):
- Frontend: $5/mo (Basic)
- Backend: $5/mo (Basic)
- **Total: ~$10/mo**

### App Platform (Production):
- Frontend: $12/mo (Professional) x 2 instances
- Backend: $12/mo (Professional) x 2 instances
- **Total: ~$48/mo**

### Kubernetes (DOKS):
- Control Plane: Free
- Worker Nodes: $24/mo (s-2vcpu-4gb) x 2
- Load Balancer: $12/mo
- Container Registry: $5/mo (500MB)
- **Total: ~$65/mo**

### External Services:
- Neon PostgreSQL: Free tier available, Pro ~$19/mo
- Brevo Email: Free tier (300 emails/day)
- OpenAI API: Pay-per-use

---

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
doctl apps logs <app-id> --type=build

# For Kubernetes
kubectl logs -n evolution-todo -l app=frontend --previous
```

#### 2. Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon IP allowlist (allow 0.0.0.0/0 for DigitalOcean)
- Test connection: `psql "$DATABASE_URL"`

#### 3. CORS Errors
- Verify CORS_ORIGINS includes your frontend URL
- Check for trailing slashes in URLs

#### 4. Auth Issues
- Verify BETTER_AUTH_URL matches your frontend URL
- Check BETTER_AUTH_SECRET is consistent across services

### Getting Help

- DigitalOcean Support: https://www.digitalocean.com/support
- DigitalOcean Community: https://www.digitalocean.com/community
- GitHub Issues: Open an issue in your repository

---

## Quick Start Checklist

- [ ] Create DigitalOcean account
- [ ] Create Neon PostgreSQL database
- [ ] Push code to GitHub
- [ ] Create App Platform app OR DOKS cluster
- [ ] Configure environment variables/secrets
- [ ] Deploy application
- [ ] Configure custom domain
- [ ] Enable HTTPS
- [ ] Test all features
- [ ] Set up monitoring
- [ ] Configure CI/CD pipeline

---

**Congratulations! Your Evolution of Todo app is now deployed on DigitalOcean!**
