# 🚀 Quick Setup Guide - EmailPro Platform

Follow these steps to get your email marketing platform up and running.

## Prerequisites

- Node.js 18+ installed
- Firebase account
- AWS account with SES access
- A domain you own (for email sending)

---

## Step 1: Install Dependencies

```bash
npm install
```

---

## Step 2: Firebase Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name: `emailpro-platform` (or your choice)
4. Disable Google Analytics (optional)
5. Click **Create Project**

### 2.2 Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Enable **Google** provider
   - Add your support email
   - Configure OAuth consent screen if needed

### 2.3 Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create Database**
3. Start in **Production Mode**
4. Choose a location (e.g., `us-central`)
5. Click **Enable**

### 2.4 Deploy Firestore Rules

1. Copy contents from `firestore-email-platform.rules`
2. Go to **Firestore Database** → **Rules** tab
3. Paste the rules
4. Click **Publish**

### 2.5 Create Firestore Indexes

Option A - Using Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# Select your project
# Use firestore-email-indexes.json
firebase deploy --only firestore:indexes
```

Option B - Manual:
- Indexes will be auto-created when you first use the app
- Firebase will show a link in console to create required indexes

### 2.6 Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** → Click **Web** icon (</>)
3. Register app with nickname: `EmailPro Web`
4. Copy the config object

### 2.7 Generate Service Account Key

1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. Save it securely (don't commit to git!)

---

## Step 3: AWS SES Setup

### 3.1 Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Add User**
3. User name: `emailpro-ses-user`
4. Access type: **Programmatic access**
5. Click **Next: Permissions**

### 3.2 Attach SES Policy

1. Click **Attach existing policies directly**
2. Search for `AmazonSESFullAccess`
3. Select the policy
4. Click **Next** → **Create User**
5. **Save** the Access Key ID and Secret Access Key

### 3.3 Request Production Access (Important!)

By default, SES is in **sandbox mode** (can only send to verified emails).

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Click **Account Dashboard**
3. Look for **Production Access** section
4. Click **Request Production Access**
5. Fill out the form:
   - Mail type: **Transactional**
   - Use case description: Brief explanation
   - Compliance: Acknowledge
6. Submit request (approval takes 24-48 hours)

### 3.4 Verify Test Email (For Sandbox)

While waiting for production access:
1. Go to **Verified Identities**
2. Click **Create Identity**
3. Choose **Email address**
4. Enter your test email
5. Check inbox and click verification link

---

## Step 4: Configure Environment Variables

Create `.env.local` file in project root:

```env
# Firebase Client (from Step 2.6)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Firebase Admin (from Step 2.7 JSON file)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...\n-----END PRIVATE KEY-----\n"

# AWS SES (from Step 3.2)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important Notes:**
- Replace all values with your actual credentials
- For `FIREBASE_PRIVATE_KEY`, keep the quotes and `\n` characters
- Don't commit `.env.local` to git (already in `.gitignore`)

---

## Step 5: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 6: First Time Usage

### 6.1 Create Account

1. Click **Get Started** or **Sign Up**
2. Register with email or Google
3. You'll be redirected to the dashboard

### 6.2 Add Your Domain

1. Go to **Domains** page
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Click **Add Domain**

### 6.3 Configure DNS Records

1. Click **View DNS** on your domain
2. Copy the SPF record and DKIM CNAME records
3. Add them to your domain's DNS settings (at your registrar/hosting provider)

**Example for Cloudflare/Namecheap:**

**SPF Record:**
- Type: `TXT`
- Name: `@` (or your domain)
- Value: `v=spf1 include:amazonses.com ~all`

**DKIM Records (you'll have 3):**
- Type: `CNAME`
- Name: `abc123._domainkey` (use the token provided)
- Value: `abc123.dkim.amazonses.com`

### 6.4 Verify Domain

1. Wait 10-30 minutes for DNS propagation
2. Click **Refresh** button on the domain
3. Status should change to **Verified** ✅

### 6.5 Add Subscribers

1. Go to **Subscribers** page
2. Download the CSV template
3. Fill in with format:
   ```csv
   email,name
   john@example.com,John Doe
   jane@example.com,Jane Smith
   ```
4. Upload the CSV file

### 6.6 Create Campaign

1. Go to **Campaigns** page
2. Click **Create Campaign**
3. Fill in:
   - Subject: "Welcome to our newsletter!"
   - From Name: "Your Company"
   - From Domain: Select your verified domain
   - HTML Content:
     ```html
     <h1>Hello!</h1>
     <p>Welcome to our newsletter.</p>
     <a href="https://yourwebsite.com">Visit our website</a>
     ```
4. Click **Preview HTML** to check
5. Click **Create Campaign**

### 6.7 Send Campaign

1. Find your draft campaign
2. Click **Send**
3. Confirm sending
4. Emails will be sent in batches

### 6.8 View Analytics

1. Go to **Reports** page
2. See open rates, click rates, and engagement
3. Track individual campaign performance

---

## 🔧 Troubleshooting

### Domain Not Verifying

**Check DNS with command line:**
```bash
# Check SPF
nslookup -type=txt yourdomain.com

# Check DKIM
nslookup -type=cname token._domainkey.yourdomain.com
```

**Solutions:**
- Wait longer (DNS can take up to 48 hours)
- Verify records are added correctly
- Check for typos in CNAME values
- Remove any trailing dots in DNS records

### Emails Not Sending

**Check:**
1. Domain is verified (green checkmark)
2. AWS SES is out of sandbox mode
3. Check AWS CloudWatch logs for errors
4. Verify IAM user has SES permissions
5. Check AWS SES sending limits

### Authentication Issues

**Solutions:**
- Clear browser cache and cookies
- Check Firebase Auth is enabled
- Verify all env variables are set
- Restart dev server after changing `.env.local`

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run dev
```

---

## 📚 Next Steps

- Customize the UI colors in `tailwind.config.ts`
- Add your branding/logo
- Create email templates
- Set up custom domain for app (Vercel/Firebase Hosting)
- Enable analytics and monitoring
- Add unsubscribe functionality
- Implement email validation

---

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Deploy to Firebase Hosting

```bash
npm run build
firebase init hosting
firebase deploy
```

---

## 📞 Support

If you encounter issues:
1. Check the error in browser console
2. Check terminal logs
3. Review Firebase/AWS console for errors
4. Verify all environment variables

---

**You're all set! Start sending emails! 📧**

