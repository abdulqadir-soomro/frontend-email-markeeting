# Email Tracking Troubleshooting Guide

## 🎯 Overview

This guide helps you diagnose and fix email tracking issues in your email marketing platform. Tracking includes:
- **Open Tracking**: Detects when recipients open your emails
- **Click Tracking**: Tracks when recipients click links in your emails

## ⚠️ Common Issues & Solutions

### 1. **Emails Show "Not Opened" Even Though They Were Opened**

#### Possible Causes:
- Gmail/email clients block images by default
- NEXT_PUBLIC_APP_URL not configured correctly
- emailRecords not created when campaign was sent
- Campaign was sent before tracking fix was implemented

#### Solutions:

**A. Enable Images in Gmail (Recipient Side)**
Recipients must enable image loading:
1. Open the email in Gmail
2. Look for "Images are not displayed" message at the top
3. Click "Display images below"
4. Or add sender to contacts for automatic image loading

**B. Configure NEXT_PUBLIC_APP_URL (Developer)**
```env
# .env.local
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# NOT localhost for production!
# ❌ NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**C. Verify emailRecords Exist**
Check Firestore console:
- Collection: `emailRecords`
- Should have documents for each sent email
- Each document should have: `campaignId`, `recipientEmail`, `opened`, `openedAt`

**D. Send New Test Campaign**
Old campaigns sent before the tracking fix won't have tracking pixels. You must:
1. Create a new campaign
2. Send it to yourself
3. Open it and enable images
4. Wait 10 seconds
5. Refresh the Recipients dialog

---

### 2. **Tracking Pixel URL Shows 404**

#### Possible Causes:
- Next.js dynamic route not working
- Deployment issue
- API route not deployed

#### Solutions:

**A. Test Tracking Endpoint**
Visit: `https://yourdomain.com/api/track/open/test-campaign-123?email=test@example.com`

Expected: Returns a 1x1 transparent GIF image
Error: 404 or JSON error response

**B. Check Server Logs**
Look for:
```
📧 Tracking pixel hit - Campaign: xxx, Email: xxx
✅ Marking email as opened for xxx
```

If you don't see these logs, the tracking endpoint isn't being hit.

**C. Verify Deployment**
```bash
# Make sure API routes are deployed
npm run build
npm start

# Check if route exists
ls app/api/track/open/[campaignId]/
```

---

### 3. **Click Tracking Not Working**

#### Possible Causes:
- Links in email not wrapped with tracking URL
- Click tracking endpoint not updating emailRecords
- Direct copy-paste of URLs bypasses tracking

#### Solutions:

**A. Links Must Be Tracked**
Email HTML must use tracking links:
```html
<!-- ❌ Direct link (no tracking) -->
<a href="https://example.com">Click here</a>

<!-- ✅ Tracked link -->
<a href="https://yourdomain.com/api/track/click?campaignId=xxx&url=https://example.com&email=user@example.com">
  Click here
</a>
```

**B. Test Click Endpoint**
Visit: `https://yourdomain.com/api/track/click?campaignId=test&url=https://google.com&email=test@example.com`

Expected: Redirects to google.com
Error: 404 or error message

**C. Check emailRecords**
After clicking, verify in Firestore:
- `emailRecords` document should have `clicked: true`
- `clickedAt` timestamp should be set

---

### 4. **Environment Variable Issues**

#### Check Your Configuration:

```env
# .env.local - Required Variables

# Your production URL (CRITICAL for tracking)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Firebase Admin (for emailRecords)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# AWS SES (for sending emails)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-2
```

#### Verify Variables Are Loaded:
```javascript
// In browser console (for NEXT_PUBLIC_ vars)
console.log(process.env.NEXT_PUBLIC_APP_URL);

// Should show your domain, not undefined
```

---

### 5. **Firestore Indexes Missing**

#### Symptoms:
- API returns "requires an index" error
- Queries fail when fetching emailRecords
- Recipients dialog shows loading forever

#### Solution:

**Deploy Firestore Indexes:**
```bash
firebase deploy --only firestore:indexes
```

**Check `firestore-email-indexes.json`:**
```json
{
  "indexes": [
    {
      "collectionGroup": "emailRecords",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "campaignId", "order": "ASCENDING" },
        { "fieldPath": "recipientEmail", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

### 6. **Gmail Specific Issues**

#### Gmail Blocks Images by Default
Gmail's default security settings block external images to protect users from tracking.

**User Must:**
1. Click "Display images below" in each email
2. OR add sender to contacts
3. OR enable "Always display images from [sender]"

#### Gmail Caches Images
Gmail may cache tracking pixels, causing:
- Same open counted multiple times
- OR opens not counted if cached

**Solution:** 
The tracking endpoint already handles this by:
- Only incrementing counter once per unique email
- Checking if `opened: true` before updating

#### Gmail Proxy/Privacy Features
Gmail Privacy features may:
- Load images through proxy servers
- Cache images on Google servers
- Block some tracking methods

**Solution:**
- Use open tracking for general metrics only
- Don't rely on precise open counts
- Focus on click tracking for engagement metrics

---

## 🛠️ Debugging Tools

### 1. **Test Tracking Page**
Visit: `/dashboard/test-tracking`

This page runs diagnostic tests:
- ✅ Environment variables configured
- ✅ Tracking pixel endpoint accessible
- ✅ API endpoints working
- ✅ Firebase connection active

### 2. **Server Logs**
Check your deployment logs for:
```
📧 Tracking pixel hit - Campaign: xxx, Email: xxx
✅ Marking email as opened for xxx
⚠️ No emailRecord found for campaign: xxx, email: xxx
```

### 3. **Browser Network Tab**
1. Open email in Gmail
2. Open Chrome DevTools (F12)
3. Go to Network tab
4. Refresh email
5. Look for request to `/api/track/open/`
6. Status should be `200 OK`
7. Type should be `gif` or `image`

### 4. **Firestore Console**
Check manually in Firebase Console:
1. Go to Firestore Database
2. Collection: `emailRecords`
3. Find document by `campaignId` and `recipientEmail`
4. Verify fields: `opened`, `openedAt`, `clicked`, `clickedAt`

---

## ✅ Verification Checklist

Before reporting tracking issues, verify:

- [ ] Environment variables are set correctly
- [ ] `NEXT_PUBLIC_APP_URL` is production URL (not localhost)
- [ ] Firestore indexes are deployed
- [ ] Campaign was sent AFTER tracking fix
- [ ] Images are enabled in Gmail
- [ ] Server logs show tracking pixel hits
- [ ] emailRecords exist in Firestore
- [ ] Test Tracking page shows all green

---

## 📊 Expected Tracking Behavior

### Open Tracking:
- **When it works**: Recipient opens email AND enables images
- **When it doesn't**: Images blocked, cached, or email client doesn't load images
- **Typical open rate**: 15-25% (many people block images)

### Click Tracking:
- **When it works**: Recipient clicks a tracked link in the email
- **When it doesn't**: Direct URL copy-paste, link not tracked, endpoint down
- **Typical click rate**: 2-5% of delivered emails

### Important Notes:
- **Open tracking is not 100% accurate** due to image blocking
- **Click tracking is more reliable** for engagement metrics
- **Privacy features** in modern email clients reduce tracking accuracy
- **Focus on trends** rather than exact numbers

---

## 🚀 Best Practices

### 1. **Always Test First**
Before sending to large lists:
- Send test campaign to yourself
- Verify tracking works
- Check all links
- Confirm images load

### 2. **Monitor Logs**
Keep an eye on server logs for:
- Tracking pixel hits
- Error messages
- Failed email sends
- Firestore issues

### 3. **Use Analytics**
Focus on:
- Open rate trends over time
- Click-through rates
- Engagement patterns
- Conversion metrics

### 4. **Educate Recipients**
If tracking is important:
- Ask subscribers to enable images
- Add to their contacts
- Whitelist your domain

---

## 🆘 Still Not Working?

If tracking still doesn't work after trying all solutions:

1. **Run Test Tracking Page** (`/dashboard/test-tracking`)
2. **Check Server Logs** for errors
3. **Verify Firestore** has emailRecords
4. **Test with Fresh Campaign** (not old ones)
5. **Try Different Email Client** (not just Gmail)
6. **Check Firebase Console** for API errors
7. **Review Network Tab** in browser DevTools

---

## 📚 Additional Resources

- [Gmail Image Display Settings](https://support.google.com/mail/answer/145919)
- [Firebase Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Email Tracking Best Practices](https://www.emailvendorselection.com/email-tracking/)

