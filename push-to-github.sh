#!/bin/bash

# 🚀 AgentFlow GitHub Push Script
# This script will help you push AgentFlow to GitHub successfully

echo "🚀 AgentFlow GitHub Push Assistant"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d ".git" ]; then
    echo "❌ Please run this script from the AgentFlow-Standalone directory"
    echo "   Navigate to: cd /Users/janarkuusk/AgentFlow-Standalone"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo "📊 Git status:"
git status --porcelain
echo ""

# Check GitHub authentication
echo "🔐 Checking GitHub CLI authentication..."
if gh auth status >/dev/null 2>&1; then
    echo "✅ GitHub CLI is authenticated"
    
    # Get GitHub username
    GH_USERNAME=$(gh api user --jq .login)
    echo "👤 GitHub username: $GH_USERNAME"
    
    # Ask for repository visibility
    echo ""
    echo "🔍 Repository visibility options:"
    echo "1) Public (recommended for open source)"
    echo "2) Private"
    read -p "Choose (1 or 2): " VISIBILITY_CHOICE
    
    if [ "$VISIBILITY_CHOICE" = "2" ]; then
        VISIBILITY_FLAG="--private"
        echo "🔒 Creating private repository"
    else
        VISIBILITY_FLAG="--public"
        echo "🌐 Creating public repository"
    fi
    
    # Create repository using GitHub CLI
    echo ""
    echo "📦 Creating GitHub repository..."
    if gh repo create AgentFlow $VISIBILITY_FLAG --description "🤖 Visual Multi-Agent Workflow Designer - Drag-and-drop interface for creating AI agent workflows" --clone=false; then
        echo "✅ Repository created successfully!"
        
        # Add remote and push
        echo "🔗 Adding GitHub remote..."
        git remote add origin "https://github.com/$GH_USERNAME/AgentFlow.git" 2>/dev/null || {
            echo "📝 Remote already exists, updating..."
            git remote set-url origin "https://github.com/$GH_USERNAME/AgentFlow.git"
        }
        
        echo "📤 Pushing main branch..."
        if git push -u origin main; then
            echo "✅ Main branch pushed successfully!"
            
            echo "📤 Pushing develop branch..."
            if git push -u origin develop; then
                echo "✅ Develop branch pushed successfully!"
                
                # Configure repository settings
                echo "⚙️ Configuring repository settings..."
                gh repo edit --description "🤖 Visual Multi-Agent Workflow Designer - Drag-and-drop interface for creating AI agent workflows"
                gh repo edit --add-topic ai,workflow,automation,react,fastapi,typescript,python,kubernetes,docker
                gh repo edit --enable-issues
                gh repo edit --enable-discussions
                
                echo ""
                echo "🎉 SUCCESS! AgentFlow has been pushed to GitHub!"
                echo "🌐 Repository URL: https://github.com/$GH_USERNAME/AgentFlow"
                echo ""
                echo "📋 Next steps:"
                echo "1. Visit your repository: https://github.com/$GH_USERNAME/AgentFlow"
                echo "2. Star the repository ⭐"
                echo "3. Create your first release (v0.1.0)"
                echo "4. Set up GitHub Actions secrets for CI/CD"
                echo "5. Configure branch protection rules"
                echo ""
                
            else
                echo "❌ Failed to push develop branch"
                exit 1
            fi
        else
            echo "❌ Failed to push main branch"
            exit 1
        fi
    else
        echo "❌ Failed to create repository"
        exit 1
    fi
    
else
    echo "❌ GitHub CLI not authenticated"
    echo ""
    echo "🔐 To authenticate with GitHub CLI:"
    echo "1. Run: gh auth login"
    echo "2. Choose 'GitHub.com'"
    echo "3. Choose 'HTTPS'"
    echo "4. Authenticate in browser or use token"
    echo "5. Run this script again"
    echo ""
    echo "🔄 Manual Alternative:"
    echo "1. Create repository at https://github.com/new"
    echo "2. Name: AgentFlow"
    echo "3. Description: 🤖 Visual Multi-Agent Workflow Designer"
    echo "4. Don't initialize with README/license"
    echo "5. Run these commands:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/AgentFlow.git"
    echo "   git push -u origin main"
    echo "   git push -u origin develop"
    exit 1
fi