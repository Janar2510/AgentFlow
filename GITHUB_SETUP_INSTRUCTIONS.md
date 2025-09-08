# 🚀 GitHub Setup Instructions

## Method 1: Manual GitHub Setup (Recommended)

### Step 1: Create Repository on GitHub.com
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `AgentFlow`
   - **Description**: `🤖 Visual Multi-Agent Workflow Designer - Drag-and-drop interface for creating AI agent workflows`
   - **Visibility**: Choose Public or Private
   - ⚠️ **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Step 2: Add GitHub Remote and Push
Once the repository is created, GitHub will show you commands. Use these:

```bash
# Navigate to project directory
cd /Users/janarkuusk/AgentFlow-Standalone

# Add GitHub remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/AgentFlow.git

# Push main branch
git push -u origin main

# Push develop branch
git push -u origin develop
```

### Step 3: Configure Repository Settings
After pushing, go to your repository on GitHub and:

1. **Set Default Branch**: Go to Settings → Branches → Set `main` as default
2. **Enable Issues**: Settings → Features → Check "Issues"
3. **Enable Discussions**: Settings → Features → Check "Discussions"
4. **Configure Pages** (optional): Settings → Pages → Source: GitHub Actions
5. **Add Topics**: About section → Add topics: `ai`, `workflow`, `automation`, `react`, `fastapi`, `typescript`

## Method 2: Using Setup Script

We have a setup script that can help automate some of the process:

```bash
cd /Users/janarkuusk/AgentFlow-Standalone
chmod +x setup-github.sh
./setup-github.sh
```

## Method 3: GitHub CLI (If you want to install it)

```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# Create and push repository
gh repo create AgentFlow --public --description "🤖 Visual Multi-Agent Workflow Designer"
git remote add origin https://github.com/$(gh api user --jq .login)/AgentFlow.git
git push -u origin main
git push -u origin develop
```

## Repository Configuration Checklist

After creating the repository, ensure these are configured:

- [ ] Repository description is set
- [ ] Topics are added (ai, workflow, automation, react, fastapi)
- [ ] README.md displays correctly
- [ ] Issues are enabled
- [ ] Discussions are enabled (optional)
- [ ] Branch protection rules (optional)
- [ ] Secrets for CI/CD (if using GitHub Actions)

## Environment Variables for GitHub Actions

If you plan to use the CI/CD pipeline, add these secrets in Settings → Secrets and variables → Actions:

```
DOCKER_USERNAME=your_docker_username
DOCKER_TOKEN=your_docker_token
```

## Next Steps After GitHub Setup

1. **Star the repository** to show it in your starred repos
2. **Create your first release**: Releases → Create a new release → Tag: v0.1.0
3. **Set up project board**: Projects → New project → Kanban template
4. **Configure notifications**: Watch → All Activity
5. **Share the repository** with your team members

## Troubleshooting

### If remote already exists:
```bash
git remote remove origin
git remote add origin https://github.com/USERNAME/AgentFlow.git
```

### If push is rejected:
```bash
git pull origin main --rebase
git push -u origin main
```

### If authentication fails:
```bash
# Use personal access token instead of password
# Go to GitHub → Settings → Developer settings → Personal access tokens
```

## Repository URL Format
Your repository will be available at:
`https://github.com/YOUR_USERNAME/AgentFlow`

---

**Need Help?** The setup script (`setup-github.sh`) contains additional automation that can help with the process.