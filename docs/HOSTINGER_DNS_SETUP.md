# Hostinger DNS Configuration for jamwathq.com
**Provider**: Hostinger
**Domain**: jamwathq.com
**Target**: GitHub Pages
**Date**: October 24, 2025

---

## Step-by-Step DNS Configuration

### Step 1: Access Hostinger Control Panel

1. Go to: https://www.hostinger.com
2. Click **Login** (top right)
3. Enter your credentials
4. You'll land on the **Home/Dashboard**

---

### Step 2: Navigate to DNS Management

1. From the dashboard, click **Domains** in the left sidebar
2. Find **jamwathq.com** in your domain list
3. Click **Manage** next to jamwathq.com
4. Click **DNS / Name Servers** tab

You should now see the DNS Zone Editor.

---

### Step 3: Delete Existing Records (If Any)

**IMPORTANT**: Before adding new records, delete any conflicting records:

#### Delete These Record Types (if present):
- **A records** pointing to old IP addresses
- **CNAME records** for @ (root)
- Any **parking page** or **default Hostinger** records

**Keep These Records** (DO NOT delete):
- **MX records** (email)
- **TXT records** (SPF, DKIM, domain verification)
- **NS records** (nameservers) - Hostinger's nameservers

---

### Step 4: Add GitHub Pages A Records

Click **Add Record** button and add each of these **4 A records**:

#### A Record #1:
```
Type: A
Name: @ (or leave blank - means root domain)
Points to: 185.199.108.153
TTL: 3600 (or 1 Hour)
```
Click **Add Record**

#### A Record #2:
```
Type: A
Name: @ (or leave blank)
Points to: 185.199.109.153
TTL: 3600
```
Click **Add Record**

#### A Record #3:
```
Type: A
Name: @ (or leave blank)
Points to: 185.199.110.153
TTL: 3600
```
Click **Add Record**

#### A Record #4:
```
Type: A
Name: @ (or leave blank)
Points to: 185.199.111.153
TTL: 3600
```
Click **Add Record**

---

### Step 5: Add CNAME Record for www Subdomain

Click **Add Record** and add this CNAME:

```
Type: CNAME
Name: www
Points to: YOUR-GITHUB-USERNAME.github.io
TTL: 3600
```

**REPLACE `YOUR-GITHUB-USERNAME` with your actual GitHub username!**

Example:
- If your GitHub username is `johnsmith`, enter: `johnsmith.github.io`
- If your GitHub username is `jamwat-dev`, enter: `jamwat-dev.github.io`

Click **Add Record**

---

### Step 6: Verify Your Configuration

After adding all records, your DNS Zone should look like this:

| Type | Name | Value/Points To | TTL |
|------|------|-----------------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |
| CNAME | www | YOUR-USERNAME.github.io | 3600 |

---

### Step 7: Save Changes

1. Review all records for typos
2. Click **Save** or **Save Changes** button
3. You should see a success message: "DNS records updated successfully"

---

## DNS Propagation Time

**Important**: DNS changes don't happen instantly!

### Expected Propagation Time:
- **Minimum**: 15 minutes
- **Average**: 1-4 hours
- **Maximum**: 24-48 hours (rare)

### Check Propagation Status:

Use these tools to monitor DNS propagation:

1. **WhatsmyDNS** (Recommended):
   - https://www.whatsmydns.net/#A/jamwathq.com
   - Shows DNS resolution from servers worldwide
   - Wait until you see GitHub IPs (185.199.108-111.153) globally

2. **DNS Checker**:
   - https://dnschecker.org/#A/jamwathq.com
   - Similar to WhatsmyDNS

3. **Command Line** (Windows):
   ```cmd
   nslookup jamwathq.com
   ```
   Should return GitHub IP addresses

4. **Command Line** (Mac/Linux):
   ```bash
   dig jamwathq.com
   ```
   Should show GitHub A records

---

## Troubleshooting Common Issues

### Issue 1: "Record already exists" Error

**Cause**: Duplicate record with same name
**Solution**:
1. Look for existing @ or www records
2. Delete the old record first
3. Then add the new GitHub record

---

### Issue 2: Can't Delete Existing A Record

**Cause**: Protected/default record
**Solution**:
1. Look for an **Edit** button instead of Delete
2. Edit the existing record to point to GitHub IP
3. Or contact Hostinger support to unlock record

---

### Issue 3: "Invalid hostname" for CNAME

**Cause**: Trailing period or incorrect format
**Solution**:
- Correct: `username.github.io`
- Wrong: `username.github.io.` (no trailing period!)
- Wrong: `https://username.github.io` (no https://)
- Wrong: `www.username.github.io` (no www)

---

### Issue 4: DNS Still Shows Old IP After 24 Hours

**Cause**: Browser/ISP caching or nameserver issue
**Solution**:
1. Clear browser cache
2. Flush DNS cache:
   ```cmd
   ipconfig /flushdns
   ```
3. Try different browser or incognito mode
4. Try from mobile device with WiFi disabled (use cellular)
5. Check nameservers are Hostinger's (not custom)

---

### Issue 5: www Works But Root Domain Doesn't (or vice versa)

**Cause**: Missing or incorrect records
**Solution**:
- **If www works, root doesn't**: Check all 4 A records are present
- **If root works, www doesn't**: Check CNAME record points to correct GitHub username

---

## Advanced Configuration (Optional)

### Add Root Domain Redirect (www → non-www)

If you want both www and non-www to work, GitHub Pages handles this automatically once both are configured correctly.

### Add Email Records (If Using Email)

If you use email with jamwathq.com, keep these records:

```
Type: MX
Priority: 10
Points to: your-mail-server.com
```

**DO NOT delete MX records** or email will stop working!

---

## Nameserver Configuration

### Verify Nameservers are Correct

1. In Hostinger control panel, go to **Domains**
2. Click **jamwathq.com**
3. Check **Nameservers** section

**Should show Hostinger nameservers**:
```
ns1.dns-parking.com
ns2.dns-parking.com
```

Or similar Hostinger nameservers.

### If Using Custom Nameservers

If you're using Cloudflare or other DNS provider:
1. Add the same A and CNAME records there instead
2. Point Hostinger nameservers to your DNS provider

---

## Security Considerations

### SSL/HTTPS Certificate

**Good News**: GitHub Pages automatically provisions SSL certificates!

After DNS propagation:
1. Go to GitHub repo → Settings → Pages
2. Enable **Enforce HTTPS** checkbox
3. GitHub will automatically get a Let's Encrypt certificate
4. May take up to 24 hours after DNS propagation

### DNSSEC (Optional)

DNSSEC adds extra security to DNS:

1. In Hostinger, go to **Domain** settings
2. Look for **DNSSEC** option
3. Enable DNSSEC
4. Copy the DS records
5. If domain is registered elsewhere, add DS records to registrar

**Note**: Not required for basic setup.

---

## Verification Checklist

After completing DNS setup and waiting for propagation:

### DNS Resolution:
- [ ] `nslookup jamwathq.com` returns GitHub IPs
- [ ] `nslookup www.jamwathq.com` returns GitHub CNAME
- [ ] https://whatsmydns.net shows green checkmarks globally

### Website Access:
- [ ] http://jamwathq.com loads your site (redirects to https)
- [ ] https://jamwathq.com loads your site
- [ ] http://www.jamwathq.com loads your site
- [ ] https://www.jamwathq.com loads your site

### SSL Certificate:
- [ ] Green padlock appears in browser
- [ ] Certificate issued by GitHub/Let's Encrypt
- [ ] No SSL errors or warnings

### GitHub Pages:
- [ ] GitHub Pages shows "Your site is published at https://jamwathq.com"
- [ ] No DNS errors in GitHub Pages settings
- [ ] "Enforce HTTPS" checkbox is enabled

---

## DNS Record Details Explained

### A Record (Address Record)
- **Purpose**: Maps domain name to IP address
- **Why 4 records?**: GitHub uses multiple IPs for redundancy and load balancing
- **@ symbol**: Represents the root domain (jamwathq.com)

### CNAME Record (Canonical Name)
- **Purpose**: Creates an alias pointing to another domain
- **www subdomain**: Points to GitHub's servers
- **Cannot use CNAME for root**: That's why we use A records for root domain

### TTL (Time To Live)
- **3600 seconds** = 1 hour
- **Purpose**: How long DNS servers cache this record
- **Lower TTL**: Faster propagation, more DNS queries
- **Higher TTL**: Slower propagation, fewer DNS queries

---

## Support Contacts

### Hostinger Support:
- **Live Chat**: Available 24/7 in Hostinger dashboard
- **Help Center**: https://support.hostinger.com
- **Phone**: Check your region at https://www.hostinger.com/contact
- **Email**: Available through dashboard

### GitHub Pages Support:
- **Documentation**: https://docs.github.com/en/pages
- **Community Forum**: https://github.community/
- **GitHub Support**: https://support.github.com/ (for GitHub account issues)

---

## Quick Reference

### GitHub Pages IP Addresses:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### Record Format:
| Record | Name | Value |
|--------|------|-------|
| A (x4) | @ | GitHub IPs above |
| CNAME | www | YOUR-USERNAME.github.io |

### DNS Propagation Check:
- https://www.whatsmydns.net/#A/jamwathq.com

### Flush Local DNS Cache:
```cmd
ipconfig /flushdns
```

---

## Next Steps After DNS Setup

1. ✅ **Wait for DNS propagation** (1-24 hours)
2. ✅ **Verify DNS with whatsmydns.net**
3. ✅ **Enable HTTPS in GitHub Pages settings**
4. ✅ **Test website at https://jamwathq.com**
5. ✅ **Update OAuth redirect URIs** (see main deployment guide)

---

**DNS Configuration Guide Version**: 1.0
**Last Updated**: October 24, 2025
**Domain**: jamwathq.com
**Provider**: Hostinger
**Target**: GitHub Pages
**Status**: Ready to Configure
