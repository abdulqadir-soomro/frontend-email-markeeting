# 📧 Email Templates Guide

## 🎯 Quick Start: How to Use Templates

### **Method 1: Add Pre-Built Templates (Easiest)**

1. **Navigate to Templates**
   - Go to: http://localhost:3000/dashboard/templates
   
2. **Add Sample Templates**
   - Click **"Add 5 Sample Templates"** button
   - You'll instantly get 5 professional templates:
     - Welcome Email (Transactional)
     - Product Launch (Announcement)
     - Monthly Newsletter (Newsletter)
     - Promotional Sale (Promotional)
     - Event Invitation (Marketing)

3. **Use in Campaigns**
   - Go to: http://localhost:3000/dashboard/campaigns
   - Click **"Create Campaign"**
   - Select a template from the dropdown
   - Subject and content auto-fill!
   - Add your sender info
   - Send!

---

### **Method 2: Create Custom Template**

1. **Go to Templates Page**
   - Visit: http://localhost:3000/dashboard/templates

2. **Create New Template**
   - Click **"New Template"**
   - Fill in:
     - **Name**: "Summer Sale Promo"
     - **Category**: Promotional
     - **Subject**: "🌞 Summer Sale - 40% Off!"
     - **HTML Content**: Your email design

3. **Use Personalization**
   ```html
   <h1>Hi {{name}},</h1>
   <p>Check out our summer sale!</p>
   ```
   - `{{name}}` will be replaced with each subscriber's name

4. **Preview & Save**
   - Click preview to see how it looks
   - Save your template

5. **Use in Campaigns**
   - Go to Campaigns → Create Campaign
   - Select your custom template
   - Done!

---

## 💡 Template Tips

### **Personalization Tags**
Use these in your templates:
- `{{name}}` - Subscriber's name
- Example: "Hello {{name}}!" becomes "Hello John!"

### **HTML Email Best Practices**
- Use inline CSS styles
- Keep width under 600px for email clients
- Test in multiple email clients
- Include alt text for images
- Add unsubscribe link

### **Template Categories**
- **Marketing**: Promotions, offers
- **Newsletter**: Regular updates
- **Announcement**: Product launches, news
- **Promotional**: Sales, discounts
- **Transactional**: Welcome, receipts

---

## 🔄 Complete Workflow

### **Step 1: Set Up Templates**
```
Dashboard → Templates → Add Sample Templates
```
OR
```
Dashboard → Templates → New Template → Create
```

### **Step 2: Create Campaign**
```
Dashboard → Campaigns → Create Campaign
```

### **Step 3: Select Template**
```
Template Dropdown → Choose your template
↓
Subject & Content auto-fill
```

### **Step 4: Customize**
```
Adjust subject line
Edit content if needed
Select sender domain
```

### **Step 5: Send**
```
Create Campaign → Send to subscribers
```

---

## 📊 Template Management

### **View All Templates**
- Templates page shows all your templates
- Organized by category
- Preview any template

### **Edit Template**
- Click "Edit" button on any template
- Make changes
- Update saves for future campaigns

### **Delete Template**
- Click "Delete" button
- Confirm deletion
- Campaigns using old version remain unchanged

---

## 🎨 Sample Template Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <!-- Header -->
    <div style="background: #667eea; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">Your Company</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px; background: #f9f9f9;">
      <h2>Hi {{name}},</h2>
      <p>Your email content here...</p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Click Here
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 Your Company. All rights reserved.</p>
      <p><a href="#" style="color: #999;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
```

---

## 🚀 Pro Tips

1. **Test First**: Send test emails to yourself before bulk sending
2. **Mobile Responsive**: Use inline styles, test on mobile
3. **Clear CTA**: One clear call-to-action per email
4. **Subject Lines**: Keep under 50 characters for mobile
5. **Preview Text**: First line shows in inbox preview
6. **Alt Text**: Always add alt text to images
7. **Unsubscribe**: Include unsubscribe link (required by law)

---

## 📱 Next Steps

1. ✅ **Add Templates**: Get sample templates or create your own
2. ✅ **Create Campaign**: Use template in new campaign
3. ✅ **Add Subscribers**: Upload your email list
4. ✅ **Send Campaign**: Send to your subscribers
5. ✅ **Track Results**: View opens and clicks in Reports

---

## ❓ FAQ

**Q: Can I edit a template after using it in a campaign?**  
A: Yes! Editing a template doesn't affect existing campaigns. Only new campaigns will use the updated version.

**Q: How many templates can I create?**  
A: Unlimited! Create as many as you need.

**Q: Can I duplicate a template?**  
A: Not yet, but you can copy the HTML content and create a new template.

**Q: Do templates work with all email clients?**  
A: The sample templates are tested with major email clients (Gmail, Outlook, Apple Mail).

**Q: Can I use images in templates?**  
A: Yes! Use hosted image URLs in `<img>` tags.

---

## 📞 Need Help?

- Check the main [README.md](./README.md) for general setup
- View [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for configuration
- Templates are stored in Firestore under `/templates/{userId}/userTemplates/`

---

**Happy emailing! 📧✨**

