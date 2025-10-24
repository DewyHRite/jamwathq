# GitHub Pages + Hostinger Deployment Guide
**Domain**: jamwathq.com
**Hosting**: GitHub Pages
**DNS Provider**: Hostinger
**Date**: October 24, 2025

---

## Overview

This guide explains how to deploy your JamWatHQ website to GitHub Pages with a custom domain (jamwathq.com) routed through Hostinger DNS.

### Architecture:
```
User → jamwathq.com (Hostinger DNS) → GitHub Pages → Your Website
```

---

## Part 1: GitHub Repository Setup

### 1. Create GitHub Repository

1. Go to GitHub: https://github.com/new
2. Repository name: `jamwathq` (or your preferred name)
3. Visibility: **Public** (required for free GitHub Pages)
4. Do NOT initialize with README (we'll push existing code)
5. Click "Create repository"

---

### 2. Prepare Local Repository

**CRITICAL: Remove .env from Git history FIRST!**

```bash
# Navigate to your project
cd "c:\Users\Dewy\OneDrive\Documents\JamWatHQ\Main\Live Code v.1\Code"

# Remove .env from Git history (if already committed)
# Download BFG from: https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Verify .env is not tracked
git status
# Should NOT show .env file
```

---

### 3. Push to GitHub

```bash
# Add GitHub remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/jamwathq.git

# Check current branch
git branch

# If not on main branch, rename it
git branch -M main

# Push to GitHub
git push -u origin main
```

---

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**

GitHub will now deploy your site to: `https://YOUR-USERNAME.github.io/jamwathq/`

---

## Part 2: Hostinger DNS Configuration

### 1. Log into Hostinger

1. Go to: https://www.hostinger.com
2. Log into your account
3. Go to **Domains** → Select **jamwathq.com**
4. Click **DNS / Name Servers**

---

### 2. Configure DNS Records

**Delete existing A records** (if any) and add these:

#### A Records (GitHub Pages IP addresses):
```
Type: A
Name: @ (or leave blank for root domain)
Points to: 185.199.108.153
TTL: 3600

Type: A
Name: @ (or leave blank)
Points to: 185.199.109.153
TTL: 3600

Type: A
Name: @ (or leave blank)
Points to: 185.199.110.153
TTL: 3600

Type: A
Name: @ (or leave blank)
Points to: 185.199.111.153
TTL: 3600
```

#### CNAME Record (www subdomain):
```
Type: CNAME
Name: www
Points to: YOUR-USERNAME.github.io
TTL: 3600
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

---

### 3. Verify DNS Configuration

DNS changes can take 24-48 hours to propagate, but usually take 1-4 hours.

Check DNS propagation:
- https://www.whatsmydns.net/#A/jamwathq.com
- https://dnschecker.org/

You should see the 4 GitHub IP addresses listed above.

---

## Part 3: Configure Custom Domain in GitHub

### 1. Add CNAME File

Your project already has a `CNAME` file with:
```
jamwathq.com
```

This tells GitHub Pages which custom domain to use.

### 2. Configure Custom Domain in GitHub Settings

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Custom domain**:
   - Enter: `jamwathq.com`
   - Click **Save**
4. Wait for DNS check to complete (may take a few minutes)
5. ✅ Enable **Enforce HTTPS** checkbox (once DNS check passes)

---

## Part 4: Update OAuth Redirect URIs

Since your domain is now `jamwathq.com`, update OAuth settings:

### Google OAuth Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://jamwathq.com/auth/google/callback
   https://www.jamwathq.com/auth/google/callback
   ```
4. Click **Save**

### Facebook Developer Console
1. Go to: https://developers.facebook.com/apps/
2. Select your app → **Facebook Login** → **Settings**
3. Add to **Valid OAuth Redirect URIs**:
   ```
   https://jamwathq.com/auth/facebook/callback
   https://www.jamwathq.com/auth/facebook/callback
   ```
4. Click **Save Changes**

---

## Part 5: Production Environment Setup

### Update Backend .env for Production

When you deploy your backend server (separate from GitHub Pages frontend), use these settings:

```bash
# backend/.env (for production backend server)
NODE_ENV=production
BASE_URL=https://jamwathq.com
CLIENT_URL=https://jamwathq.com,https://www.jamwathq.com
ALLOW_INSECURE_HTTP=false

# Update OAuth URLs
GOOGLE_CALLBACK_URL=https://jamwathq.com/auth/google/callback
FACEBOOK_CALLBACK_URL=https://jamwathq.com/auth/facebook/callback
```

---

## Important Notes

### Static Frontend vs. Backend Server

**GitHub Pages hosts ONLY static files**:
- ✅ HTML files
- ✅ CSS files
- ✅ JavaScript files
- ✅ Images, fonts, etc.
- ❌ Node.js backend server

**Your backend must be hosted separately!**

Options for backend hosting:
1. **Heroku** (Free tier available)
2. **Railway** (Free tier available)
3. **Render** (Free tier available)
4. **DigitalOcean App Platform** ($5/month)
5. **AWS EC2** (Free tier for 12 months)
6. **Hostinger VPS** (if you have VPS plan)

---

## Deployment Checklist

### Before First Deployment:
- [ ] Remove `.env` from Git history using BFG
- [ ] Verify `.env` is in `.gitignore`
- [ ] Rotate Google OAuth credentials (exposed in Git)
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Enable GitHub Pages

### DNS Configuration:
- [ ] Add 4 A records pointing to GitHub IPs
- [ ] Add CNAME record for www subdomain
- [ ] Wait for DNS propagation (1-48 hours)
- [ ] Verify DNS with whatsmydns.net

### GitHub Pages:
- [ ] Add CNAME file to repository root
- [ ] Configure custom domain in GitHub settings
- [ ] Enable HTTPS enforcement
- [ ] Test site at jamwathq.com

### OAuth Configuration:
- [ ] Update Google OAuth redirect URIs
- [ ] Update Facebook OAuth redirect URIs
- [ ] Test OAuth login flow

### Backend Deployment (Separate):
- [ ] Choose backend hosting provider
- [ ] Deploy backend server
- [ ] Update frontend API URLs to point to backend
- [ ] Test authentication and API calls

---

## Testing After Deployment

### 1. DNS Resolution
```bash
# Test if domain resolves to GitHub Pages
nslookup jamwathq.com
# Should show GitHub IP addresses

# Test www subdomain
nslookup www.jamwathq.com
# Should show GitHub CNAME
```

### 2. Website Access
- Visit: https://jamwathq.com
- Visit: https://www.jamwathq.com
- Both should work and redirect to HTTPS

### 3. Check HTTPS
- Look for padlock icon in browser address bar
- Certificate should be issued by GitHub

### 4. Test All Pages
- [ ] Home page (index.html)
- [ ] About page
- [ ] News page
- [ ] Guide page
- [ ] FAQ page
- [ ] Terms of Service
- [ ] Agencies page (shows "under development" popup)
- [ ] Share Experience page (shows "under development" popup)

### 5. Security Headers
Open DevTools → Network tab → Refresh page → Click any request → Headers

Verify these headers are present:
- `strict-transport-security: max-age=31536000`
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`

---

## Troubleshooting

### Issue: "404 - Page Not Found"
**Cause**: GitHub Pages not configured or DNS not propagated
**Solution**:
1. Verify Pages is enabled in Settings → Pages
2. Check DNS propagation: https://whatsmydns.net
3. Wait 24 hours for full propagation

---

### Issue: "Your connection is not private" / SSL Error
**Cause**: HTTPS not yet provisioned or DNS not fully propagated
**Solution**:
1. Wait 24 hours after DNS configuration
2. Ensure "Enforce HTTPS" is enabled in GitHub Pages settings
3. Clear browser cache and try again

---

### Issue: "Domain's DNS record could not be retrieved"
**Cause**: DNS records not configured correctly
**Solution**:
1. Verify all 4 A records point to GitHub IPs
2. Verify CNAME record points to YOUR-USERNAME.github.io
3. Wait for DNS propagation

---

### Issue: OAuth Redirects Not Working
**Cause**: Redirect URIs not updated in OAuth consoles
**Solution**:
1. Update Google Console with https://jamwathq.com/auth/google/callback
2. Update Facebook Console with https://jamwathq.com/auth/facebook/callback
3. Clear browser cookies and test again

---

### Issue: Backend API Calls Failing
**Cause**: Frontend making requests to localhost instead of production backend
**Solution**:
1. Deploy backend to hosting provider
2. Update frontend API URLs to production backend URL
3. Ensure CORS is configured to allow jamwathq.com

---

## File Structure for GitHub Pages

Your repository should have this structure:

```
jamwathq/
├── CNAME                          # Custom domain configuration
├── .gitignore                     # Prevents .env from being committed
├── README.md                      # Project documentation
├── frontend/                      # GitHub Pages will serve from here
│   ├── index.html                # Main page
│   ├── about.html
│   ├── news.html
│   ├── guide.html
│   ├── faq.html
│   ├── tos.html
│   ├── agencies.html
│   ├── share-experience.html
│   ├── scripts/
│   │   ├── main.js
│   │   ├── agencies.js
│   │   ├── auth-client.js
│   │   └── ...
│   └── styles/
│       ├── main.css
│       └── ...
├── backend/                       # NOT hosted on GitHub Pages
│   ├── server.js                 # Deploy separately
│   ├── .env.example              # Safe to commit
│   ├── .env                      # NEVER COMMIT THIS!
│   └── ...
└── documentation/
    ├── SECURITY_FIXES_IMPLEMENTED.md
    └── ...
```

**Important**: The `backend/` folder will NOT be accessible via GitHub Pages. You must deploy it separately.

---

## GitHub Pages Configuration for Root Frontend

If your frontend files are in the `frontend/` folder, you have two options:

### Option 1: Move Frontend Files to Root (Recommended for GitHub Pages)
```bash
# Move all files from frontend/ to root
mv frontend/* .
rm -rf frontend/

# Update paths in HTML files if needed
# Commit and push
git add .
git commit -m "Move frontend to root for GitHub Pages"
git push
```

### Option 2: Configure GitHub Pages to Serve from /frontend
1. GitHub Settings → Pages
2. Source: **main** branch
3. Folder: Select **/frontend** (if available)

**Note**: Not all GitHub accounts have the /docs or /frontend folder option.

---

## Backend Hosting Recommendation

For your Node.js backend, I recommend **Railway** or **Render** (both have free tiers):

### Railway (Recommended)
1. Sign up: https://railway.app/
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your jamwathq repository
4. Railway auto-detects Node.js
5. Add environment variables from `.env.production.example`
6. Deploy!
7. Railway gives you a URL like: `https://jamwathq-backend.railway.app`

### Render (Alternative)
1. Sign up: https://render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Build Command: `cd backend && npm install`
5. Start Command: `cd backend && node server.js`
6. Add environment variables
7. Deploy!

**Update Frontend API URLs**:
Once backend is deployed, update your frontend JavaScript files:
```javascript
// Before (development)
const API_BASE_URL = 'http://localhost:3000';

// After (production)
const API_BASE_URL = 'https://jamwathq-backend.railway.app';
```

---

## Monitoring & Maintenance

### 1. GitHub Actions (Optional)
Set up automated deployments on push:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend
```

### 2. DNS Monitoring
- Check DNS health: https://dnschecker.org/
- Monitor uptime: https://uptimerobot.com/ (free)

### 3. SSL Certificate
- GitHub automatically renews SSL certificates
- No action needed on your part

---

## Security Considerations

### What GitHub Pages Handles:
- ✅ HTTPS/SSL certificates
- ✅ DDoS protection
- ✅ CDN distribution
- ✅ Static file serving

### What You Must Handle:
- ⚠️ Backend security (separate hosting)
- ⚠️ Environment variables (never commit .env)
- ⚠️ OAuth credentials (rotate if exposed)
- ⚠️ API authentication
- ⚠️ Database security (if using)

---

## Cost Breakdown

### GitHub Pages: **FREE**
- Unlimited bandwidth
- Custom domain support
- SSL certificate included
- 1GB storage limit
- 100GB bandwidth/month limit

### Hostinger DNS: **Included with domain**
- DNS management free with domain registration

### Backend Hosting:
- **Railway Free Tier**: $0 (500 hours/month)
- **Render Free Tier**: $0 (750 hours/month)
- **Heroku**: $0 (discontinued free tier, paid only)

**Total Cost: $0-15/month** (domain + optional premium backend hosting)

---

## Support & Resources

### GitHub Pages Documentation:
- https://docs.github.com/en/pages

### Hostinger DNS Help:
- https://www.hostinger.com/tutorials/dns

### Custom Domain Setup:
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

### Troubleshooting:
- GitHub Community: https://github.community/
- Hostinger Support: https://www.hostinger.com/contact

---

## Quick Reference

### GitHub Pages URLs:
- **Before Custom Domain**: https://YOUR-USERNAME.github.io/jamwathq/
- **After Custom Domain**: https://jamwathq.com

### DNS Records Summary:
| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | YOUR-USERNAME.github.io |

### OAuth Redirect URIs:
- Google: `https://jamwathq.com/auth/google/callback`
- Facebook: `https://jamwathq.com/auth/facebook/callback`

---

**Deployment Guide Version**: 1.0
**Last Updated**: October 24, 2025
**Domain**: jamwathq.com
**Status**: Ready for Deployment
