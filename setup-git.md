# Git Setup Guide

Follow these steps to initialize your Git repository and push to GitHub.

## 🚀 Step-by-Step Instructions

### 1. Initialize Git Repository

```bash
# Initialize Git in your project directory
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Financial Vault app with React, TypeScript, and Supabase"
```

### 2. Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the "+" icon → "New repository"
3. Repository name: `financial-vault`
4. Description: `A modern personal finance management app with wallet tracking, SMS parsing, and AI insights`
5. Make it **Public** or **Private** (your choice)
6. **Don't** initialize with README (we already have one)
7. Click "Create repository"

### 3. Connect and Push to GitHub

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/financial-vault.git

# Set the main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### 4. Update Repository URLs

After pushing, update these files with your actual GitHub username:

1. **package.json** - Update repository URLs
2. **README.md** - Update GitHub links
3. **DEPLOYMENT.md** - Update GitHub links

### 5. Set Up Branch Protection (Optional)

1. Go to your repository on GitHub
2. Settings → Branches
3. Add rule for `main` branch
4. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Include administrators

## 🔧 Additional Git Commands

### Daily Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push changes
git push
```

### Creating Feature Branches

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch to GitHub
git push -u origin feature/new-feature

# Create Pull Request on GitHub
```

### Updating from Remote

```bash
# Pull latest changes
git pull origin main

# Or if you have local changes
git stash
git pull origin main
git stash pop
```

## 📋 Pre-Push Checklist

Before pushing to GitHub, ensure:

- [ ] All files are properly ignored (check `.gitignore`)
- [ ] No sensitive data in code (API keys, passwords)
- [ ] Environment variables are in `.env` file (not committed)
- [ ] Code is working locally
- [ ] No build errors
- [ ] README.md is updated

## 🔐 Environment Variables

Create a `.env` file for local development:

```env
VITE_SUPABASE_URL=https://wpnahamvfvcphtdbhsdb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbmFoYW12ZnZjcGh0ZGJoc2RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTY2ODAsImV4cCI6MjA2NTk5MjY4MH0.Db-aL3dwokHbzX-lBTn314DiVrm5zMYaShREIYVQYuc
```

**Important**: The `.env` file is already in `.gitignore` and won't be committed.

## 🚀 Next Steps After Git Setup

1. **Deploy to Vercel/Netlify** (see `DEPLOYMENT.md`)
2. **Set up GitHub Actions** (CI/CD workflow is ready)
3. **Configure environment variables** in hosting platform
4. **Test the deployed application**

## 🆘 Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Use personal access token or SSH key
   git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/financial-vault.git
   ```

2. **Large File Error**
   ```bash
   # Check for large files
   git ls-files | xargs ls -la | sort -k5 -nr | head -10
   ```

3. **Merge Conflicts**
   ```bash
   # Resolve conflicts manually, then
   git add .
   git commit -m "Resolve merge conflicts"
   ```

---

**Your repository is ready for hosting! 🎉** 