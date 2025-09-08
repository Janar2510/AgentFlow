# 🔒 Security Policy

## Supported Versions

We actively support the following versions of AgentFlow:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes            |
| 0.9.x   | ⚠️ Limited support |
| < 0.9   | ❌ No             |

## Reporting a Vulnerability

### Security Contact

**Email**: security@agentflow.dev  
**PGP Key**: [Download Public Key](https://agentflow.dev/security/pgp-key.asc)  
**Response Time**: Within 24 hours for initial response  

### What to Include

When reporting a security vulnerability, please include:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** and exploitation scenarios
4. **Affected versions** and components
5. **Any proof-of-concept** code (if applicable)
6. **Suggested fixes** (if you have any)

### What We Promise

- **Acknowledgment** within 24 hours
- **Initial assessment** within 72 hours
- **Regular updates** on our progress
- **Credit** in our security advisories (if desired)
- **Coordinated disclosure** timeline

### Security Bug Bounty

We offer recognition and rewards for qualifying security reports:

- **Critical vulnerabilities**: $500 - $2000
- **High severity**: $200 - $500
- **Medium severity**: $50 - $200
- **Low severity**: Recognition and swag

## Security Best Practices

### For Developers

**Authentication & Authorization:**
```python
# Use strong JWT secrets
JWT_SECRET_KEY = secrets.token_urlsafe(32)

# Implement proper RBAC
@requires_permission("workflow:execute")
async def execute_workflow(user: User, workflow_id: str):
    pass

# Validate all inputs
from pydantic import BaseModel, validator

class WorkflowInput(BaseModel):
    name: str
    
    @validator('name')
    def validate_name(cls, v):
        if len(v) > 255:
            raise ValueError('Name too long')
        return v
```

**Data Protection:**
```python
# Encrypt sensitive data
from cryptography.fernet import Fernet

def encrypt_agent_config(config: dict) -> str:
    f = Fernet(settings.ENCRYPTION_KEY)
    return f.encrypt(json.dumps(config).encode())

# Use secure headers
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["agentflow.dev", "*.agentflow.dev"]
)
```

**Agent Security:**
```python
# Sandbox agent execution
import docker

def execute_agent(agent_code: str, inputs: dict):
    client = docker.from_env()
    
    # Run in restricted container
    container = client.containers.run(
        "agentflow/agent-runtime:latest",
        command=["python", "agent.py"],
        environment={
            "AGENT_INPUTS": json.dumps(inputs)
        },
        mem_limit="256m",
        cpu_period=100000,
        cpu_quota=50000,  # 50% CPU
        network_disabled=True,  # No network access
        read_only=True,
        security_opt=["no-new-privileges:true"],
        user="1000:1000"  # Non-root user
    )
```

### For Users

**API Key Security:**
```bash
# Never commit API keys to version control
echo "AGENTFLOW_API_KEY=af_..." >> .env
echo ".env" >> .gitignore

# Rotate keys regularly
agentflow auth rotate-key

# Use environment-specific keys
# Development: af_dev_...
# Production: af_prod_...
```

**Workflow Security:**
```yaml
# workflow.yaml
security:
  allowed_domains: ["api.trusted-service.com"]
  max_execution_time: 300
  require_approval: true
  audit_logs: true
```

## Common Vulnerabilities

### 1. Injection Attacks

**SQL Injection Prevention:**
```python
# ❌ Vulnerable
query = f"SELECT * FROM workflows WHERE name = '{user_input}'"

# ✅ Safe
from sqlalchemy import text
query = text("SELECT * FROM workflows WHERE name = :name")
result = await db.execute(query, {"name": user_input})
```

**Code Injection Prevention:**
```python
# ❌ Vulnerable
eval(user_code)
exec(user_provided_python)

# ✅ Safe - Use sandboxed execution
from agentflow.sandbox import safe_execute
result = safe_execute(user_code, timeout=30)
```

### 2. Authentication Bypass

**JWT Security:**
```python
# ❌ Vulnerable
def verify_token(token: str):
    # Missing signature verification
    payload = jwt.decode(token, verify=False)
    return payload

# ✅ Safe
def verify_token(token: str):
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=["HS256"]
        )
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
```

### 3. Data Exposure

**Sensitive Data Protection:**
```python
# ❌ Vulnerable - Logs sensitive data
logger.info(f"User login: {email} with password {password}")

# ✅ Safe - Sanitized logging
logger.info(f"User login attempt: {email}")

# ❌ Vulnerable - Returns internal data
return {"user": user, "internal_id": user.internal_id}

# ✅ Safe - Use response models
class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    # Exclude internal fields

return UserResponse.from_orm(user)
```

### 4. Rate Limiting Bypass

**Proper Rate Limiting:**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/workflows/execute")
@limiter.limit("10/minute")
async def execute_workflow(request: Request):
    pass
```

## Incident Response

### 1. Detection

**Monitoring Alerts:**
- Failed authentication attempts
- Unusual API usage patterns
- Agent execution anomalies
- Database query anomalies

**Log Analysis:**
```bash
# Monitor suspicious patterns
tail -f /var/log/agentflow/security.log | grep -E "(FAILED_AUTH|INJECTION_ATTEMPT|RATE_LIMIT)"

# Automated alerting
./scripts/security-monitor.sh
```

### 2. Response Procedure

**Immediate Actions:**
1. **Assess severity** (Critical/High/Medium/Low)
2. **Contain the threat** (block IPs, disable accounts)
3. **Preserve evidence** (logs, database snapshots)
4. **Notify stakeholders** (security team, management)

**Investigation:**
1. **Analyze attack vectors** and entry points
2. **Assess data impact** and exposure
3. **Identify affected systems** and users
4. **Document findings** and timeline

**Recovery:**
1. **Patch vulnerabilities** and deploy fixes
2. **Reset compromised credentials** and tokens
3. **Restore from clean backups** if needed
4. **Monitor for recurring issues**

### 3. Communication

**Internal Communication:**
- Security team notification (immediate)
- Engineering team briefing (within 2 hours)
- Management report (within 24 hours)

**External Communication:**
- Customer notification (if data affected)
- Regulatory reporting (if required)
- Public disclosure (coordinated timeline)

## Compliance & Auditing

### SOC 2 Type II Compliance

**Security Controls:**
- Multi-factor authentication (MFA)
- Regular penetration testing
- Encrypted data transmission and storage
- Access logging and monitoring
- Incident response procedures

**Audit Trail:**
```python
# Log all security-relevant events
@audit_log(action="workflow.execute", resource="workflow")
async def execute_workflow(workflow_id: str, user: User):
    logger.security(
        "Workflow execution started",
        workflow_id=workflow_id,
        user_id=user.id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
```

### GDPR Compliance

**Data Protection:**
```python
# Right to be forgotten
@app.delete("/api/users/{user_id}")
async def delete_user_data(user_id: str):
    # Anonymize user data
    await anonymize_workflows(user_id)
    await delete_execution_logs(user_id) 
    await remove_audit_trails(user_id)

# Data portability
@app.get("/api/users/{user_id}/export")
async def export_user_data(user_id: str):
    return {
        "workflows": await get_user_workflows(user_id),
        "executions": await get_user_executions(user_id),
        "personal_data": await get_user_profile(user_id)
    }
```

## Security Testing

### Automated Security Scanning

**SAST (Static Analysis):**
```bash
# Python security linting
bandit -r backend/app/

# JavaScript security scanning
npm audit

# Docker security scanning
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image agentflow/backend:latest
```

**DAST (Dynamic Analysis):**
```bash
# OWASP ZAP scanning
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://api.agentflow.dev

# API security testing
./scripts/api-security-test.sh
```

### Manual Security Testing

**Penetration Testing:**
- External penetration testing (quarterly)
- Internal security assessments (monthly)
- Code review security focus (every PR)

**Security Checklist:**
- [ ] Authentication bypass attempts
- [ ] Authorization escalation tests  
- [ ] Input validation and injection tests
- [ ] Session management security
- [ ] File upload security
- [ ] API rate limiting effectiveness
- [ ] Database access controls
- [ ] Container security configuration

## Secure Development Lifecycle

### Design Phase

**Threat Modeling:**
```
1. Identify assets (workflows, agents, user data)
2. Map attack vectors (web attacks, insider threats)
3. Analyze threats (STRIDE methodology)
4. Define mitigations (authentication, encryption)
5. Validate controls (testing, monitoring)
```

### Implementation Phase

**Security Requirements:**
- All inputs validated and sanitized
- Authentication required for sensitive operations
- Authorization checks on all resources
- Audit logging for security events
- Error handling without information disclosure

### Testing Phase

**Security Testing Integration:**
```yaml
# .github/workflows/security.yml
name: Security Checks
on: [push, pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Bandit
        run: bandit -r backend/app/
      - name: Run npm audit
        run: cd frontend && npm audit --audit-level moderate
      - name: Container scan
        run: docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image agentflow/backend:latest
```

### Deployment Phase

**Security Hardening:**
```bash
# Container security
FROM python:3.11-slim
RUN useradd -u 1000 agentflow
USER agentflow

# Network security
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: agentflow-network-policy
spec:
  podSelector:
    matchLabels:
      app: agentflow
  policyTypes:
  - Ingress
  - Egress
```

## Contact Information

**Security Team:**
- Email: security@agentflow.dev
- Emergency Phone: +1-555-SECURITY
- Slack: #security-team (internal)

**Security Champions:**
- Frontend: @security-champion-frontend
- Backend: @security-champion-backend
- Infrastructure: @security-champion-infra

**External Resources:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SANS Security Guidelines](https://www.sans.org/)
- [CIS Controls](https://www.cisecurity.org/controls/)

## Acknowledgments

We thank the following security researchers and organizations for their responsible disclosure and contributions to AgentFlow security:

- [Security Researcher Name] - CVE-2024-XXXX
- [Bug Bounty Hunter] - Authentication bypass
- [Security Firm] - Comprehensive security audit

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Next Review**: July 2024