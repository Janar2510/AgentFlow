# 🔌 API Reference

## Overview

The AgentFlow API provides comprehensive access to workflow management, agent execution, and real-time collaboration features. This RESTful API uses JSON for data exchange and follows OpenAPI 3.0 specifications.

**Base URL:** `https://api.agentflow.dev/api/v1`  
**Authentication:** JWT Bearer tokens  
**Rate Limits:** 60 requests per minute (burst: 10)  

## Table of Contents

1. [Authentication](#authentication)
2. [Workflows](#workflows)
3. [Agents](#agents)
4. [Executions](#executions)
5. [Users](#users)
6. [WebSocket API](#websocket-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [SDKs & Libraries](#sdks--libraries)

## Authentication

### POST /auth/login

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "developer"
  }
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Authentication Headers

Include the JWT token in all authenticated requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Workflows

### GET /workflows

List all workflows with optional filtering and pagination.

**Query Parameters:**
- `skip` (integer): Number of workflows to skip (default: 0)
- `limit` (integer): Maximum workflows to return (default: 100, max: 1000)
- `search` (string): Search in workflow names and descriptions
- `tag` (string): Filter by tag
- `status` (string): Filter by status (draft, active, archived)
- `created_after` (ISO datetime): Filter by creation date
- `sort` (string): Sort field (name, created_at, updated_at)
- `order` (string): Sort order (asc, desc)

**Example Request:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.agentflow.dev/api/v1/workflows?limit=10&search=customer&sort=updated_at&order=desc"
```

**Response (200):**
```json
{
  "workflows": [
    {
      "id": "wf_123abc",
      "name": "Customer Onboarding Flow",
      "description": "Automated customer onboarding with AI assistance",
      "status": "active",
      "tags": ["onboarding", "ai", "automation"],
      "version": "1.2.0",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:45:00Z",
      "created_by": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "execution_count": 156,
      "success_rate": 94.2,
      "avg_duration": 45.3
    }
  ],
  "total": 25,
  "skip": 0,
  "limit": 10,
  "has_more": true
}
```

### GET /workflows/{workflow_id}

Retrieve a specific workflow with complete definition.

**Path Parameters:**
- `workflow_id` (string): Unique workflow identifier

**Example Request:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.agentflow.dev/api/v1/workflows/wf_123abc"
```

**Response (200):**
```json
{
  "id": "wf_123abc",
  "name": "Customer Onboarding Flow",
  "description": "Automated customer onboarding with AI assistance",
  "status": "active",
  "tags": ["onboarding", "ai", "automation"],
  "version": "1.2.0",
  "definition": {
    "nodes": [
      {
        "id": "node_1",
        "type": "input",
        "position": { "x": 100, "y": 100 },
        "data": {
          "label": "Customer Data Input",
          "schema": {
            "type": "object",
            "properties": {
              "email": { "type": "string", "format": "email" },
              "name": { "type": "string" },
              "company": { "type": "string" }
            },
            "required": ["email", "name"]
          }
        }
      },
      {
        "id": "node_2",
        "type": "ai_agent",
        "position": { "x": 300, "y": 100 },
        "data": {
          "label": "Personalization Agent",
          "agent_id": "agent_456",
          "config": {
            "model": "gpt-4",
            "temperature": 0.7,
            "max_tokens": 500,
            "system_prompt": "You are a helpful customer onboarding assistant..."
          }
        }
      }
    ],
    "edges": [
      {
        "id": "edge_1",
        "source": "node_1",
        "target": "node_2",
        "sourceHandle": "output",
        "targetHandle": "input"
      }
    ]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:45:00Z",
  "created_by": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "collaborators": [
    {
      "user_id": "user_456",
      "name": "Jane Smith",
      "role": "editor",
      "last_active": "2024-01-20T14:30:00Z"
    }
  ]
}
```

### POST /workflows

Create a new workflow.

**Request Body:**
```json
{
  "name": "New Workflow",
  "description": "Description of the workflow",
  "tags": ["tag1", "tag2"],
  "definition": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response (201):**
```json
{
  "id": "wf_789def",
  "name": "New Workflow",
  "description": "Description of the workflow",
  "status": "draft",
  "tags": ["tag1", "tag2"],
  "version": "1.0.0",
  "definition": { ... },
  "created_at": "2024-01-21T09:15:00Z",
  "updated_at": "2024-01-21T09:15:00Z",
  "created_by": { ... }
}
```

### PUT /workflows/{workflow_id}

Update an existing workflow.

**Request Body:**
```json
{
  "name": "Updated Workflow Name",
  "description": "Updated description",
  "definition": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response (200):**
```json
{
  "id": "wf_123abc",
  "name": "Updated Workflow Name",
  "description": "Updated description",
  "status": "active",
  "version": "1.3.0",
  "definition": { ... },
  "updated_at": "2024-01-21T10:30:00Z"
}
```

### DELETE /workflows/{workflow_id}

Delete a workflow (soft delete by default).

**Query Parameters:**
- `hard_delete` (boolean): Permanently delete the workflow (default: false)

**Response (204):**
No content

### POST /workflows/{workflow_id}/execute

Execute a workflow with provided inputs.

**Request Body:**
```json
{
  "inputs": {
    "customer_email": "customer@example.com",
    "customer_name": "Alice Johnson",
    "company": "Acme Corp"
  },
  "parameters": {
    "timeout": 300,
    "retry_count": 3,
    "environment": "production"
  }
}
```

**Response (200):**
```json
{
  "execution_id": "exec_789xyz",
  "workflow_id": "wf_123abc",
  "status": "running",
  "inputs": { ... },
  "parameters": { ... },
  "started_at": "2024-01-21T10:30:00Z",
  "estimated_duration": 120,
  "progress": {
    "completed_nodes": 0,
    "total_nodes": 5,
    "percentage": 0
  }
}
```

### GET /workflows/{workflow_id}/executions

Get execution history for a workflow.

**Query Parameters:**
- `skip` (integer): Number of executions to skip
- `limit` (integer): Maximum executions to return
- `status` (string): Filter by execution status
- `started_after` (ISO datetime): Filter by start date

**Response (200):**
```json
{
  "executions": [
    {
      "id": "exec_789xyz",
      "status": "completed",
      "started_at": "2024-01-21T10:30:00Z",
      "completed_at": "2024-01-21T10:32:15Z",
      "duration": 135,
      "success": true,
      "outputs": { ... },
      "error": null
    }
  ],
  "total": 156,
  "workflow_id": "wf_123abc"
}
```

## Agents

### GET /agents

List all available agents in the marketplace.

**Query Parameters:**
- `skip` (integer): Pagination offset
- `limit` (integer): Maximum agents to return
- `search` (string): Search in agent names and descriptions
- `category` (string): Filter by category (ai, data, automation, integration)
- `tag` (string): Filter by tag
- `featured` (boolean): Show only featured agents
- `sort` (string): Sort field (name, downloads, rating, created_at)

**Response (200):**
```json
{
  "agents": [
    {
      "id": "agent_123",
      "name": "GPT-4 Text Generator",
      "description": "Generate high-quality text using OpenAI's GPT-4",
      "category": "ai",
      "tags": ["openai", "text-generation", "nlp"],
      "version": "2.1.0",
      "author": {
        "id": "publisher_456",
        "name": "AgentFlow Team",
        "verified": true
      },
      "rating": 4.8,
      "download_count": 15420,
      "featured": true,
      "pricing": "freemium",
      "input_schema": { ... },
      "output_schema": { ... },
      "configuration_schema": { ... },
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-18T12:00:00Z"
    }
  ],
  "total": 156,
  "categories": ["ai", "data", "automation", "integration"],
  "tags": ["openai", "anthropic", "webhook", "email"]
}
```

### GET /agents/{agent_id}

Get detailed information about a specific agent.

**Response (200):**
```json
{
  "id": "agent_123",
  "name": "GPT-4 Text Generator",
  "description": "Generate high-quality text using OpenAI's GPT-4",
  "long_description": "This agent provides seamless integration with OpenAI's GPT-4...",
  "category": "ai",
  "tags": ["openai", "text-generation", "nlp"],
  "version": "2.1.0",
  "author": { ... },
  "rating": 4.8,
  "review_count": 342,
  "download_count": 15420,
  "documentation": {
    "readme": "# GPT-4 Text Generator\n\n...",
    "examples": [...],
    "changelog": "## Version 2.1.0\n- Improved error handling\n..."
  },
  "configuration": {
    "schema": {
      "type": "object",
      "properties": {
        "model": {
          "type": "string",
          "enum": ["gpt-4", "gpt-4-turbo"],
          "default": "gpt-4"
        },
        "temperature": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "default": 0.7
        }
      }
    }
  },
  "input_schema": { ... },
  "output_schema": { ... },
  "requirements": {
    "api_keys": ["OPENAI_API_KEY"],
    "permissions": ["internet_access"],
    "resources": {
      "cpu": "100m",
      "memory": "256Mi"
    }
  }
}
```

### POST /agents

Publish a new agent to the marketplace.

**Request Body:**
```json
{
  "name": "My Custom Agent",
  "description": "A custom agent for specific tasks",
  "category": "automation",
  "tags": ["custom", "workflow"],
  "configuration_schema": { ... },
  "input_schema": { ... },
  "output_schema": { ... },
  "code": "base64_encoded_agent_code",
  "documentation": {
    "readme": "# My Custom Agent\n\n...",
    "examples": [...]
  }
}
```

## Executions

### GET /executions/{execution_id}

Get detailed execution information including logs and outputs.

**Response (200):**
```json
{
  "id": "exec_789xyz",
  "workflow_id": "wf_123abc",
  "status": "completed",
  "inputs": { ... },
  "outputs": {
    "result": "Generated personalized onboarding email",
    "metadata": {
      "tokens_used": 245,
      "processing_time": 2.3,
      "cost_usd": 0.0049
    }
  },
  "started_at": "2024-01-21T10:30:00Z",
  "completed_at": "2024-01-21T10:32:15Z",
  "duration": 135,
  "progress": {
    "completed_nodes": 5,
    "total_nodes": 5,
    "percentage": 100
  },
  "node_executions": [
    {
      "node_id": "node_1",
      "status": "completed",
      "started_at": "2024-01-21T10:30:00Z",
      "completed_at": "2024-01-21T10:30:05Z",
      "duration": 5,
      "inputs": { ... },
      "outputs": { ... }
    }
  ],
  "logs": [
    {
      "timestamp": "2024-01-21T10:30:00Z",
      "level": "info",
      "message": "Execution started",
      "node_id": null
    },
    {
      "timestamp": "2024-01-21T10:30:05Z",
      "level": "info",
      "message": "Input validation completed",
      "node_id": "node_1"
    }
  ]
}
```

### POST /executions/{execution_id}/stop

Stop a running execution.

**Response (200):**
```json
{
  "id": "exec_789xyz",
  "status": "stopped",
  "stopped_at": "2024-01-21T10:31:30Z",
  "message": "Execution stopped by user request"
}
```

## WebSocket API

Real-time updates for workflow execution, collaboration, and system events.

### Connection

Connect to the WebSocket endpoint:

```javascript
const ws = new WebSocket('wss://api.agentflow.dev/ws');

// Send authentication
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'authenticate',
    token: 'your_jwt_token'
  }));
};
```

### Subscription

Subscribe to specific channels:

```javascript
// Subscribe to workflow updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['workflow:wf_123abc', 'executions', 'system']
}));
```

### Message Types

**Workflow Updates:**
```json
{
  "type": "workflow_updated",
  "channel": "workflow:wf_123abc",
  "data": {
    "workflow_id": "wf_123abc",
    "changes": {
      "nodes": ["node_1", "node_2"],
      "edges": ["edge_1"]
    },
    "user": {
      "id": "user_456",
      "name": "Jane Smith"
    }
  },
  "timestamp": "2024-01-21T10:30:00Z"
}
```

**Execution Updates:**
```json
{
  "type": "execution_progress",
  "channel": "execution:exec_789xyz",
  "data": {
    "execution_id": "exec_789xyz",
    "status": "running",
    "progress": {
      "completed_nodes": 2,
      "total_nodes": 5,
      "percentage": 40
    },
    "current_node": "node_3"
  },
  "timestamp": "2024-01-21T10:31:00Z"
}
```

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "request_id": "req_123abc456",
    "timestamp": "2024-01-21T10:30:00Z"
  }
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **204**: No Content
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (resource already exists)
- **422**: Unprocessable Entity (business logic errors)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error
- **503**: Service Unavailable

### Common Error Codes

```json
{
  "VALIDATION_ERROR": "Request validation failed",
  "AUTHENTICATION_FAILED": "Invalid credentials",
  "TOKEN_EXPIRED": "JWT token has expired",
  "INSUFFICIENT_PERMISSIONS": "User lacks required permissions",
  "RESOURCE_NOT_FOUND": "Requested resource not found",
  "RATE_LIMIT_EXCEEDED": "Too many requests",
  "WORKFLOW_EXECUTION_FAILED": "Workflow execution error",
  "AGENT_NOT_AVAILABLE": "Requested agent is not available",
  "QUOTA_EXCEEDED": "Usage quota exceeded"
}
```

## Rate Limiting

### Limits

- **Default**: 60 requests per minute per user
- **Burst**: Up to 10 requests in a short burst
- **Execution**: 10 workflow executions per minute
- **Upload**: 5 agent uploads per hour

### Headers

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 15
```

### Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retry_after": 15
  }
}
```

## SDKs & Libraries

### JavaScript/TypeScript SDK

```bash
npm install @agentflow/sdk
```

```typescript
import { AgentFlowClient } from '@agentflow/sdk';

const client = new AgentFlowClient({
  apiKey: 'your_api_key',
  baseURL: 'https://api.agentflow.dev'
});

// List workflows
const workflows = await client.workflows.list({
  limit: 10,
  search: 'customer'
});

// Execute workflow
const execution = await client.workflows.execute('wf_123abc', {
  inputs: { email: 'customer@example.com' }
});
```

### Python SDK

```bash
pip install agentflow-python
```

```python
from agentflow import AgentFlowClient

client = AgentFlowClient(
    api_key='your_api_key',
    base_url='https://api.agentflow.dev'
)

# List workflows
workflows = client.workflows.list(limit=10, search='customer')

# Execute workflow
execution = client.workflows.execute('wf_123abc', {
    'inputs': {'email': 'customer@example.com'}
})
```

### CLI Tool

```bash
# Install CLI
npm install -g @agentflow/cli

# Login
agentflow auth login

# List workflows
agentflow workflows list

# Execute workflow
agentflow workflows execute wf_123abc --input email=customer@example.com
```

## Webhooks

Configure webhooks to receive notifications about workflow events:

### Webhook Configuration

```json
{
  "url": "https://your-app.com/webhooks/agentflow",
  "events": [
    "workflow.execution.completed",
    "workflow.execution.failed",
    "workflow.updated"
  ],
  "secret": "webhook_secret_key"
}
```

### Webhook Payload

```json
{
  "event": "workflow.execution.completed",
  "data": {
    "execution_id": "exec_789xyz",
    "workflow_id": "wf_123abc",
    "status": "completed",
    "outputs": { ... }
  },
  "timestamp": "2024-01-21T10:32:15Z",
  "signature": "sha256=abc123..."
}
```

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
- **Interactive Docs**: https://api.agentflow.dev/docs
- **OpenAPI JSON**: https://api.agentflow.dev/openapi.json
- **Redoc**: https://api.agentflow.dev/redoc

## Support

For API support and questions:
- **Documentation**: https://docs.agentflow.dev
- **Community**: https://community.agentflow.dev
- **Email**: api-support@agentflow.dev
- **Status Page**: https://status.agentflow.dev