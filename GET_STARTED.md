# 🚀 Get Started in 10 Minutes

This quick start guide will have you up and running in under 10 minutes (excluding DNS propagation time).

---

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] A Firebase account ([Sign up](https://console.firebase.google.com/))
- [ ] An AWS account ([Sign up](https://aws.amazon.com/))
- [ ] A code editor (VS Code recommended)
- [ ] A domain name you own

---

## Quick Setup (10 Steps)

### Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

This installs all required packages including:
- Next.js 14
- Firebase SDK
- AWS SDK
- UI components
- TypeScript types

---

### Step 2: Create Firebase Project (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it (e.g., "emailpro")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

---

### Step 3: Enable Firebase Services (2 minutes)

**Enable Authentication:**
1. Click **Authentication** → **Get started**
2. Enable **Email/Password**
3. Enable **Google** (add support email)

**Create Firestore:**
1. Click **Firestore Database** → **Create database**
2. Choose **Production mode**
3. Select location (e.g., us-central)
4. Click **Enable**

---

### Step 4: Get Firebase Config (1 minute)

1. Click ⚙️ **Project Settings**
2. Scroll to **"Your apps"**
3. Click **Web icon** (</>)
4. Register app: "EmailPro Web"
5. Copy the `firebaseConfig` object

---

### Step 5: Create Service Account (1 minute)

1. In Project Settings → **Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. Open it in a text editor

---

### Step 6: Setup AWS SES (2 minutes)

**Create IAM User:**
1. Go to [AWS IAM](https://console.aws.amazon.com/iam/)
2. **Users** → **Add users**
3. Name: "ses-emailpro"
4. **Access type**: Programmatic access
5. **Attach policy**: AmazonSESFullAccess
6. **Save the Access Key ID and Secret**

**Request Production Access:**
1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Click **"Request production access"**
3. Fill the form (takes 24-48 hours for approval)
4. Meanwhile, verify a test email for sandbox testing

---

### Step 7: Create .env.local File (2 minutes)

Create `.env.local` in the project root:

```env
# === FIREBASE CLIENT (from Step 4) ===
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123

# === FIREBASE ADMIN (from Step 5 JSON) ===
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"

# === AWS SES (from Step 6) ===
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCY...
AWS_REGION=us-east-1

# === APP URL ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:**
- Replace ALL values with your actual credentials
- Keep quotes around `FIREBASE_PRIVATE_KEY`
- Don't remove the `\n` characters

---

### Step 8: Deploy Firestore Rules (1 minute)

**Option A - Manual (Easy):**
1. Open `firestore-email-platform.rules`
2. Copy all contents
3. Go to Firebase Console → **Firestore** → **Rules** tab
4. Paste and click **Publish**

**Option B - CLI:**
```bash
firebase init firestore
firebase deploy --only firestore:rules
```

---

### Step 9: Start the App (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

You should see the landing page!

---

### Step 10: Test Everything (varies)

1. **Register**: Click "Get Started" → Create account
2. **Add Domain**: Dashboard → Domains → Add domain
3. **Configure DNS**: Add the SPF and DKIM records (see below)
4. **Upload Subscribers**: Upload a CSV with test emails
5. **Create Campaign**: Design your first email
6. **Send Test**: Send to your verified emails (if still in sandbox)

---

## DNS Configuration Guide

After adding a domain, you'll get DNS records to add at your domain registrar (Cloudflare, Namecheap, GoDaddy, etc.)

### SPF Record (TXT)

```
Type: TXT
Name: @ (or leave blank)
Value: v=spf1 include:amazonses.com ~all
TTL: 3600 (or Auto)
```

### DKIM Records (3 CNAME records)

You'll receive 3 tokens like: `abc123xyz456`, `def456uvw789`, `ghi789rst012`

For each token, add:

```
Type: CNAME
Name: [token]._domainkey
Value: [token].dkim.amazonses.com
TTL: 3600
```

**Example:**
```
Type: CNAME
Name: abc123xyz456._domainkey
Value: abc123xyz456.dkim.amazonses.com
```

### Verification Time

- **Fastest**: 10-15 minutes
- **Typical**: 30-60 minutes
- **Maximum**: 48 hours

**Check propagation:**
```bash
nslookup -type=txt yourdomain.com
nslookup -type=cname token._domainkey.yourdomain.com
```

---

## Common First-Time Issues

### ❌ "Module not found" errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Firebase Auth error"
**Solution:**
- Check all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### ❌ "AWS SES sending failed"
**Solution:**
- If in sandbox: Only send to verified emails
- Check domain is verified (green checkmark)
- Verify AWS credentials are correct

### ❌ "Domain not verifying"
**Solution:**
- Wait longer (can take up to 48 hours)
- Check DNS records are added correctly
- No trailing dots in CNAME values
- Use online DNS checker: [whatsmydns.net](https://www.whatsmydns.net/)

### ❌ TypeScript errors
**Solution:**
These are expected before `npm install`. Run:
```bash
npm install
```

---

## Testing in AWS Sandbox Mode

While waiting for production access approval, you can test:

1. **Verify Test Emails:**
   - AWS Console → SES → Verified identities
   - Add your email and verify it

2. **Test Sending:**
   - Create subscribers with verified emails only
   - Send campaigns to these emails
   - All tracking features work normally

3. **Request Production:**
   - Fill out the production access form
   - Usually approved within 24-48 hours
   - Once approved, remove verified email restriction

---

## Next Steps After Setup

### Customize Your Platform

1. **Branding:**
   - Edit `app/page.tsx` for landing page
   - Update company name in `components/dashboard/Sidebar.tsx`
   - Change colors in `tailwind.config.ts`

2. **Add Features:**
   - Email templates
   - Unsubscribe links
   - A/B testing
   - Scheduled sends

3. **Deploy to Production:**
   - Push to GitHub
   - Deploy on [Vercel](https://vercel.com) (recommended)
   - Or use Firebase Hosting
   - Add production environment variables

---

## Quick Command Reference

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Maintenance
npm install          # Install/update dependencies
rm -rf .next         # Clear Next.js cache

# Firebase (if using CLI)
firebase login
firebase init
firebase deploy
```

---

## Project Structure Quick Tour

```
📁 app/
  📁 api/              → Backend API routes
  📁 auth/             → Login/Register pages
  📁 dashboard/        → Main app pages
  📄 page.tsx          → Landing page
  📄 layout.tsx        → Root layout

📁 components/
  📁 ui/               → Reusable UI components
  📁 dashboard/        → Dashboard-specific components

📁 lib/
  📄 firebase.ts       → Firebase config
  📄 aws-ses.ts        → Email sending logic
  📄 utils.ts          → Helper functions

📁 contexts/
  📄 AuthContext.tsx   → Authentication state

📄 .env.local          → Your secrets (create this!)
📄 package.json        → Dependencies
```

---

## Support Resources

| Resource | Link |
|----------|------|
| Full Documentation | `README_MAILCHIMP_CLONE.md` |
| Setup Guide | `SETUP_INSTRUCTIONS.md` |
| Quick Reference | `QUICK_REFERENCE.md` |
| Architecture | `ARCHITECTURE_AND_FEATURES.md` |
| Project Summary | `PROJECT_SUMMARY.md` |

---

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] `npm install` completed successfully
- [ ] `.env.local` file exists with ALL variables filled
- [ ] Firebase Authentication is enabled
- [ ] Firestore database is created
- [ ] Firestore rules are deployed
- [ ] AWS IAM user has SES permissions
- [ ] Dev server restarted after `.env.local` changes
- [ ] Browser console shows no errors
- [ ] Terminal shows no errors

---

## Success Checklist ✅

You're ready when:

- [ ] App runs on localhost:3000
- [ ] You can register/login
- [ ] Domain is added (pending verification OK)
- [ ] Subscribers can be uploaded
- [ ] Campaign can be created
- [ ] Email can be sent (to verified emails if sandbox)

---

## 🎉 You're All Set!

**Congratulations!** Your email marketing platform is ready.

Now you can:
- ✅ Send professional email campaigns
- ✅ Track opens and clicks
- ✅ Manage subscriber lists
- ✅ View analytics
- ✅ Scale your email marketing

**Need more help?** Check the other documentation files or review the inline code comments.

**Ready to launch?** See deployment guide in `README_MAILCHIMP_CLONE.md`

---

**Happy Email Marketing! 📧🚀**

