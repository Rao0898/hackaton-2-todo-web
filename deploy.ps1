# Todo Chatbot Kubernetes Deployment Script (PowerShell)
# This script deploys the Todo Chatbot application on Minikube using Helm

Write-Host "Starting Todo Chatbot deployment on Minikube..." -ForegroundColor Green

# Step 1: Start Minikube if not already running
Write-Host "Step 1: Checking Minikube status..." -ForegroundColor Yellow
minikube status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Starting Minikube..." -ForegroundColor Yellow
    minikube start
}

# Step 2: Enable required addons
Write-Host "Step 2: Enabling required Minikube addons..." -ForegroundColor Yellow
minikube addons enable ingress
minikube addons enable metrics-server

# Step 3: Verify cluster health
Write-Host "Step 3: Verifying cluster health..." -ForegroundColor Yellow
kubectl cluster-info
kubectl get nodes

# Step 4: Build and load Docker images to Minikube
Write-Host "Step 4: Building and loading Docker images..." -ForegroundColor Yellow
& minikube docker-env | Invoke-Expression
Set-Location "../backend"
docker build -t todo-backend .
Set-Location "../frontend"
docker build -t todo-frontend .

# Step 5: Deploy using Helm
Write-Host "Step 5: Deploying using Helm..." -ForegroundColor Yellow
Set-Location "../helm"
helm lint .
helm install todo-chatbot .

# Step 6: Wait for deployments to be ready
Write-Host "Step 6: Waiting for deployments to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=todo-db --timeout=180s
kubectl wait --for=condition=ready pod -l app=todo-backend --timeout=180s
kubectl wait --for=condition=ready pod -l app=todo-frontend --timeout=180s

# Step 7: Check deployment status
Write-Host "Step 7: Checking deployment status..." -ForegroundColor Yellow
kubectl get deployments
kubectl get services
kubectl get pods

# Step 8: Get frontend external access
Write-Host "Step 8: Getting frontend access point..." -ForegroundColor Yellow
minikube service todo-frontend --url

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "You can access the frontend at the URL shown above."