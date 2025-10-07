# 📧 Email Deliverability Guide - Avoid Spam Folder

## 🚨 Why Emails Go to Spam

### 1. **Missing or Incorrect DNS Records**
- SPF, DKIM, and DMARC records must be properly configured
- Without these, email providers mark you as suspicious

### 2. **Using "noreply" Email Addresses**
- Many spam filters flag "noreply@" addresses
- It signals you don't want replies (poor sender reputation)
- **Solution**: Use real addresses like `hello@`, `support@`, `team@`

### 3. **New Domain with No Reputation**
- Brand new domains have zero sender reputation
- Takes time to build trust with email providers

### 4. **Email Content Issues**
- Spammy words (FREE, ACT NOW, URGENT, etc.)
- All caps subject lines
- Too many links or images
- No plain text alternative

---

## ✅ How to Fix Spam Issues

### Step 1: Setup All DNS Records Properly

#### Required Records:

**1. SPF Record (TXT)**
```
Host: @
Value: v=spf1 include:amazonses.com ~all
```

**2. DKIM Records (CNAME)** 
Already handled when you add domain - 3 CNAME records

**3. DMARC Record (TXT)** - **IMPORTANT! Often Missing**
```
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=100; adkim=s; aspf=s
```

### Step 2: Use Better Email Addresses

❌ **Avoid:**
- noreply@yourdomain.com
- no-reply@yourdomain.com
- donotreply@yourdomain.com

✅ **Use Instead:**
- hello@yourdomain.com
- team@yourdomain.com
- marketing@yourdomain.com
- support@yourdomain.com
- newsletter@yourdomain.com

### Step 3: Warm Up Your Domain

**New domains MUST be warmed up gradually:**

| Day | Send Volume |
|-----|-------------|
| Day 1-3 | 20-50 emails/day |
| Day 4-7 | 50-100 emails/day |
| Week 2 | 100-500 emails/day |
| Week 3 | 500-1000 emails/day |
| Week 4+ | Full volume |

**Why?** Sudden large volume from new domain = spam signal

### Step 4: Improve Email Content

✅ **Best Practices:**
- Use clear, honest subject lines
- Include both HTML and plain text versions
- Add physical address in footer (legal requirement)
- Include easy unsubscribe link
- Avoid spam trigger words
- Keep image-to-text ratio balanced
- Test emails before sending

❌ **Avoid:**
- ALL CAPS SUBJECT LINES
- Excessive punctuation!!!!
- Too many links (>5 is risky)
- Only images, no text
- Misleading subject lines

### Step 5: Monitor Sender Reputation

**Check Your Domain Reputation:**
- [Google Postmaster Tools](https://postmaster.google.com/)
- [Microsoft SNDS](https://sendersupport.olc.protection.outlook.com/snds/)
- [Sender Score](https://www.senderscore.org/)

---

## 🛠️ Quick Action Checklist

### Immediate Actions:

- [ ] Add DMARC record to DNS
- [ ] Change from "noreply@" to "hello@" or "team@"
- [ ] Verify all 3 DNS record types (SPF, DKIM, DMARC)
- [ ] Wait 24-48 hours for DNS propagation
- [ ] Test email to Gmail, Yahoo, Outlook

### Domain Warmup Plan:

- [ ] Week 1: Send to your most engaged subscribers only
- [ ] Week 2: Gradually increase volume
- [ ] Week 3: Monitor spam complaints and bounces
- [ ] Week 4: Full sending capacity

### Email Content Improvements:

- [ ] Add unsubscribe link in footer
- [ ] Include physical mailing address
- [ ] Add plain text version
- [ ] Remove spam trigger words
- [ ] Test with [Mail Tester](https://www.mail-tester.com/)

---

## 📊 Testing Your Emails

### Use These Tools:

1. **[Mail Tester](https://www.mail-tester.com/)** - Get spam score (aim for 8+/10)
2. **[GlockApps](https://glockapps.com/)** - Inbox placement testing
3. **[Litmus](https://www.litmus.com/)** - Email rendering across clients
4. **[MXToolbox](https://mxtoolbox.com/)** - Check DNS records

### How to Test:
1. Send test email to the tool's address
2. Check spam score and recommendations
3. Fix issues identified
4. Re-test until score is 8+/10

---

## 🎯 AWS SES Specific Tips

### Move Out of Sandbox Mode:
- AWS SES starts in "sandbox mode" (limited sending)
- Request production access via AWS Console
- This improves deliverability significantly

### Setup Bounce & Complaint Handling:
- Configure SNS notifications for bounces
- Remove bounced emails from list
- Monitor complaint rate (keep below 0.1%)

### Enable Dedicated IP (Optional):
- For high volume (>100k/month)
- Costs $25/month
- Full control over IP reputation

---

## 🔥 Common Mistakes to Avoid

1. ❌ Buying email lists (instant spam)
2. ❌ Sending same content to everyone
3. ❌ No double opt-in
4. ❌ Ignoring unsubscribe requests
5. ❌ Poor email list hygiene
6. ❌ Sudden volume spikes
7. ❌ Using URL shorteners
8. ❌ Attaching files (send links instead)

---

## 📈 Long-term Strategy

### Build Sender Reputation:
1. **Engagement is key** - Send to people who open emails
2. **Remove inactive subscribers** after 6 months
3. **Re-engagement campaigns** before removing
4. **Consistent sending schedule**
5. **Low bounce rate** (< 2%)
6. **Low complaint rate** (< 0.1%)
7. **High open rates** (> 20%)

### Maintain Email List Health:
- Remove hard bounces immediately
- Remove soft bounces after 3 attempts
- Segment by engagement level
- Send less to inactive subscribers
- Use double opt-in for new subscribers

---

## 🆘 Emergency Troubleshooting

### If Suddenly Going to Spam:

1. **Check DNS records** - May have been modified
2. **Review recent campaigns** - Content issues?
3. **Check spam complaints** - Too many complaints?
4. **Verify domain** - Still verified in AWS SES?
5. **Check blacklists** - Use MXToolbox
6. **Reduce volume temporarily**
7. **Contact AWS Support** if using SES

---

## 📞 Need Help?

### Resources:
- AWS SES Documentation: https://docs.aws.amazon.com/ses/
- Email Deliverability Best Practices: https://sendgrid.com/blog/email-deliverability-guide/
- DMARC.org: https://dmarc.org/

### Quick Wins (Do These Now):
1. Add DMARC record
2. Change email address from noreply@ to hello@
3. Send test to mail-tester.com
4. Start with small volume (50-100/day)
5. Send only to engaged subscribers first

