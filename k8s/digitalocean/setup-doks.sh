#!/bin/bash
# DigitalOcean Kubernetes (DOKS) Setup Script
# This script helps set up the Evolution of Todo application on DOKS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Evolution of Todo - DOKS Setup Script${NC}"
echo -e "${GREEN}======================================${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "\n${YELLOW}Checking prerequisites...${NC}"

    if ! command -v doctl &> /dev/null; then
        echo -e "${RED}Error: doctl is not installed. Please install DigitalOcean CLI first.${NC}"
        echo "Visit: https://docs.digitalocean.com/reference/doctl/how-to/install/"
        exit 1
    fi

    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}Error: kubectl is not installed. Please install kubectl first.${NC}"
        exit 1
    fi

    if ! command -v helm &> /dev/null; then
        echo -e "${RED}Error: helm is not installed. Please install Helm first.${NC}"
        exit 1
    fi

    echo -e "${GREEN}All prerequisites met!${NC}"
}

# Authenticate with DigitalOcean
authenticate() {
    echo -e "\n${YELLOW}Authenticating with DigitalOcean...${NC}"
    doctl auth init
}

# Create DOKS cluster
create_cluster() {
    local cluster_name=${1:-evolution-todo-cluster}
    local region=${2:-nyc1}
    local node_size=${3:-s-2vcpu-4gb}
    local node_count=${4:-2}

    echo -e "\n${YELLOW}Creating DOKS cluster: ${cluster_name}${NC}"

    doctl kubernetes cluster create $cluster_name \
        --region $region \
        --size $node_size \
        --count $node_count \
        --auto-upgrade \
        --maintenance-window "saturday=04:00" \
        --wait

    echo -e "${GREEN}Cluster created successfully!${NC}"

    # Save kubeconfig
    doctl kubernetes cluster kubeconfig save $cluster_name
    echo -e "${GREEN}Kubeconfig saved!${NC}"
}

# Create Container Registry
create_registry() {
    local registry_name=${1:-evolution-todo}

    echo -e "\n${YELLOW}Creating Container Registry: ${registry_name}${NC}"

    doctl registry create $registry_name --subscription-tier basic || true

    # Get registry credentials for cluster
    doctl registry kubernetes-manifest | kubectl apply -f -

    echo -e "${GREEN}Registry created and configured!${NC}"
}

# Install NGINX Ingress Controller
install_ingress() {
    echo -e "\n${YELLOW}Installing NGINX Ingress Controller...${NC}"

    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update

    helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
        --namespace ingress-nginx \
        --create-namespace \
        --set controller.publishService.enabled=true \
        --set controller.service.type=LoadBalancer \
        --set controller.service.annotations."service\.beta\.kubernetes\.io/do-loadbalancer-name"="evolution-todo-lb" \
        --set controller.service.annotations."service\.beta\.kubernetes\.io/do-loadbalancer-protocol"="http" \
        --set controller.service.annotations."service\.beta\.kubernetes\.io/do-loadbalancer-size-slug"="lb-small" \
        --wait

    echo -e "${GREEN}Ingress controller installed!${NC}"
}

# Install cert-manager for TLS
install_cert_manager() {
    echo -e "\n${YELLOW}Installing cert-manager...${NC}"

    helm repo add jetstack https://charts.jetstack.io
    helm repo update

    helm upgrade --install cert-manager jetstack/cert-manager \
        --namespace cert-manager \
        --create-namespace \
        --set installCRDs=true \
        --wait

    # Create ClusterIssuer for Let's Encrypt
    cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
EOF

    echo -e "${GREEN}cert-manager installed!${NC}"
}

# Create secrets
create_secrets() {
    local namespace=${1:-default}

    echo -e "\n${YELLOW}Creating secrets in namespace: ${namespace}${NC}"

    # Prompt for secret values
    read -sp "Enter DATABASE_URL (Neon PostgreSQL connection string): " database_url
    echo
    read -sp "Enter BETTER_AUTH_SECRET: " auth_secret
    echo
    read -sp "Enter SECRET_KEY (for backend): " secret_key
    echo
    read -sp "Enter BREVO_API_KEY: " brevo_api_key
    echo

    kubectl create secret generic evolution-todo-secrets \
        --namespace $namespace \
        --from-literal=DATABASE_URL="$database_url" \
        --from-literal=BETTER_AUTH_SECRET="$auth_secret" \
        --from-literal=SECRET_KEY="$secret_key" \
        --from-literal=BREVO_API_KEY="$brevo_api_key" \
        --dry-run=client -o yaml | kubectl apply -f -

    echo -e "${GREEN}Secrets created!${NC}"
}

# Build and push Docker images
build_and_push() {
    local registry=${1:-registry.digitalocean.com/evolution-todo}
    local tag=${2:-latest}

    echo -e "\n${YELLOW}Building and pushing Docker images...${NC}"

    # Login to registry
    doctl registry login

    # Build frontend
    echo -e "${YELLOW}Building frontend image...${NC}"
    docker build -t $registry/frontend:$tag ../../../frontend
    docker push $registry/frontend:$tag

    # Build backend
    echo -e "${YELLOW}Building backend image...${NC}"
    docker build -t $registry/backend:$tag ../../../backend
    docker push $registry/backend:$tag

    echo -e "${GREEN}Images built and pushed!${NC}"
}

# Deploy application
deploy_app() {
    local namespace=${1:-default}
    local release_name=${2:-evolution-todo}

    echo -e "\n${YELLOW}Deploying Evolution of Todo...${NC}"

    helm upgrade --install $release_name ../helm/evolution-todo \
        --namespace $namespace \
        --create-namespace \
        -f doks-values.yaml \
        --wait

    echo -e "${GREEN}Application deployed!${NC}"
}

# Get deployment status
get_status() {
    echo -e "\n${YELLOW}Deployment Status:${NC}"

    echo -e "\n${GREEN}Pods:${NC}"
    kubectl get pods -l app.kubernetes.io/name=evolution-todo

    echo -e "\n${GREEN}Services:${NC}"
    kubectl get svc -l app.kubernetes.io/name=evolution-todo

    echo -e "\n${GREEN}Ingress:${NC}"
    kubectl get ingress -l app.kubernetes.io/name=evolution-todo

    echo -e "\n${GREEN}Load Balancer IP:${NC}"
    kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
    echo
}

# Main menu
main() {
    echo -e "\n${YELLOW}Select an option:${NC}"
    echo "1) Full setup (new cluster)"
    echo "2) Deploy to existing cluster"
    echo "3) Build and push images only"
    echo "4) Create/update secrets only"
    echo "5) Get deployment status"
    echo "6) Exit"

    read -p "Enter choice [1-6]: " choice

    case $choice in
        1)
            check_prerequisites
            authenticate
            create_cluster
            create_registry
            install_ingress
            install_cert_manager
            create_secrets
            build_and_push
            deploy_app
            get_status
            ;;
        2)
            check_prerequisites
            build_and_push
            deploy_app
            get_status
            ;;
        3)
            check_prerequisites
            build_and_push
            ;;
        4)
            create_secrets
            ;;
        5)
            get_status
            ;;
        6)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            main
            ;;
    esac
}

# Run main function
main
