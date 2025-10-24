# GitHub Setup Guide - Using Release Version Folder
**For**: JamWatHQ Production Deployment
**Domain**: jamwathq.com
**Date**: October 24, 2025

---

## Overview

This guide shows you exactly how to set up a GitHub repository using the **Release Version** folder and deploy it to GitHub Pages with your custom domain (jamwathq.com).

### What You'll Accomplish:
1. Create a new GitHub repository
2. Initialize Git in the Release Version folder
3. Push your code to GitHub
4. Configure GitHub Pages
5. Set up custom domain (jamwathq.com)
6. Enable HTTPS

**Time Required**: 30-45 minutes
**Cost**: FREE

---

## Prerequisites

### Required:
- [x] GitHub account (create at https://github.com/join)
- [x] Git installed on your computer
  - Windows: https://git-scm.com/download/win
  - Mac: `brew install git`
  - Linux: `sudo apt-get install git`
- [x] Hostinger account with jamwathq.com domain
- [x] Release Version folder (already created)

### Check Git Installation:
```bash
git --version
# Should show: git version 2.x.x or higher
```

If Git is not installed, download and install it first.

---

## Part 1: GitHub Repository Setup (10 minutes)

### Step 1: Create GitHub Repository

1. **Log into GitHub**:
   - Go to: https://github.com
   - Click your profile picture (top right) → Sign in

2. **Create New Repository**:
   - Click the **+** icon (top right) → **New repository**
   - Or go directly to: https://github.com/new

3. **Configure Repository**:
   ```
   Repository name: jamwathq
   Description: JamWatHQ - Your J-1 Summer Work Travel Resource Hub
   Visibility: ○ Public ● (MUST be public for free GitHub Pages)

   Initialize repository:
   ☐ Add a README file (DON'T check)
   ☐ Add .gitignore (DON'T check - we already have one)
   ☐ Choose a license (DON'T check)
   ```

4. **Create Repository**:
   - Click **"Create repository"** button (green button at bottom)
   - You'll see a quick setup page with various options

5. **Save Repository URL**:
   - Copy the HTTPS URL shown on the page
   - It will look like: `https://github.com/DewyHRite/jamwathq.git`
   - **Replace YOUR-USERNAME with your actual GitHub username**

---

## Part 2: Prepare Release Version Folder (5 minutes)

### Step 1: Navigate to Release Version Folder

**Windows Command Prompt**:
```cmd
cd "C:\Users\Dewy\OneDrive\Documents\JamWatHQ\Main\Live Code v.1\Release Version"
```

**Windows PowerShell**:
```powershell
cd "C:\Users\Dewy\OneDrive\Documents\JamWatHQ\Main\Live Code v.1\Release Version"
```

**Mac/Linux Terminal**:
```bash
cd "/Users/YOUR-USERNAME/Documents/JamWatHQ/Main/Live Code v.1/Release Version"
```

### Step 2: Verify Folder Contents

```bash
dir  # Windows
ls   # Mac/Linux
```

You should see:
- `frontend/` folder
- `backend/` folder
- `docs/` folder
- `CNAME` file
- `.gitignore` file
- `README.md` file

If you don't see these, you're in the wrong folder!

---

## Part 3: Initialize Git Repository (5 minutes)

### Step 1: Initialize Git

```bash
git init
```

**Expected Output**:
```
Initialized empty Git repository in .../Release Version/.git/
```

---

### Step 2: Configure Git (First Time Only)

If this is your first time using Git, configure your identity:

```bash
git config --global user.name "Dwayne Wright"
git config --global user.email "dwaynewright1@outlook.com"
```

**Example**:
```bash
git config --global user.name "John Smith"
git config --global user.email "john@jamwathq.com"
```

---

### Step 3: Check Git Status

```bash
git status
```

**Expected Output**:
```
On branch master
No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore
        CNAME
        README.md
        backend/
        docs/
        frontend/
```

This shows all files that will be added to Git.

---

### Step 4: Add All Files to Git

```bash
git add .
```

The `.` means "add everything in current folder".

---

### Step 5: Verify Files Are Staged

```bash
git status
```

**Expected Output**:
```
On branch master
No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   .gitignore
        new file:   CNAME
        new file:   README.md
        new file:   backend/...
        ... (many files)
```

**IMPORTANT**: Check that `.env` is NOT in this list!
- If you see `.env`, it means your `.gitignore` isn't working
- Run: `git rm --cached backend/.env` to remove it

---

### Step 6: Create First Commit

```bash
git commit -m "Initial release v1.0.0 - Production ready"
```

**Expected Output**:
```
[master (root-commit) abc1234] Initial release v1.0.0 - Production ready
 XX files changed, XXXX insertions(+)
 create mode 100644 .gitignore
 create mode 100644 CNAME
 ... (list of files)
```

---

## Part 4: Push to GitHub (5 minutes)

### Step 1: Add GitHub Remote

Replace `YOUR-USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/DewyHRite/jamwathq.git
```

**Example**:
```bash
git remote add origin https://github.com/johnsmith/jamwathq.git
```

---

### Step 2: Verify Remote

```bash
git remote -v
```

**Expected Output**:
```
origin  https://github.com/YOUR-USERNAME/jamwathq.git (fetch)
origin  https://github.com/YOUR-USERNAME/jamwathq.git (push)
```

---

### Step 3: Rename Branch to 'main'

GitHub uses 'main' as the default branch name:

```bash
git branch -M main
```

---

### Step 4: Push to GitHub

```bash
git push -u origin main
```

**What Happens**:
- Git will ask for your GitHub credentials
- Enter your GitHub username
- Enter your GitHub password (or Personal Access Token)

**Expected Output**:
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Delta compression using up to 8 threads
Compressing objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), XX.XX MiB | XX.XX MiB/s, done.
Total XX (delta X), reused 0 (delta 0)
To https://github.com/YOUR-USERNAME/jamwathq.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

### Step 5: Verify on GitHub

1. Go to: `https://github.com/YOUR-USERNAME/jamwathq`
2. You should see all your files uploaded!
3. Verify:
   - `frontend/` folder exists
   - `CNAME` file shows "jamwathq.com"
   - `README.md` displays on the page

---

## Part 5: Configure GitHub Pages (10 minutes)

### Step 1: Access Repository Settings

1. On your GitHub repository page (`https://github.com/YOUR-USERNAME/jamwathq`)
2. Click **Settings** tab (top of page, far right)

---

### Step 2: Navigate to Pages Settings

1. In the left sidebar, scroll down to **Pages** (under "Code and automation")
2. Click **Pages**

---

### Step 3: Configure Source

Under **"Build and deployment"** section:

1. **Source**: Select **"Deploy from a branch"**
2. **Branch**:
   - Select **"main"** from dropdown
   - Select **"/ (root)"** from folder dropdown
3. Click **Save** button

---

### Step 4: Wait for Initial Deployment

- GitHub will start deploying your site
- This takes 1-2 minutes
- You'll see a message: "Your site is ready to be published at https://YOUR-USERNAME.github.io/jamwathq/"

**Refresh the page** after 2 minutes, and the message should change to:
"Your site is live at https://YOUR-USERNAME.github.io/jamwathq/"

---

### Step 5: Test GitHub Pages URL

1. Click the URL: `https://YOUR-USERNAME.github.io/jamwathq/`
2. Your website should load!
3. Test a few pages to make sure everything works

**If you see a 404 error**:
- Wait a few more minutes
- Check that you selected "main" branch and "/ (root)" folder
- Check that your files are in the repository root

---

## Part 6: Configure Custom Domain (10 minutes)

### Step 1: Add Custom Domain in GitHub

Still in the **Settings → Pages** section:

1. Under **"Custom domain"** section
2. Enter: `jamwathq.com` (without https://)
3. Click **Save**

---

### Step 2: Wait for DNS Check

GitHub will verify that your domain's DNS is configured correctly.

You'll see one of these messages:
- ✅ **"DNS check successful"** - Great! Proceed to next step
- ⏳ **"DNS check in progress"** - Wait a few minutes, refresh page
- ❌ **"DNS check failed"** - You need to configure Hostinger DNS first

---

### Step 3: Configure Hostinger DNS (If Not Done)

If DNS check fails, you need to configure Hostinger:

**Follow the guide**: `docs/HOSTINGER_DNS_SETUP.md`

**Quick Summary**:
1. Log into Hostinger → Domains → jamwathq.com → DNS
2. Add 4 A records pointing to GitHub IPs:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
3. Add CNAME: www → YOUR-USERNAME.github.io
4. Save changes
5. Wait 1-24 hours for DNS propagation

---

### Step 4: Check DNS Propagation

Use these tools to check if DNS is working:

1. **WhatsmyDNS**: https://www.whatsmydns.net/#A/jamwathq.com
   - You should see GitHub IPs (185.199.108-111.153) globally

2. **Command Line** (Windows):
   ```cmd
   nslookup jamwathq.com
   ```
   Should return GitHub IP addresses

3. **DNS Checker**: https://dnschecker.org/#A/jamwathq.com

**If DNS is not propagated yet**:
- Wait (can take 1-24 hours)
- Come back and continue after DNS propagates

---

### Step 5: Enable HTTPS

Once DNS check is successful:

1. In GitHub Pages settings, scroll down
2. Check the box: ☑ **"Enforce HTTPS"**
3. GitHub will automatically provision an SSL certificate
4. This can take up to 24 hours

**When HTTPS is enabled**:
- Your site will be accessible at https://jamwathq.com
- HTTP requests will automatically redirect to HTTPS
- You'll see a green padlock in the browser

---

## Part 7: Verification & Testing (5 minutes)

### Test All URLs:

- [ ] http://jamwathq.com → should redirect to https://jamwathq.com
- [ ] https://jamwathq.com → should load your website
- [ ] http://www.jamwathq.com → should redirect to https://www.jamwathq.com
- [ ] https://www.jamwathq.com → should load your website

### Test All Pages:

- [ ] Home/Index page loads
- [ ] About page loads
- [ ] News page loads
- [ ] Guide page loads
- [ ] FAQ page loads
- [ ] Terms of Service page loads
- [ ] Agencies page loads (shows "under development" popup)
- [ ] Share Experience page loads (shows "under development" popup)

### Test Mobile:

- [ ] Open site on mobile device
- [ ] Navigation works
- [ ] Pages are responsive
- [ ] Popups display correctly

---

## Common Issues & Solutions

### Issue 1: "Permission denied (publickey)"

**Cause**: SSH authentication not set up
**Solution**: Use HTTPS URL instead of SSH URL

```bash
# Wrong (SSH):
git remote add origin git@github.com:YOUR-USERNAME/jamwathq.git

# Correct (HTTPS):
git remote add origin https://github.com/YOUR-USERNAME/jamwathq.git
```

---

### Issue 2: "fatal: repository 'https://github.com/...' not found"

**Cause**: Typo in repository URL or repository doesn't exist
**Solution**:
1. Verify repository exists on GitHub
2. Check URL for typos
3. Make sure you replace YOUR-USERNAME with actual username

---

### Issue 3: "Authentication failed"

**Cause**: Wrong GitHub credentials or need Personal Access Token
**Solution**: Use a Personal Access Token instead of password

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: **repo** (check all boxes)
4. Click "Generate token"
5. Copy the token (save it somewhere safe!)
6. Use token as password when pushing

---

### Issue 4: "404 - There isn't a GitHub Pages site here"

**Cause**: GitHub Pages not properly configured or still deploying
**Solution**:
1. Wait 2-5 minutes for deployment
2. Verify Settings → Pages shows "Your site is live"
3. Check branch is "main" and folder is "/ (root)"
4. Check that files are in repository root (not in a subfolder)

---

### Issue 5: "DNS check unsuccessful"

**Cause**: Hostinger DNS not configured or not propagated yet
**Solution**:
1. Verify DNS records in Hostinger (see HOSTINGER_DNS_SETUP.md)
2. Wait for DNS propagation (1-24 hours)
3. Check https://whatsmydns.net/#A/jamwathq.com
4. Try again after DNS propagates

---

### Issue 6: ".env file appears in GitHub"

**Cause**: `.env` was committed before `.gitignore` was created
**Solution**:
```bash
# Remove from Git (but keep local copy)
git rm --cached backend/.env

# Commit the removal
git commit -m "Remove .env from Git"

# Push changes
git push
```

---

## Making Updates After Initial Deployment

Once your site is deployed, you can make updates:

### Step 1: Make Changes

Edit files in your Release Version folder locally.

### Step 2: Check What Changed

```bash
git status
```

### Step 3: Add Changes

```bash
git add .
```

### Step 4: Commit Changes

```bash
git commit -m "Brief description of changes"
```

**Example**:
```bash
git commit -m "Update homepage content"
```

### Step 5: Push to GitHub

```bash
git push
```

GitHub Pages will automatically redeploy (takes 1-2 minutes).

---

## Best Practices

### Commit Messages:
- ✅ Good: "Fix navigation menu on mobile"
- ✅ Good: "Update FAQ content"
- ❌ Bad: "Update"
- ❌ Bad: "asdf"

### Before Pushing:
- [ ] Test locally
- [ ] Check for typos
- [ ] Verify no .env file is included
- [ ] Review git status

### Regular Updates:
- Commit small, focused changes
- Push frequently (don't wait weeks)
- Write clear commit messages

---

## GitHub Repository Management

### View Commit History:

```bash
git log --oneline
```

### Create a Backup Tag:

```bash
git tag -a v1.0.0 -m "Production release version 1.0"
git push origin v1.0.0
```

### Revert to Previous Version:

```bash
# See commits
git log --oneline

# Revert to specific commit
git revert COMMIT-HASH
git push
```

---

## Security Reminders

### NEVER commit these files:
- ❌ `backend/.env`
- ❌ `node_modules/`
- ❌ Any file with passwords or API keys

### ALWAYS include:
- ✅ `.gitignore` file
- ✅ `backend/.env.example` (template only)
- ✅ Documentation files

### If You Accidentally Commit .env:
1. Follow instructions in README_SECURITY.md
2. Remove from Git history using BFG
3. Rotate all credentials immediately

---

## Success Checklist

After completing this guide, verify:

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Custom domain (jamwathq.com) configured
- [ ] DNS configured in Hostinger
- [ ] DNS propagated and verified
- [ ] HTTPS enabled and working
- [ ] Website accessible at https://jamwathq.com
- [ ] All pages load correctly
- [ ] No .env file in repository

---

## Next Steps

1. ✅ **Complete Deployment Checklist**: `docs/DEPLOYMENT_CHECKLIST.md`
2. ✅ **Set up Backend** (optional): Choose Railway, Render, or Heroku
3. ✅ **Update OAuth Redirect URIs**: Google and Facebook consoles
4. ✅ **Monitor Site**: Set up uptime monitoring (uptimerobot.com)
5. ✅ **Test Everything**: Run through all pages and features

---

## Support Resources

### Documentation:
- `README.md` - Overview of Release Version
- `docs/DEPLOYMENT_GITHUB_PAGES.md` - Detailed deployment guide
- `docs/HOSTINGER_DNS_SETUP.md` - DNS configuration
- `docs/DEPLOYMENT_CHECKLIST.md` - Complete checklist

### External Resources:
- GitHub Pages Docs: https://docs.github.com/en/pages
- Git Basics: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- GitHub Help: https://docs.github.com/en

### Need Help?
- GitHub Community: https://github.community/
- Hostinger Support: https://support.hostinger.com
- Check `docs/` folder for troubleshooting guides

---

**Congratulations! You're now ready to deploy JamWatHQ to production! 🚀**

Follow this guide step-by-step, and you'll have your website live at https://jamwathq.com in under an hour.
