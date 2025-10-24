# JamWatHQ Deployment Checklist
**Domain**: jamwathq.com
**Hosting**: GitHub Pages (Frontend) + Separate Backend
**DNS Provider**: Hostinger
**Date**: October 24, 2025

---

## Pre-Deployment Checklist

### 🔴 CRITICAL - Security (Must Complete First)

- [ ] **Remove .env from Git history**
  ```bash
  bfg --delete-files .env
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  ```

- [ ] **Verify .env is not tracked**
  ```bash
  git status
  # .env should NOT appear
  ```

- [ ] **Rotate Google OAuth credentials** (exposed in Git)
  - Go to: https://console.cloud.google.com/apis/credentials
  - Delete old Client ID: `62216890951-7cennm93lkval2mh6h7s80d9toqqm05g`
  - Create new OAuth 2.0 Client ID
  - Save new credentials

- [ ] **Update backend/.env with new credentials**
  ```
  GOOGLE_CLIENT_ID=your-new-client-id
  GOOGLE_CLIENT_SECRET=your-new-client-secret
  ```

- [ ] **Verify SESSION_SECRET is secure**
  ```bash
  grep SESSION_SECRET backend/.env | wc -c
  # Should be 140+ characters
  ```

---

## GitHub Repository Setup

### Repository Creation

- [ ] Create GitHub repository
  - Name: `jamwathq` (or your choice)
  - Visibility: **Public** (required for free GitHub Pages)
  - Do NOT initialize with README

- [ ] Add remote to local repository
  ```bash
  git remote add origin https://github.com/YOUR-USERNAME/jamwathq.git
  ```

- [ ] Verify .gitignore is working
  ```bash
  git status
  # Should NOT show .env, node_modules, or backups
  ```

- [ ] Push to GitHub
  ```bash
  git branch -M main
  git push -u origin main
  ```

---

### GitHub Pages Configuration

- [ ] Enable GitHub Pages
  - Settings → Pages
  - Source: **main** branch
  - Folder: **/ (root)**
  - Save

- [ ] Add CNAME file (already created)
  ```bash
  cat CNAME
  # Should show: jamwathq.com
  ```

- [ ] Wait for initial deployment
  - Check: https://YOUR-USERNAME.github.io/jamwathq/
  - Should show your site

---

## Hostinger DNS Configuration

### DNS Records Setup

- [ ] Login to Hostinger
  - Go to: https://www.hostinger.com
  - Domains → jamwathq.com → DNS / Name Servers

- [ ] Delete conflicting records
  - Delete old A records
  - Delete parking page CNAME (if present)
  - Keep MX, TXT, NS records

- [ ] Add GitHub Pages A Records
  - [ ] A record: @ → 185.199.108.153
  - [ ] A record: @ → 185.199.109.153
  - [ ] A record: @ → 185.199.110.153
  - [ ] A record: @ → 185.199.111.153
  - TTL: 3600 for all

- [ ] Add CNAME for www subdomain
  - [ ] CNAME: www → YOUR-USERNAME.github.io
  - TTL: 3600

- [ ] Save all DNS changes

---

### DNS Propagation Monitoring

- [ ] Check DNS propagation
  - Tool: https://www.whatsmydns.net/#A/jamwathq.com
  - Wait until GitHub IPs show globally (may take 1-24 hours)

- [ ] Test DNS resolution locally
  ```cmd
  nslookup jamwathq.com
  # Should return GitHub IP addresses
  ```

- [ ] Test www subdomain
  ```cmd
  nslookup www.jamwathq.com
  # Should return GitHub CNAME
  ```

---

## Custom Domain Configuration

### GitHub Pages Custom Domain

- [ ] Configure custom domain in GitHub
  - Settings → Pages → Custom domain
  - Enter: `jamwathq.com`
  - Click Save

- [ ] Wait for DNS check
  - GitHub will verify DNS records
  - May take a few minutes after DNS propagation

- [ ] Enable HTTPS
  - [ ] Check "Enforce HTTPS" checkbox
  - Wait for SSL certificate provisioning (up to 24 hours)

---

## OAuth Configuration Updates

### Google OAuth Console

- [ ] Update redirect URIs
  - Go to: https://console.cloud.google.com/apis/credentials
  - Select your OAuth Client ID
  - Add authorized redirect URIs:
    - [ ] `https://jamwathq.com/auth/google/callback`
    - [ ] `https://www.jamwathq.com/auth/google/callback`
  - Remove localhost URIs (optional for production)
  - Click Save

- [ ] Test Google OAuth
  - Visit: https://jamwathq.com
  - Click login with Google
  - Verify redirect works

---

### Facebook OAuth Console

- [ ] Update redirect URIs
  - Go to: https://developers.facebook.com/apps/
  - Select your app → Facebook Login → Settings
  - Add Valid OAuth Redirect URIs:
    - [ ] `https://jamwathq.com/auth/facebook/callback`
    - [ ] `https://www.jamwathq.com/auth/facebook/callback`
  - Click Save Changes

- [ ] Test Facebook OAuth
  - Visit: https://jamwathq.com
  - Click login with Facebook
  - Verify redirect works

---

## Backend Deployment (Separate from Frontend)

### Choose Backend Hosting Provider

Select one:
- [ ] Railway (Recommended) - https://railway.app/
- [ ] Render - https://render.com/
- [ ] Heroku - https://heroku.com/
- [ ] DigitalOcean - https://www.digitalocean.com/
- [ ] Hostinger VPS (if you have VPS plan)

---

### Backend Deployment Steps

- [ ] Create new project on hosting provider

- [ ] Connect GitHub repository

- [ ] Configure build settings
  - Build command: `cd backend && npm install`
  - Start command: `cd backend && node server.js`
  - Root directory: `/backend` (if applicable)

- [ ] Add environment variables from `.env.production.example`
  - [ ] NODE_ENV=production
  - [ ] BASE_URL=https://jamwathq.com
  - [ ] CLIENT_URL=https://jamwathq.com,https://www.jamwathq.com
  - [ ] ALLOW_INSECURE_HTTP=false
  - [ ] SESSION_SECRET=(your secure secret)
  - [ ] GOOGLE_CLIENT_ID=(your new client ID)
  - [ ] GOOGLE_CLIENT_SECRET=(your new secret)
  - [ ] FACEBOOK_APP_ID=(if using)
  - [ ] FACEBOOK_APP_SECRET=(if using)
  - [ ] MONGODB_URI=(production database)
  - [ ] EMAIL_USER=jamwathq@outlook.com
  - [ ] EMAIL_PASS=(app-specific password)

- [ ] Deploy backend

- [ ] Note backend URL
  - Example: `https://jamwathq-backend.railway.app`
  - Save this URL for frontend configuration

---

### Update Frontend API URLs

- [ ] Update API endpoints in frontend files

  **Files to update:**
  - [ ] `frontend/scripts/auth-client.js`
  - [ ] `frontend/scripts/share-experience-page.js`
  - [ ] `frontend/scripts/agencies.js`
  - [ ] Any other files with `API_BASE_URL` or `localhost:3000`

  **Change from:**
  ```javascript
  const API_BASE_URL = 'http://localhost:3000';
  ```

  **Change to:**
  ```javascript
  const API_BASE_URL = 'https://jamwathq-backend.railway.app';
  ```

- [ ] Commit and push frontend API URL changes
  ```bash
  git add .
  git commit -m "Update API URLs for production backend"
  git push
  ```

- [ ] Wait for GitHub Pages to redeploy (1-2 minutes)

---

## Testing & Verification

### Website Access Testing

- [ ] Test root domain
  - [ ] http://jamwathq.com → redirects to https
  - [ ] https://jamwathq.com → loads successfully

- [ ] Test www subdomain
  - [ ] http://www.jamwathq.com → redirects to https
  - [ ] https://www.jamwathq.com → loads successfully

- [ ] Test all pages
  - [ ] Home/Index page
  - [ ] About page
  - [ ] News page
  - [ ] Guide page
  - [ ] FAQ page
  - [ ] Terms of Service page
  - [ ] Agencies page (should show "under development" popup)
  - [ ] Share Experience page (should show "under development" popup)

---

### Security Verification

- [ ] Check HTTPS is enforced
  - [ ] Green padlock in browser address bar
  - [ ] Certificate issued by GitHub/Let's Encrypt
  - [ ] No mixed content warnings

- [ ] Verify security headers
  - Open DevTools → Network → Refresh → Click request → Headers
  - [ ] `strict-transport-security` present
  - [ ] `x-content-type-options: nosniff` present
  - [ ] `x-frame-options: DENY` present
  - [ ] `x-xss-protection` present

- [ ] Test session cookies (if backend deployed)
  - DevTools → Application → Cookies
  - [ ] `httpOnly` flag is true
  - [ ] `secure` flag is true
  - [ ] `sameSite` is "Strict"

---

### Functionality Testing

- [ ] Test "Under Development" popups
  - [ ] Agencies page → Click "Leave a Review" → Popup appears centered
  - [ ] Share Experience page → Fill form → Submit → Popup appears centered
  - [ ] Login button → Click → Popup appears centered

- [ ] Test OAuth login (if backend deployed)
  - [ ] Google login button → Redirects to Google → Returns to site
  - [ ] Facebook login button → Redirects to Facebook → Returns to site
  - [ ] No redirect errors
  - [ ] No 404 errors

- [ ] Test navigation
  - [ ] All nav links work
  - [ ] No broken links
  - [ ] No 404 pages

- [ ] Test responsive design
  - [ ] Desktop view (1920x1080)
  - [ ] Tablet view (768x1024)
  - [ ] Mobile view (375x667)

---

### Performance Testing

- [ ] Test page load speed
  - Tool: https://pagespeed.web.dev/
  - Target: 90+ score for Performance

- [ ] Test from different locations
  - Tool: https://www.webpagetest.org/
  - Test from multiple regions

- [ ] Check CDN resources load
  - [ ] Font Awesome loads
  - [ ] Google Fonts load
  - [ ] All images load

---

## Post-Deployment Configuration

### Analytics Setup (Optional)

- [ ] Add Google Analytics
  - Create GA4 property
  - Add tracking code to all HTML pages
  - Verify data collection

- [ ] Set up Google Search Console
  - Add property for jamwathq.com
  - Verify ownership
  - Submit sitemap

---

### Monitoring Setup (Optional)

- [ ] Set up uptime monitoring
  - Tool: https://uptimerobot.com/ (free)
  - Monitor: https://jamwathq.com
  - Alert email: jamwathq@outlook.com

- [ ] Set up error tracking (if backend deployed)
  - Tool: Sentry.io (free tier)
  - Install in backend
  - Configure alerts

---

### SEO Configuration (Optional)

- [ ] Create robots.txt
  ```
  User-agent: *
  Allow: /
  Sitemap: https://jamwathq.com/sitemap.xml
  ```

- [ ] Create sitemap.xml
  - List all public pages
  - Submit to Google Search Console

- [ ] Add meta tags to HTML pages
  - Title tags
  - Description meta tags
  - Open Graph tags (for social sharing)

---

## Documentation Updates

### Update README

- [ ] Create or update README.md with:
  - [ ] Project description
  - [ ] Live site URL: https://jamwathq.com
  - [ ] Technology stack
  - [ ] Setup instructions
  - [ ] Deployment information

---

### Security Documentation

- [ ] Review security documentation
  - [ ] README_SECURITY.md
  - [ ] SECURITY_FIXES_IMPLEMENTED.md
  - [ ] SECURITY_REVIEW_FINAL.md

- [ ] Update any localhost references to jamwathq.com

---

## Backup & Rollback Plan

### Create Production Backup

- [ ] Backup current production code
  ```bash
  mkdir backups/pre-production-20251024
  cp -r frontend backups/pre-production-20251024/
  cp -r backend backups/pre-production-20251024/
  ```

- [ ] Tag release in Git
  ```bash
  git tag -a v1.0-production -m "Production release - jamwathq.com"
  git push origin v1.0-production
  ```

---

### Rollback Procedure (If Needed)

**If issues occur after deployment:**

1. Revert GitHub Pages:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. Rollback DNS (if needed):
   - Change A records back to old IP
   - Wait for DNS propagation

3. Rollback backend:
   - Redeploy previous version in hosting provider
   - Revert environment variables

---

## Final Checklist

### Pre-Launch

- [ ] All security issues addressed
- [ ] OAuth credentials rotated
- [ ] .env removed from Git history
- [ ] DNS configured and propagated
- [ ] HTTPS enabled and working
- [ ] All pages tested
- [ ] OAuth redirects working
- [ ] Backend deployed (if applicable)
- [ ] API connections working
- [ ] Mobile responsive

---

### Launch Day

- [ ] Announce on social media (optional)
- [ ] Send test emails (if email configured)
- [ ] Monitor error logs
- [ ] Monitor uptime
- [ ] Check analytics (if configured)

---

### Post-Launch (First Week)

- [ ] Monitor uptime daily
- [ ] Check error logs daily
- [ ] Review analytics
- [ ] Collect user feedback
- [ ] Fix any reported issues
- [ ] Update documentation as needed

---

## Success Criteria

Your deployment is successful when:

✅ **Website Access**
- https://jamwathq.com loads without errors
- HTTPS is enforced (green padlock)
- All pages accessible

✅ **Security**
- No .env in Git history
- New OAuth credentials in use
- All security headers present
- Session cookies properly configured

✅ **Functionality**
- "Under Development" popups work
- Navigation works across all pages
- Login button visible on all pages
- Mobile responsive

✅ **Performance**
- Page load < 3 seconds
- No broken links
- No console errors
- CDN resources load

---

## Support & Resources

### Quick Reference Guides
- 📄 `DEPLOYMENT_GITHUB_PAGES.md` - Full deployment guide
- 📄 `HOSTINGER_DNS_SETUP.md` - DNS configuration
- 📄 `README_SECURITY.md` - Security overview
- 📄 `SECURITY_FIXES_IMPLEMENTED.md` - Technical security details

### External Resources
- GitHub Pages Docs: https://docs.github.com/en/pages
- Hostinger Support: https://support.hostinger.com
- DNS Checker: https://whatsmydns.net
- SSL Checker: https://www.sslshopper.com/ssl-checker.html

---

## Troubleshooting

### Common Issues

**"Your connection is not private" / SSL Error**
- Wait 24 hours after DNS configuration
- Ensure "Enforce HTTPS" enabled in GitHub Pages
- Check DNS propagation is complete

**OAuth Redirects Fail**
- Verify redirect URIs match exactly (including https://)
- Check for trailing slashes
- Ensure new credentials are in .env

**API Calls Fail / CORS Errors**
- Verify backend is deployed and running
- Check backend CORS allows jamwathq.com
- Verify API URLs updated in frontend
- Check backend environment variables

**"Domain's DNS record could not be retrieved"**
- Verify all 4 A records are present
- Check CNAME points to correct GitHub username
- Wait longer for DNS propagation

---

**Deployment Checklist Version**: 1.0
**Last Updated**: October 24, 2025
**Domain**: jamwathq.com
**Status**: Ready for Deployment

---

**Good luck with your deployment! 🚀**
