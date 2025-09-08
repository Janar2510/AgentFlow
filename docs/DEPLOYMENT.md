# 🚀 Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying AgentFlow in various environments, from local development to production Kubernetes clusters.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Cloud Provider Specific](#cloud-provider-specific)
6. [Configuration Management](#configuration-management)
7. [Monitoring & Alerting](#monitoring--alerting)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **CPU**: 4 cores minimum (8+ recommended for production)
- **Memory**: 8GB minimum (16GB+ recommended for production)
- **Storage**: 50GB minimum (SSD recommended)
- **Network**: Stable internet connection for agent marketplace

### Required Software
- Docker 24.0+
- Docker Compose 2.20+
- Kubernetes 1.28+ (for production deployment)
- kubectl CLI tool
- Helm 3.12+

### Required Services
- PostgreSQL 15+ (or managed database service)
- Redis 7+ (or managed cache service)
- Object storage (S3-compatible)

## Local Development

### Quick Start

1. **Clone and Setup**
   ```bash
   git clone https://github.com/your-org/agentflow.git
   cd agentflow
   cp .env.example .env
   ```

2. **Configure Environment**
   ```bash
   # Edit .env file with your settings
   vim .env
   
   # Required variables:
   DATABASE_URL=postgresql://agentflow:password@localhost:5432/agentflow
   REDIS_URL=redis://localhost:6379/0
   API_SECRET_KEY=your-super-secret-key
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

3. **Start Development Environment**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Check status
   docker-compose ps
   ```

4. **Access Applications**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Grafana: http://localhost:3001 (admin/admin)
   - Prometheus: http://localhost:9090

### Development Workflow

```bash
# Hot reload development
cd frontend && npm run dev          # Frontend with hot reload
cd backend && python main.py       # Backend with auto-reload

# Database migrations
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head

# Testing
npm test                            # Frontend tests
pytest                             # Backend tests
```

## Docker Deployment

### Production Docker Compose

Create a production-ready docker-compose.yml:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=https://api.yourdomain.com
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - API_SECRET_KEY=${API_SECRET_KEY}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=agentflow
      - POSTGRES_USER=agentflow
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  redis_data:
```

### Deployment Steps

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Initialize database
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Check health
curl http://localhost:8000/health
```

## Kubernetes Deployment

### Cluster Requirements

```yaml
# Minimum cluster specs
nodes: 3
cpu_per_node: 4 cores
memory_per_node: 8GB
storage: 100GB SSD per node
kubernetes_version: "1.28+"
```

### Prerequisites

1. **Install Required Tools**
   ```bash
   # Install kubectl
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
   
   # Install Helm
   curl https://get.helm.sh/helm-v3.12.0-linux-amd64.tar.gz | tar xzf -
   sudo mv linux-amd64/helm /usr/local/bin/
   ```

2. **Setup Namespace**
   ```bash
   kubectl create namespace agentflow
   kubectl config set-context --current --namespace=agentflow
   ```

### Database Setup

**Option 1: Managed Database (Recommended for Production)**
```bash
# Use cloud provider's managed PostgreSQL
# AWS RDS, GCP Cloud SQL, Azure Database, etc.
DATABASE_URL=postgresql://user:pass@managed-db-host:5432/agentflow
```

**Option 2: In-Cluster PostgreSQL**
```bash
# Add Bitnami Helm repo
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Install PostgreSQL
helm install postgres bitnami/postgresql \
  --set auth.postgresPassword=secure-password \
  --set auth.database=agentflow \
  --set primary.persistence.size=100Gi \
  --set primary.resources.requests.memory=2Gi \
  --set primary.resources.requests.cpu=1000m
```

### Application Deployment

1. **Create Configuration**
   ```yaml
   # k8s/configmap.yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: agentflow-config
   data:
     DATABASE_URL: "postgresql://agentflow:password@postgres:5432/agentflow"
     REDIS_URL: "redis://redis:6379/0"
     LOG_LEVEL: "INFO"
   ```

2. **Create Secrets**
   ```bash
   kubectl create secret generic agentflow-secrets \
     --from-literal=api-secret-key=your-super-secret-key \
     --from-literal=jwt-secret-key=your-jwt-secret \
     --from-literal=openai-api-key=sk-your-openai-key
   ```

3. **Deploy Application**
   ```bash
   # Apply all Kubernetes manifests
   kubectl apply -f k8s/
   
   # Or use Helm chart
   helm install agentflow ./helm/agentflow \
     --values ./helm/agentflow/values.prod.yaml
   ```

### Scaling Configuration

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agentflow-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: agentflow-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Ingress Configuration

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: agentflow-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/websocket-services: "agentflow-backend"
spec:
  tls:
  - hosts:
    - agentflow.yourdomain.com
    - api.agentflow.yourdomain.com
    secretName: agentflow-tls
  rules:
  - host: agentflow.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: agentflow-frontend
            port:
              number: 80
  - host: api.agentflow.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: agentflow-backend
            port:
              number: 8000
```

## Cloud Provider Specific

### AWS Deployment

**Prerequisites:**
- EKS cluster or EC2 instances
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- S3 bucket for file storage
- Application Load Balancer

**Terraform Configuration:**
```hcl
# terraform/aws/main.tf
resource "aws_eks_cluster" "agentflow" {
  name     = "agentflow-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  
  vpc_config {
    subnet_ids = aws_subnet.private[*].id
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]
}

resource "aws_rds_instance" "postgres" {
  identifier        = "agentflow-db"
  engine           = "postgres"
  engine_version   = "15.4"
  instance_class   = "db.t3.medium"
  allocated_storage = 100
  
  db_name  = "agentflow"
  username = "agentflow"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  skip_final_snapshot = false
  final_snapshot_identifier = "agentflow-final-snapshot"
}
```

**Deployment:**
```bash
# Initialize Terraform
cd terraform/aws
terraform init
terraform plan
terraform apply

# Deploy to EKS
aws eks update-kubeconfig --region us-east-1 --name agentflow-cluster
kubectl apply -f k8s/aws/
```

### Google Cloud Deployment

**Prerequisites:**
- GKE cluster
- Cloud SQL PostgreSQL
- Memorystore Redis
- Cloud Storage bucket

**Deployment:**
```bash
# Create GKE cluster
gcloud container clusters create agentflow-cluster \
  --num-nodes=3 \
  --machine-type=e2-standard-4 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10

# Get credentials
gcloud container clusters get-credentials agentflow-cluster

# Deploy application
kubectl apply -f k8s/gcp/
```

### Azure Deployment

**Prerequisites:**
- AKS cluster
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure Blob Storage

**Deployment:**
```bash
# Create AKS cluster
az aks create \
  --resource-group agentflow-rg \
  --name agentflow-cluster \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-cluster-autoscaler \
  --min-count 1 \
  --max-count 10

# Get credentials
az aks get-credentials --resource-group agentflow-rg --name agentflow-cluster

# Deploy application
kubectl apply -f k8s/azure/
```

## Configuration Management

### Environment Variables

**Core Configuration:**
```bash
# Application
API_SECRET_KEY=your-super-secret-key-change-this
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=false

# Database
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port/0

# AI Providers
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Storage
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=agentflow-storage
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
PROMETHEUS_ENABLED=true
```

### Feature Flags

```bash
# Feature toggles
FEATURE_MARKETPLACE_ENABLED=true
FEATURE_COLLABORATIVE_EDITING=true
FEATURE_ADVANCED_ANALYTICS=true

# Rate limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST_SIZE=10
```

### Security Configuration

```bash
# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
DEV_CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

## Monitoring & Alerting

### Prometheus Configuration

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'agentflow-backend'
    static_configs:
      - targets: ['agentflow-backend:8000']
    metrics_path: '/metrics'
    
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

### Grafana Dashboards

**Key Metrics to Monitor:**
- Request rate and response times
- Error rates by endpoint
- Database connection pool usage
- Redis cache hit rates
- Workflow execution success rates
- Active WebSocket connections
- Resource utilization (CPU, Memory, Disk)

### Alerting Rules

```yaml
# monitoring/prometheus/alerts.yml
groups:
  - name: agentflow
    rules:
      - alert: HighErrorRate
        expr: rate(agentflow_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          
      - alert: DatabaseConnectionsHigh
        expr: agentflow_db_connections_active / agentflow_db_connections_max > 0.8
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool near exhaustion"
```

## Troubleshooting

### Common Issues

**1. Database Connection Issues**
```bash
# Check database connectivity
kubectl exec -it agentflow-backend-xxx -- python -c "
from app.core.database import check_database_health
import asyncio
print(asyncio.run(check_database_health()))
"

# Check connection pool status
kubectl logs -f agentflow-backend-xxx | grep "database"
```

**2. Redis Connection Problems**
```bash
# Test Redis connectivity
kubectl exec -it agentflow-backend-xxx -- redis-cli -h redis ping

# Check Redis logs
kubectl logs redis-xxx
```

**3. High Memory Usage**
```bash
# Check memory usage by pod
kubectl top pods

# Get detailed resource usage
kubectl describe pod agentflow-backend-xxx
```

**4. WebSocket Connection Issues**
```bash
# Check WebSocket logs
kubectl logs -f agentflow-backend-xxx | grep -i websocket

# Test WebSocket endpoint
wscat -c ws://localhost:8000/ws
```

### Debug Commands

```bash
# Get pod status
kubectl get pods -o wide

# Describe problematic pod
kubectl describe pod agentflow-backend-xxx

# Get pod logs
kubectl logs -f agentflow-backend-xxx --previous

# Execute commands in pod
kubectl exec -it agentflow-backend-xxx -- bash

# Port forward for debugging
kubectl port-forward svc/agentflow-backend 8000:8000

# Check resource usage
kubectl top nodes
kubectl top pods

# Get events
kubectl get events --sort-by='.metadata.creationTimestamp'
```

### Performance Tuning

**Database Optimization:**
```sql
-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_workflows_user_id ON workflows(user_id);
CREATE INDEX CONCURRENTLY idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX CONCURRENTLY idx_executions_status ON executions(status);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM workflows WHERE user_id = 'xxx';
```

**Redis Optimization:**
```bash
# Monitor Redis performance
redis-cli --latency-history -i 1

# Check memory usage
redis-cli info memory

# Optimize configuration
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Health Checks

**Application Health:**
```bash
# Check all health endpoints
curl http://localhost:8000/health
curl http://localhost:8000/health/ready

# Database health
curl http://localhost:8000/api/v1/health
```

**Infrastructure Health:**
```bash
# Check cluster health
kubectl cluster-info
kubectl get componentstatuses

# Check node health
kubectl get nodes
kubectl describe nodes
```

## Backup & Recovery

### Database Backups

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /backups/agentflow_$DATE.sql
aws s3 cp /backups/agentflow_$DATE.sql s3://agentflow-backups/

# Restore from backup
psql $DATABASE_URL < /backups/agentflow_20240101_120000.sql
```

### Disaster Recovery

```bash
# Full cluster backup
velero backup create agentflow-backup --include-namespaces agentflow

# Restore from backup
velero restore create --from-backup agentflow-backup
```

## Security Checklist

- [ ] All secrets stored in Kubernetes secrets
- [ ] TLS certificates configured and auto-renewing
- [ ] Network policies implemented
- [ ] RBAC configured for service accounts
- [ ] Container images scanned for vulnerabilities
- [ ] Database credentials rotated regularly
- [ ] Audit logging enabled
- [ ] Rate limiting configured
- [ ] CORS policies properly configured
- [ ] Security headers implemented

## Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Review application logs for errors
- Check resource utilization trends
- Update security patches

**Monthly:**
- Review and rotate secrets
- Analyze performance metrics
- Update dependencies

**Quarterly:**
- Disaster recovery testing
- Security audit
- Capacity planning review