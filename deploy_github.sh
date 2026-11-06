#!/bin/bash
# ==============================================================================
# Password Strengthening System - One-Click GitHub Deployment Script
# Author: A0nup
# ==============================================================================

set -e

REPO_NAME="password-strengthening-system"
DEFAULT_USER="A0nup"

echo "=========================================================="
echo "  Deploying Password Strengthening System to GitHub"
echo "=========================================================="

# 1. Check Git Installation
if ! command -v git &> /dev/null; then
    echo "[!] Error: 'git' is not installed. Please install git first."
    exit 1
fi

# 2. Initialize Git if not already a repository
if [ ! -d ".git" ]; then
    echo "[*] Initializing local Git repository..."
    git init
    git branch -M main
else
    echo "[*] Existing Git repository detected."
    git branch -M main
fi

# 3. Add all project files (honoring .gitignore)
echo "[*] Staging files..."
git add .

# 4. Commit changes
echo "[*] Creating commit..."
git commit -m "feat: complete Password Strengthening System frontend, backend, and deployment configuration" || echo "[i] No new changes to commit."

# 5. Check or Set GitHub Remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)

if [ -z "$REMOTE_URL" ]; then
    echo ""
    echo "No remote 'origin' detected."
    read -p "Enter your GitHub username [default: $DEFAULT_USER]: " GITHUB_USER
    GITHUB_USER=${GITHUB_USER:-$DEFAULT_USER}
    
    TARGET_REPO="https://github.com/$GITHUB_USER/$REPO_NAME.git"
    echo "[*] Adding remote origin: $TARGET_REPO"
    git remote add origin "$TARGET_REPO"
else
    echo "[*] Remote origin found: $REMOTE_URL"
fi

# 6. Push to GitHub
echo ""
echo "[*] Pushing to GitHub (main branch)..."
echo "    If prompted, enter your GitHub Personal Access Token or credentials."
git push -u origin main

echo ""
echo "=========================================================="
echo "  Successfully Pushed to GitHub!"
echo "=========================================================="
echo "Next step to enable GitHub Pages:"
echo " 1. Go to your repository on GitHub: https://github.com/A0nup/$REPO_NAME"
echo " 2. Click 'Settings' -> 'Pages' (in left sidebar)."
echo " 3. Under 'Build and deployment':"
echo "    - Source: 'Deploy from a branch'"
echo "    - Branch: select 'main' and folder '/ (root)', then click 'Save'"
echo " 4. Your site will be LIVE in ~1 minute at:"
echo "    https://a0nup.github.io/$REPO_NAME/"
echo "=========================================================="
