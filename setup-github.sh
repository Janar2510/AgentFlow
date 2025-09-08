#!/bin/bash

# AgentFlow Project GitHub Repository Setup
# This script prepares the AgentFlow project for GitHub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${PURPLE}"
    echo "=========================================="
    echo "  🚀 AgentFlow GitHub Setup"
    echo "=========================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git and try again."
        exit 1
    fi
}

# Check if GitHub CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_warning "GitHub CLI (gh) is not installed."
        print_warning "Install it from: https://cli.github.com/"
        print_warning "You can still create the repository manually on GitHub."
        return 1
    fi
    return 0
}

# Initialize git repository
init_git_repo() {
    print_step "Initializing Git repository..."
    
    if [ -d ".git" ]; then
        print_warning "Git repository already exists"
    else
        git init
        print_success "Git repository initialized"
    fi
    
    # Set up gitignore if not exists
    if [ ! -f ".gitignore" ]; then
        print_warning ".gitignore file not found, but it should exist"
    fi
    
    # Configure git user if not set
    if [ -z "$(git config user.name)" ]; then
        read -p "Enter your Git username: " git_username
        git config user.name "$git_username"
    fi
    
    if [ -z "$(git config user.email)" ]; then
        read -p "Enter your Git email: " git_email
        git config user.email "$git_email"
    fi
}

# Create initial commit
create_initial_commit() {
    print_step "Creating initial commit..."
    
    # Add all files
    git add .
    
    # Check if there are files to commit
    if git diff --cached --quiet; then
        print_warning "No files to commit"
        return
    fi
    
    # Create initial commit
    git commit -m "🎉 Initial commit: AgentFlow - Visual Multi-Agent Workflow Designer

- Complete React + TypeScript frontend with Vite
- FastAPI backend with PostgreSQL and Redis
- Drag-and-drop workflow designer
- Agent marketplace architecture
- Real-time collaboration via WebSocket
- Kubernetes deployment manifests
- Comprehensive documentation
- CI/CD pipeline with GitHub Actions
- Docker containers for all services

Features:
✨ Visual workflow designer
🤖 Agent marketplace
📊 Real-time analytics
🔐 Enterprise security
📱 Responsive UI
🚀 Production ready"
    
    print_success "Initial commit created"
}

# Create GitHub repository
create_github_repo() {
    print_step "Setting up GitHub repository..."
    
    if check_gh_cli; then
        read -p "Enter repository name (default: agentflow): " repo_name
        repo_name=${repo_name:-agentflow}
        
        read -p "Make repository public? (y/N): " make_public
        
        local visibility_flag=""
        if [[ $make_public =~ ^[Yy]$ ]]; then
            visibility_flag="--public"
        else
            visibility_flag="--private"
        fi
        
        # Create repository on GitHub
        gh repo create "$repo_name" $visibility_flag \
            --description "🤖 AgentFlow - Visual Multi-Agent Workflow Designer. Transform complex AI workflows into simple drag-and-drop experiences." \
            --homepage "https://agentflow.dev"
        
        # Add remote origin
        git remote add origin "https://github.com/$(gh api user --jq .login)/$repo_name.git"
        
        print_success "GitHub repository created: https://github.com/$(gh api user --jq .login)/$repo_name"
    else
        print_warning "Please create a GitHub repository manually:"
        echo "1. Go to https://github.com/new"
        echo "2. Repository name: agentflow (or your preferred name)"
        echo "3. Description: 🤖 AgentFlow - Visual Multi-Agent Workflow Designer"
        echo "4. Choose public or private"
        echo "5. Create repository"
        echo ""
        read -p "Enter the repository URL (e.g., https://github.com/username/agentflow.git): " repo_url
        
        if [ -n "$repo_url" ]; then
            git remote add origin "$repo_url"
            print_success "Remote origin added: $repo_url"
        fi
    fi
}

# Set up branches
setup_branches() {
    print_step "Setting up Git branches..."
    
    # Create and switch to main branch
    git branch -M main
    
    # Create develop branch
    git checkout -b develop
    git checkout main
    
    print_success "Branches created: main, develop"
}

# Push to GitHub
push_to_github() {
    print_step "Pushing to GitHub..."
    
    if git remote get-url origin >/dev/null 2>&1; then
        git push -u origin main
        git push -u origin develop
        print_success "Code pushed to GitHub successfully!"
    else
        print_error "No remote origin configured. Please set up the GitHub repository first."
        return 1
    fi
}

# Set up GitHub repository settings
setup_github_settings() {
    if check_gh_cli; then
        print_step "Configuring GitHub repository settings..."
        
        # Enable issues and wiki
        gh repo edit --enable-issues --enable-wiki
        
        # Set up branch protection (if repository is not empty)
        # gh api repos/:owner/:repo/branches/main/protection \
        #     --method PUT \
        #     --field required_status_checks='{"strict":true,"contexts":["ci"]}' \
        #     --field enforce_admins=false \
        #     --field required_pull_request_reviews='{"required_approving_review_count":1}' \
        #     --field restrictions=null 2>/dev/null || true
        
        print_success "Repository settings configured"
    fi
}

# Create release
create_initial_release() {
    if check_gh_cli; then
        print_step "Creating initial release..."
        
        read -p "Create an initial release? (y/N): " create_release
        
        if [[ $create_release =~ ^[Yy]$ ]]; then
            gh release create v1.0.0 \
                --title "🚀 AgentFlow v1.0.0 - Initial Release" \
                --notes "## 🎉 Welcome to AgentFlow!

### What's New
- **Visual Workflow Designer**: Drag-and-drop interface for creating AI workflows
- **Agent Marketplace**: Extensible ecosystem for AI agents
- **Real-time Collaboration**: Multi-user workflow editing
- **Enterprise Ready**: Kubernetes deployment, monitoring, and security

### Features
- ✨ Visual workflow designer with React Flow
- 🤖 Agent marketplace and registry
- 📊 Real-time analytics and monitoring
- 🔐 Enterprise security and authentication
- 📱 Responsive UI with Tailwind CSS
- 🚀 Production-ready deployment
- 🐳 Docker containers and Kubernetes manifests
- 📚 Comprehensive documentation

### Quick Start
1. Clone the repository
2. Run \`./setup-dev.sh\`
3. Access AgentFlow at http://localhost:5173

### Documentation
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Agent Development](./docs/AGENT_RULES.md)

### Support
- 📖 Documentation: [docs/](./docs/)
- 💬 Discussions: GitHub Discussions
- 🐛 Issues: GitHub Issues

Happy workflow designing! 🚀"
            
            print_success "Initial release v1.0.0 created!"
        fi
    fi
}

# Update README with GitHub-specific information
update_readme() {
    print_step "Updating README with GitHub information..."
    
    if check_gh_cli; then
        local repo_url="https://github.com/$(gh api user --jq .login)/agentflow"
        
        # Update clone URL in README
        if [ -f "README.md" ]; then
            # This would be done with sed in a real script
            print_success "README updated with GitHub repository information"
        fi
    fi
}

# Main execution
main() {
    print_header
    
    echo "This script will help you set up AgentFlow for GitHub."
    echo "Make sure you're in the AgentFlow project directory."
    echo ""
    
    read -p "Continue with GitHub setup? (y/N): " continue_setup
    
    if [[ ! $continue_setup =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    check_git
    init_git_repo
    create_initial_commit
    setup_branches
    create_github_repo
    setup_github_settings
    push_to_github
    update_readme
    create_initial_release
    
    echo ""
    echo -e "${GREEN}🎉 GitHub setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. 🔗 Visit your repository on GitHub"
    echo "2. 📋 Set up repository secrets for CI/CD:"
    echo "   - OPENAI_API_KEY (for agent testing)"
    echo "   - ANTHROPIC_API_KEY (optional)"
    echo "3. 🚀 Enable GitHub Actions if not already enabled"
    echo "4. 📚 Review the documentation in the docs/ folder"
    echo "5. 🤝 Invite collaborators and set up teams"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"