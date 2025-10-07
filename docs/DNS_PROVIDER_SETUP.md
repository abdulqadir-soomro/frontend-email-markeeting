# DNS Provider API Setup Guide

This guide will help you obtain API keys from various DNS providers to use the automatic DNS setup feature.

## 🌐 Cloudflare

### Steps to Get API Key:
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on your profile icon (top right)
3. Go to **My Profile** → **API Tokens**
4. Click **Create Token**
5. Use the **Edit zone DNS** template
6. Select the specific zone (domain) you want to manage
7. Click **Continue to summary** → **Create Token**
8. Copy your API token immediately (it won't be shown again)

**Required Permissions:**
- Zone:DNS:Edit

---

## 🌐 Hostinger

### Steps to Get API Key:
1. Log in to your [Hostinger Panel](https://hpanel.hostinger.com)
2. Go to **Advanced** → **API**
3. Click **Create API Key**
4. Give it a name (e.g., "Email Platform DNS Setup")
5. Select **DNS Management** permissions
6. Click **Create**
7. Copy your API key

**Note:** Hostinger API is available for Business and Cloud hosting plans.

---

## 🔧 GoDaddy

### Steps to Get API Key & Secret:
1. Log in to [GoDaddy Developer Portal](https://developer.godaddy.com)
2. Click **API Keys** in the top menu
3. Click **Create New API Key**
4. Choose **Production** environment
5. Give it a name (e.g., "Email Platform")
6. Copy both the **API Key** and **API Secret**
7. Store them securely (the secret won't be shown again)

**Required Access:**
- Both Key and Secret are required
- Must have DNS management permissions

---

## 📦 Namecheap

### Steps to Get API Key:
1. Log in to your [Namecheap Account](https://www.namecheap.com)
2. Go to **Profile** → **Tools** → **API Access**
3. Enable API Access (if not already enabled)
4. Under **API Key**, you'll see your key
5. Whitelist your IP address or use 0.0.0.0 for any IP
6. Your Username is used as the API Secret

**Requirements:**
- API Key (from the API Access page)
- Username (your Namecheap username)
- Must meet account requirements ($50+ spent or 20+ domains)
- Whitelisted IP addresses

---

## 🌊 DigitalOcean

### Steps to Get API Token:
1. Log in to [DigitalOcean](https://cloud.digitalocean.com)
2. Go to **API** in the left sidebar
3. Click **Generate New Token** under Personal Access Tokens
4. Give it a name (e.g., "Email Platform DNS")
5. Select **Write** scope
6. Click **Generate Token**
7. Copy the token immediately (it won't be shown again)

**Required Permissions:**
- Write access to manage DNS records

---

## 🔒 Security Best Practices

### API Key Management:
- ✅ Store API keys securely
- ✅ Use keys with minimal required permissions
- ✅ Regenerate keys periodically
- ✅ Never share API keys publicly
- ✅ Revoke unused keys immediately

### Recommended Permissions:
Only grant DNS management permissions to the API keys. Don't use keys with:
- ❌ Billing access
- ❌ Account management
- ❌ Full administrative access

---

## 🚨 Troubleshooting

### "Invalid API Key" Error
- Verify you copied the entire key (no spaces)
- Check if the key has DNS management permissions
- Ensure the key hasn't expired
- For GoDaddy/Namecheap: verify both key and secret are correct

### "Domain Not Found" Error
- Verify the domain is managed by this DNS provider
- Check if the domain name is spelled correctly
- Ensure the API key has access to this specific domain

### "Permission Denied" Error
- The API key doesn't have DNS edit permissions
- For Cloudflare: check zone permissions
- For Hostinger: verify API is enabled for your plan

---

## 📞 Support

If you encounter issues with automatic DNS setup:
1. Try the manual setup option instead
2. Verify your API key has the correct permissions
3. Check the DNS provider's API documentation
4. Contact your DNS provider's support for API access issues

---

## 🔄 Updates

This guide is regularly updated. Last update: October 2025

Each DNS provider may update their API access process. Always refer to the official documentation:
- [Cloudflare API Docs](https://developers.cloudflare.com/api/)
- [GoDaddy API Docs](https://developer.godaddy.com/doc)
- [DigitalOcean API Docs](https://docs.digitalocean.com/reference/api/)

