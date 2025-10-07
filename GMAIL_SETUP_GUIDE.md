# 📧 Gmail Integration Guide

## 🎯 Send Emails Directly from Your Gmail Account!

Now you can send emails using your personal Gmail account instead of AWS SES!

---

## ✨ Benefits

✅ **Easy Setup** - No AWS configuration needed  
✅ **Personal Email** - Send from your Gmail address  
✅ **Better Deliverability** - Use your existing Gmail reputation  
✅ **Free** - No additional costs (just Gmail's limits)  
✅ **Direct Inbox** - Replies come to your Gmail  

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Gmail App Password

1. **Go to Google App Passwords**  
   Visit: https://myaccount.google.com/apppasswords

2. **Sign in** to your Google Account

3. **Create App Password**
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Name it: "EmailPro" or anything you like
   - Click "Generate"

4. **Copy the 16-character password**
   - It looks like: `xxxx xxxx xxxx xxxx`
   - Keep this safe - you'll need it in the next step

### Step 2: Connect Gmail in App

1. **Open Settings**  
   Go to: http://localhost:3000/dashboard/settings

2. **Click "Connect Gmail Account"**

3. **Enter Your Details**
   - Gmail Address: your.email@gmail.com
   - App Password: (paste the 16-character password)

4. **Click "Connect Gmail"**

5. **Done!** ✅ Your Gmail is now connected

---

## 📨 How to Send Campaign with Gmail

### Option 1: From Campaigns Page

1. Go to **Campaigns** page
2. Create a new campaign (or select existing)
3. Click **"Send"** button
4. **Choose "Gmail"** in the popup dialog
5. Click **"Send Campaign"**
6. Done! Emails are being sent from your Gmail 📧

### Option 2: Default Method

- Gmail is available anytime you see the send dialog
- Just select Gmail before sending

---

## 📊 Gmail vs AWS SES Comparison

| Feature | Gmail | AWS SES |
|---------|-------|---------|
| **Daily Limit** | 500 emails | 50,000+ emails |
| **Setup Difficulty** | Easy (5 min) | Complex (30+ min) |
| **Cost** | Free | $0.10 per 1,000 emails |
| **Sender Email** | your@gmail.com | verified@yourdomain.com |
| **Best For** | Small campaigns | Large campaigns |
| **Deliverability** | Good (personal) | Excellent (domain) |

---

## ⚙️ Technical Details

### Limits

- **500 emails per day** (Gmail's limit)
- **~1 email every 1.5 seconds** (to avoid rate limiting)
- For campaigns over 500, you'll see an error suggesting AWS SES

### Security

- App Password is stored securely in Firestore
- **Note**: In production, encrypt passwords before storing!
- App Passwords are specific to this app only
- You can revoke them anytime in your Google Account

### How It Works

1. You provide Gmail credentials (email + app password)
2. We store them securely in Firestore
3. When sending, we use **Nodemailer** with Gmail SMTP
4. Emails are sent one-by-one with delays to avoid rate limits
5. Each recipient gets a personalized email from your Gmail

---

## 🔧 Troubleshooting

### "Authentication Failed"

**Problem**: App password doesn't work  
**Solution**:
- Make sure you copied the full 16-character password
- Remove any spaces
- Try generating a new app password
- Make sure 2-Step Verification is enabled on your Google Account

### "Daily Limit Reached"

**Problem**: Gmail blocks after 500 emails  
**Solution**:
- Wait 24 hours for limit to reset
- Use AWS SES for campaigns over 500 recipients
- Split your campaign into multiple days

### "Emails Not Sending"

**Problem**: Emails stuck or failing  
**Solution**:
- Check your Gmail inbox for Google security alerts
- Verify app password is correct in Settings
- Disconnect and reconnect Gmail
- Check subscribers list has valid emails

---

## 🎨 Using Templates with Gmail

Templates work perfectly with Gmail!

1. Create/select a template
2. Use `{{name}}` for personalization
3. When sending via Gmail, names auto-replace
4. Example: "Hi {{name}}" becomes "Hi John"

---

## 💡 Pro Tips

### 1. **Test First**
Always send a test email to yourself before bulk sending

### 2. **Under 500 Recipients**
Gmail is perfect for:
- Newsletters (small list)
- Personal announcements
- Client updates
- Test campaigns

### 3. **Over 500 Recipients**
Use AWS SES for:
- Large marketing campaigns
- Bulk announcements
- High-volume sending

### 4. **Combination Strategy**
- Use Gmail for personal, small campaigns
- Use AWS SES for large, professional campaigns
- You can use both in the same account!

### 5. **Replies**
- Gmail replies go to your inbox automatically
- AWS SES replies go to the sending domain email
- Choose based on where you want replies

---

## 🔒 Security Best Practices

1. **Never share** your app password
2. **Use unique app passwords** for each application
3. **Revoke** app passwords when not needed
4. **Enable 2-Step Verification** on your Google Account
5. **Monitor** your Gmail sent folder for suspicious activity

---

## 📱 Mobile Access

Your Gmail integration works from anywhere:
- Desktop
- Mobile browser
- Tablet
- Any device with internet

---

## ❓ FAQ

**Q: Will this affect my personal Gmail?**  
A: No! It only uses Gmail's SMTP to send. Your inbox stays the same.

**Q: Can I disconnect anytime?**  
A: Yes! Go to Settings → Disconnect Gmail

**Q: Can I use multiple Gmail accounts?**  
A: Currently, one Gmail per user. You can switch by disconnecting and connecting another.

**Q: Is my password safe?**  
A: We store app passwords (not your main password). In production, these should be encrypted.

**Q: What if I hit the 500/day limit?**  
A: The system will show an error. Wait 24 hours or use AWS SES.

**Q: Do recipients see my Gmail?**  
A: Yes, emails come from your Gmail address. This can actually improve deliverability!

---

## 🚀 Next Steps

1. ✅ **Connect Gmail** in Settings
2. ✅ **Create a campaign** with a template
3. ✅ **Send a test** to yourself first
4. ✅ **Send your campaign** using Gmail!

---

## 📞 Need Help?

- Check main [README.md](./README.md)
- View [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
- Gmail credentials stored in Firestore: `/gmailCredentials/{userId}`

---

**Happy Emailing with Gmail! 📧✨**

