# Git Sync Workflow

This document explains how to sync the frontend app between office and home using Git + GitHub.

## Repository

**GitHub URL**: https://github.com/mkka7944/billing-frontend

---

## At Office (Before Leaving)

```powershell
cd f:\qoder\billing-system\03_frontend_app
git add .
git commit -m "describe your changes"
git push
```

---

## At Home Laptop

### First Time Setup (Once Only)

```powershell
git clone https://github.com/mkka7944/billing-frontend.git
cd billing-frontend
npm install
```

### Daily Workflow

```powershell
cd billing-frontend
git pull
npm run dev
```

---

## Why This Works

- Git only syncs ~42 source files (< 1 MB)
- `node_modules` (10,000+ files) is excluded via `.gitignore`
- Run `npm install` at home to regenerate dependencies locally
- Google Drive can continue syncing other files in `billing-system`

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `git status` | Check what files have changed |
| `git diff` | See detailed changes |
| `git log -5` | View last 5 commits |
| `git pull` | Download latest changes |
| `git push` | Upload your changes |

---

*Created: 2026-01-17*
