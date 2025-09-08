# 🛠️ Contributing to AgentFlow

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or creating new agents, your help is appreciated.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Contribution Types](#contribution-types)
5. [Pull Request Process](#pull-request-process)
6. [Code Standards](#code-standards)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)
9. [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone, regardless of:
- Background and identity
- Level of experience
- Education
- Socio-economic status
- Nationality
- Personal appearance
- Race, ethnicity, or religion
- Sexual identity and orientation

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment of any form
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.11+** with pip
- **Docker** and Docker Compose
- **Git** for version control

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/agentflow.git
   cd agentflow
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/agentflow/agentflow.git
   ```

### Development Setup

1. **Install dependencies**:
   ```bash
   # Frontend
   cd frontend && npm install
   
   # Backend
   cd backend && pip install -r requirements.txt -r requirements-dev.txt
   ```

2. **Start development environment**:
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Start services
   docker-compose up -d
   
   # Start frontend (in separate terminal)
   cd frontend && npm run dev
   
   # Start backend (in separate terminal)
   cd backend && python main.py
   ```

3. **Verify setup**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

```bash
# Features
git checkout -b feature/add-workflow-templates
git checkout -b feature/agent-marketplace-search

# Bug fixes
git checkout -b fix/websocket-connection-timeout
git checkout -b fix/execution-error-handling

# Documentation
git checkout -b docs/api-reference-update
git checkout -b docs/deployment-guide

# Refactoring
git checkout -b refactor/database-queries
git checkout -b refactor/component-structure
```

### Commit Messages

Follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```bash
# Format
<type>(<scope>): <description>

# Examples
feat(frontend): add drag-and-drop workflow designer
fix(backend): resolve database connection pooling issue
docs(api): update workflow execution endpoints
test(agents): add unit tests for sentiment analyzer
refactor(ui): simplify component prop interfaces
perf(execution): optimize workflow node processing
chore(deps): update React to v18.2.0
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your local main
git checkout main
git merge upstream/main

# Push updated main to your fork
git push origin main

# Rebase your feature branch
git checkout feature/your-branch
git rebase main
```

## Contribution Types

### 1. Code Contributions

**Frontend (React/TypeScript):**
- UI components and pages
- Workflow designer features
- Real-time collaboration
- Performance optimizations

**Backend (Python/FastAPI):**
- API endpoints and services
- Database models and migrations
- Agent execution engine
- Authentication and security

**Infrastructure:**
- Kubernetes manifests
- Docker configurations
- CI/CD pipelines
- Monitoring and logging

### 2. Agent Development

Create new agents for the marketplace:

```bash
# Create new agent
agentflow agents create my-new-agent

# Develop and test
cd my-new-agent
# ... implement agent logic ...

# Submit for review
agentflow agents submit
```

### 3. Documentation

- API documentation
- User guides and tutorials
- Architecture documents
- Code comments and docstrings

### 4. Testing

- Unit tests
- Integration tests
- End-to-end tests
- Performance tests

### 5. Bug Reports

Use GitHub Issues with detailed information:

```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: macOS 14.2
- Browser: Chrome 120
- AgentFlow Version: 1.2.0

**Screenshots**
If applicable, add screenshots

**Additional Context**
Any other relevant information
```

## Pull Request Process

### 1. Before Creating PR

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No merge conflicts

### 2. Creating the Pull Request

**Title Format:**
```
<type>(<scope>): <description>

Example:
feat(workflows): add template gallery with search and filtering
```

**Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List specific changes
- Include technical details
- Mention any dependencies

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots of UI changes

## Breaking Changes
List any breaking changes

## Additional Notes
Any additional context or considerations
```

### 3. Review Process

1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: Team members review your code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves the PR
5. **Merge**: PR is merged into main branch

### 4. After Merge

- Delete your feature branch
- Pull latest main branch
- Start new feature branch for next contribution

## Code Standards

### Frontend (TypeScript/React)

**File Organization:**
```
src/
├── components/
│   └── workflow/
│       ├── WorkflowDesigner.tsx
│       ├── NodePalette.tsx
│       └── index.ts
├── hooks/
│   └── useWorkflow.ts
├── types/
│   └── workflow.ts
└── utils/
    └── validation.ts
```

**Naming Conventions:**
- **Components**: PascalCase (`WorkflowDesigner`)
- **Files**: PascalCase for components, camelCase for others
- **Variables**: camelCase (`workflowData`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)

**TypeScript Best Practices:**
```typescript
// Use interfaces for object types
interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: Record<string, unknown>
}

// Use enums for constants
enum NodeType {
  INPUT = 'input',
  OUTPUT = 'output',
  PROCESS = 'process'
}

// Use generic types
function processNodes<T extends WorkflowNode>(nodes: T[]): T[] {
  return nodes.filter(node => node.type !== NodeType.INPUT)
}

// Prefer type guards
function isProcessNode(node: WorkflowNode): node is ProcessNode {
  return node.type === NodeType.PROCESS
}
```

**React Best Practices:**
```tsx
// Use function components with hooks
export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({ 
  workflowId,
  onSave 
}) => {
  const [nodes, setNodes] = useState<Node[]>([])
  
  // Custom hooks for reusable logic
  const { workflow, updateWorkflow } = useWorkflow(workflowId)
  
  // Memoize expensive computations
  const processedNodes = useMemo(
    () => processNodes(nodes),
    [nodes]
  )
  
  // Use callbacks for event handlers
  const handleNodeAdd = useCallback((node: Node) => {
    setNodes(prev => [...prev, node])
  }, [])
  
  return (
    <div className="workflow-designer">
      {/* Component JSX */}
    </div>
  )
}
```

### Backend (Python/FastAPI)

**File Organization:**
```
app/
├── api/
│   └── v1/
│       └── endpoints/
│           └── workflows.py
├── core/
│   ├── config.py
│   └── database.py
├── models/
│   └── workflow.py
├── schemas/
│   └── workflow.py
└── services/
    └── workflow_service.py
```

**Naming Conventions:**
- **Files/Modules**: snake_case (`workflow_service.py`)
- **Classes**: PascalCase (`WorkflowService`)
- **Functions/Variables**: snake_case (`create_workflow`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_NODES_PER_WORKFLOW`)

**Python Best Practices:**
```python
# Use type hints
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class WorkflowSchema(BaseModel):
    name: str
    description: Optional[str] = None
    nodes: List[Dict[str, Any]]
    
    class Config:
        orm_mode = True

# Use async/await for I/O operations
async def create_workflow(
    workflow_data: WorkflowCreate,
    db: AsyncSession
) -> Workflow:
    workflow = Workflow(**workflow_data.dict())
    db.add(workflow)
    await db.commit()
    await db.refresh(workflow)
    return workflow

# Use proper error handling
def validate_workflow(workflow: Dict[str, Any]) -> None:
    if not workflow.get("nodes"):
        raise ValueError("Workflow must contain at least one node")
    
    for node in workflow["nodes"]:
        if not node.get("id"):
            raise ValueError("Each node must have an id")

# Use docstrings
def execute_workflow(workflow_id: str) -> ExecutionResult:
    """
    Execute a workflow by ID.
    
    Args:
        workflow_id: Unique identifier for the workflow
        
    Returns:
        ExecutionResult containing outputs and metadata
        
    Raises:
        WorkflowNotFoundError: If workflow doesn't exist
        ExecutionError: If execution fails
    """
    pass
```

### Database

**Migration Naming:**
```bash
# Format: YYYYMMDD_HHMMSS_description.sql
20240115_143000_add_workflow_templates.sql
20240116_090000_update_agent_schema.sql
```

**SQL Style:**
```sql
-- Use uppercase for keywords
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Use descriptive index names
CREATE INDEX idx_workflows_created_at ON workflows(created_at);
CREATE INDEX idx_workflows_name_search ON workflows USING gin(to_tsvector('english', name));
```

## Testing Guidelines

### Frontend Testing

**Unit Tests (Vitest):**
```typescript
// src/__tests__/WorkflowDesigner.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkflowDesigner } from '../components/WorkflowDesigner'

describe('WorkflowDesigner', () => {
  it('renders workflow canvas', () => {
    render(<WorkflowDesigner workflowId="test-id" />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
  
  it('adds node when dragged from palette', async () => {
    render(<WorkflowDesigner workflowId="test-id" />)
    
    const inputNode = screen.getByText('Input Node')
    const canvas = screen.getByRole('main')
    
    fireEvent.dragStart(inputNode)
    fireEvent.drop(canvas)
    
    expect(screen.getByText('Input Node')).toBeInTheDocument()
  })
})
```

**Integration Tests:**
```typescript
// src/__tests__/integration/WorkflowFlow.test.tsx
describe('Workflow Creation Flow', () => {
  it('creates and saves a complete workflow', async () => {
    // Test complete user journey
  })
})
```

### Backend Testing

**Unit Tests (pytest):**
```python
# tests/test_workflow_service.py
import pytest
from app.services.workflow_service import WorkflowService
from app.schemas.workflow import WorkflowCreate

@pytest.fixture
async def workflow_service():
    # Setup test service
    pass

async def test_create_workflow(workflow_service):
    """Test workflow creation"""
    workflow_data = WorkflowCreate(
        name="Test Workflow",
        description="Test description"
    )
    
    workflow = await workflow_service.create_workflow(workflow_data)
    
    assert workflow.name == "Test Workflow"
    assert workflow.id is not None

async def test_create_workflow_validation():
    """Test workflow validation"""
    with pytest.raises(ValueError):
        WorkflowCreate(name="")  # Empty name should fail
```

**API Tests:**
```python
# tests/test_api.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_workflow():
    """Test workflow creation API"""
    response = client.post(
        "/api/v1/workflows",
        json={"name": "Test", "description": "Test workflow"}
    )
    
    assert response.status_code == 201
    assert response.json()["name"] == "Test"

def test_unauthorized_access():
    """Test authentication requirement"""
    response = client.get("/api/v1/workflows")
    assert response.status_code == 401
```

### Test Coverage

Maintain minimum test coverage:
- **Frontend**: 80% line coverage
- **Backend**: 90% line coverage
- **Critical paths**: 100% coverage

```bash
# Check frontend coverage
npm run test:coverage

# Check backend coverage
pytest --cov=app --cov-report=html
```

## Documentation

### Code Documentation

**TypeScript/JSX:**
```typescript
/**
 * Workflow designer component for creating and editing workflows.
 * 
 * @param workflowId - Unique identifier for the workflow
 * @param onSave - Callback function called when workflow is saved
 * @param readOnly - Whether the workflow should be read-only
 * 
 * @example
 * ```tsx
 * <WorkflowDesigner 
 *   workflowId="wf_123" 
 *   onSave={handleSave}
 *   readOnly={false}
 * />
 * ```
 */
export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  workflowId,
  onSave,
  readOnly = false
}) => {
  // Component implementation
}
```

**Python:**
```python
def execute_workflow(workflow_id: str, inputs: Dict[str, Any]) -> ExecutionResult:
    """
    Execute a workflow with the provided inputs.
    
    This function validates the workflow definition, creates an execution
    context, and runs each node in the correct order based on the workflow
    graph structure.
    
    Args:
        workflow_id: Unique identifier for the workflow to execute
        inputs: Dictionary of input values for the workflow
        
    Returns:
        ExecutionResult: Contains the outputs, metadata, and execution status
        
    Raises:
        WorkflowNotFoundError: If the workflow doesn't exist
        ValidationError: If inputs don't match the expected schema
        ExecutionError: If the workflow execution fails
        
    Example:
        >>> result = execute_workflow("wf_123", {"text": "Hello world"})
        >>> print(result.outputs["processed_text"])
        "HELLO WORLD"
    """
    pass
```

### API Documentation

Use OpenAPI/Swagger annotations:

```python
@router.post("/workflows/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: str = Path(..., description="Unique workflow identifier"),
    execution_request: WorkflowExecutionRequest = Body(
        ...,
        example={
            "inputs": {"text": "Hello world"},
            "parameters": {"timeout": 300}
        }
    )
) -> WorkflowExecutionResponse:
    """
    Execute a workflow with provided inputs.
    
    This endpoint starts the execution of a workflow with the specified
    inputs and parameters. The execution runs asynchronously and can be
    monitored through the execution ID returned in the response.
    
    - **workflow_id**: Must be a valid workflow ID
    - **inputs**: Must match the workflow's input schema
    - **parameters**: Optional execution parameters
    """
    pass
```

## Community

### Communication Channels

- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat and support
- **Weekly Office Hours**: Video calls with maintainers
- **Newsletter**: Monthly updates and highlights

### Getting Recognition

Contributors are recognized through:
- **Contributor Hall of Fame** on the website
- **GitHub badges** for different contribution levels
- **Conference speaking opportunities**
- **Early access** to new features
- **Swag and stickers** for active contributors

### Mentorship Program

- **Newcomer Support**: Paired with experienced contributors
- **Good First Issues**: Beginner-friendly tasks
- **Code Review Training**: Learn best practices
- **Feature Development**: Guide through larger contributions

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (1.1.0): New features, backwards compatible
- **PATCH** (1.1.1): Bug fixes, backwards compatible

### Release Timeline

- **Major releases**: Every 6 months
- **Minor releases**: Monthly
- **Patch releases**: As needed for critical fixes

### Feature Branches

- Features merge into `develop` branch
- `develop` is merged into `main` for releases
- `main` always represents the latest stable release

## Questions and Support

### Before Asking for Help

1. **Search existing issues** and discussions
2. **Check the documentation** thoroughly
3. **Try the latest version** to see if it's already fixed
4. **Create a minimal reproduction** of the issue

### How to Ask for Help

1. **Choose the right channel**:
   - Bug reports → GitHub Issues
   - Feature requests → GitHub Discussions
   - Questions → Discord or Discussions
   - Security issues → security@agentflow.dev

2. **Provide context**:
   - What you're trying to achieve
   - What you've already tried
   - Your environment details
   - Relevant code snippets or logs

3. **Be patient and respectful**:
   - Remember that maintainers are volunteers
   - Provide additional information when requested
   - Follow up appropriately

Thank you for contributing to AgentFlow! 🚀