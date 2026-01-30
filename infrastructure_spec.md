# Todo Chatbot Infrastructure Specification

## Overview
This document specifies the Kubernetes infrastructure requirements for deploying the Todo Chatbot application using Helm Charts. The application consists of three main components: a Next.js frontend, a FastAPI backend, and a PostgreSQL database.

## Architecture Components

### 1. PostgreSQL Database
- **Deployment**: Single replica PostgreSQL instance
- **Service**: ClusterIP service named "todo-db" for internal communication
- **PersistentVolume**: Persistent storage for database data
- **ConfigMap**: Database configuration (database name, port, etc.)
- **Secrets**: Database username, password, and other sensitive data
- **Resources**: Memory/CPU requests and limits

### 2. Backend (FastAPI)
- **Deployment**: FastAPI application deployment
- **Replicas**: 2 replicas for high availability
- **Service**: ClusterIP service for internal communication
- **ConfigMap**: Application configuration (environment variables)
- **Secrets**: API keys, database connection details
- **Resources**: CPU/memory requests and limits
- **Health Checks**: Liveness and readiness probes

### 3. Frontend (Next.js)
- **Deployment**: Next.js application deployment
- **Replicas**: 2 replicas for high availability
- **Service**: LoadBalancer service for external access (or NodePort in Minikube)
- **ConfigMap**: Frontend configuration (API endpoints, etc.)
- **Resources**: CPU/memory requests and limits
- **Health Checks**: Liveness and readiness probes

## Networking
- **Services**: Internal communication between components
- **Ingress**: Optional ingress controller for managing external access
- **External Access**: LoadBalancer service for frontend access in Minikube

## Storage
- **PersistentVolume**: For PostgreSQL data persistence
- **PersistentVolumeClaim**: Dynamic volume claim for database storage

## Environment Variables
### Backend
- DATABASE_URL: Points to the todo-db service (postgresql://user:password@todo-db:5432/todoapp)
- GEMINI_API_KEY: Google AI API key
- SECRET_KEY: JWT secret key
- DATABASE_URL: Connection string to PostgreSQL

### Frontend
- NEXT_PUBLIC_API_BASE_URL: Base URL for backend API calls

## Security Considerations
- Secrets management for sensitive data (API keys, passwords)
- Network policies (optional)
- RBAC (optional)

## Scaling Configuration
- Backend: 2 replicas as default, with resource limits
- Frontend: 2 replicas as default, with resource limits
- HPA (Horizontal Pod Autoscaler) configurations (optional)

## Health Checks
- Backend: Health check endpoint for liveness/readiness
- Frontend: Basic connectivity check
- Database: Database connectivity check

## Deployment Order
1. PostgreSQL with PVC
2. Backend service
3. Frontend service