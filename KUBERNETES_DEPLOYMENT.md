# Todo Chatbot Kubernetes Deployment

This guide provides instructions for deploying the Todo Chatbot application on Minikube using Helm Charts.

## Prerequisites

- Docker Desktop with Kubernetes enabled
- Minikube
- Helm 3
- kubectl
- kubectl-ai plugin (optional)
- kagent (optional)

## Deployment Steps

### 1. Start Minikube

```bash
minikube start
minikube addons enable ingress
minikube addons enable metrics-server
```

### 2. Build Docker Images

```bash
# Set Docker environment to Minikube
eval $(minikube docker-env)

# Build backend
cd backend
docker build -t todo-backend .
cd ..

# Build frontend
cd frontend
docker build -t todo-frontend .
cd ..
```

### 3. Install the Helm Chart

```bash
cd helm
helm install todo-chatbot .
```

### 4. Verify Installation

```bash
kubectl get pods
kubectl get services
kubectl get deployments
```

### 5. Access the Application

```bash
minikube service todo-frontend --url
```

## Using kubectl-ai and kagent

### Check Cluster Health

```bash
kubectl-ai "check the health of all pods in the default namespace"
kubectl-ai "show me the resource usage of all deployments"
kagent diagnose cluster
```

### Monitor Deployments

```bash
kubectl-ai "monitor the status of todo-backend deployment"
kubectl-ai "show me logs from the todo-frontend pods"
kagent analyze deployment todo-frontend
```

### Scale Applications

```bash
kubectl-ai "scale the todo-frontend deployment to 3 replicas"
kubectl-ai "set resource limits for the todo-backend deployment"
```

## Values Customization

The `values.yaml` file contains configurable parameters:

- `frontend.replicaCount`: Number of frontend replicas (default: 2)
- `backend.replicaCount`: Number of backend replicas (default: 2)
- `database.auth.postgresPassword`: PostgreSQL password
- `config.geminiApiKey`: Gemini API key

To customize values during installation:

```bash
helm install todo-chatbot . --set frontend.replicaCount=3 --set backend.replicaCount=3
```

## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -o wide
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Check Services
```bash
kubectl get services
kubectl describe service todo-frontend
```

### Check ConfigMaps and Secrets
```bash
kubectl get configmaps
kubectl get secrets
```

## Uninstall

```bash
helm uninstall todo-chatbot
```

## Architecture

The deployment includes:

1. **PostgreSQL Database**:
   - Persistent storage for data
   - ClusterIP service for internal access
   - Secret for database credentials

2. **Backend (FastAPI)**:
   - 2 replicas for high availability
   - Resource limits and requests
   - Health checks
   - Connection to PostgreSQL

3. **Frontend (Next.js)**:
   - 2 replicas for high availability
   - Resource limits and requests
   - Connection to backend API

All components are configured with appropriate resource limits and health checks to ensure stability and scalability.