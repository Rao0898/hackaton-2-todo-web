#!/bin/bash

# Todo Chatbot Kubernetes Deployment Script
# This script deploys the Todo Chatbot application on Minikube using Helm

echo "Starting Todo Chatbot deployment on Minikube..."

# Step 1: Start Minikube if not already running
echo "Step 1: Checking Minikube status..."
minikube status
if [ $? -ne 0 ]; then
    echo "Starting Minikube..."
    minikube start
fi

# Step 2: Enable required addons
echo "Step 2: Enabling required Minikube addons..."
minikube addons enable ingress
minikube addons enable metrics-server

# Step 3: Verify cluster health
echo "Step 3: Verifying cluster health..."
kubectl cluster-info
kubectl get nodes

# Step 4: Build and load Docker images to Minikube
echo "Step 4: Building and loading Docker images..."
eval $(minikube docker-env)
cd ../backend
docker build -t todo-backend .
cd ../frontend
docker build -t todo-frontend .

# Step 5: Deploy using Helm
echo "Step 5: Deploying using Helm..."
cd ../helm
helm lint .
helm install todo-chatbot .

# Step 6: Wait for deployments to be ready
echo "Step 6: Waiting for deployments to be ready..."
kubectl wait --for=condition=ready pod -l app=todo-db --timeout=180s
kubectl wait --for=condition=ready pod -l app=todo-backend --timeout=180s
kubectl wait --for=condition=ready pod -l app=todo-frontend --timeout=180s

# Step 7: Check deployment status
echo "Step 7: Checking deployment status..."
kubectl get deployments
kubectl get services
kubectl get pods

# Step 8: Get frontend external access
echo "Step 8: Getting frontend access point..."
minikube service todo-frontend --url

echo "Deployment completed successfully!"
echo "You can access the frontend at the URL shown above."