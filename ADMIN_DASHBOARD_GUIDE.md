# Admin Dashboard Guide

## Overview
The Admin Dashboard provides comprehensive system administration and monitoring capabilities for your email marketing platform.

## Access

### Admin Access
Only users with admin privileges can access the admin dashboard.

**Admin Emails Configuration:**
Admin emails are defined in two files for consistency:
- `pages/admin.js` (for admin dashboard access)
- `pages/index.js` (for showing/hiding the admin button)

```javascript
const ADMIN_EMAILS = [
  'admin@gmail.com',
  'abdulqadir53970@gmail.com',
  // Add more admin emails here
];
```

**To add more admin users:**
1. Open `pages/admin.js` and add email addresses to the `ADMIN_EMAILS` array
2. Open `pages/index.js` and add the same email addresses to the `ADMIN_EMAILS` array
3. Save both files
4. **Important:** Both arrays must contain the same admin emails for proper functionality

### Accessing the Dashboard
1. Log in with an admin account
2. The "Admin" button will automatically appear in the main dashboard header (only visible to admin users)
3. Click the "Admin" button to access the admin dashboard
4. Or navigate directly to `/admin`

**Note:** The Admin button is only visible to users whose email addresses are in the admin list. Regular users will not see this button.

## Features

The admin dashboard consists of 7 main tabs:

### 1. Overview Tab
**System Statistics:**
- Total Users
- Active Users (last 30 days)
- Total Campaigns
- Total Emails Sent/Failed
- Success Rate
- Today's Activity

**Quick Actions:**
- Refresh data
- Navigate to different sections
- System-wide monitoring

**Recent Activity Preview:**
- Last 5 campaign activities
- User actions
- Timestamps

### 2. Users Tab
**User Management:**
- View all registered users
- Search users by name or email
- User statistics (campaigns, emails sent)
- User creation and activity dates
- Delete user accounts

**User Information Displayed:**
- Name and avatar
- Email address
- Company
- Campaign count
- Total emails sent
- Registration date
- Last active date

### 3. Campaigns Tab
**Campaign Management:**
- View all campaigns across all users
- Search campaigns by subject or user
- Filter by status (all/successful/failed)
- Campaign statistics (sent, failed, duration)
- Delete campaigns

**Campaign Details:**
- Subject line
- Sender (user email)
- Timestamp
- Email counts
- Duration

### 4. Scheduled Tab
**Scheduled Email Management:**
- View all scheduled emails
- User who scheduled
- Schedule date and time
- Recipient count
- Status (scheduled, running, completed, failed)
- Delete scheduled emails

### 5. All Emails Tab
**Individual Email Records:**
- View every email sent through the system
- Recipient email addresses
- Recipient names
- From email addresses (sender email used)
- Which user sent the email
- Campaign subject
- Email status (sent/failed)
- Timestamp (date and time)
- Error messages for failed emails
- Search by recipient, user, from email, or campaign
- Filter by status (all/sent/failed)
- Quick stats summary (total sent, failed, success rate)

**Email Information Displayed:**
- **Recipient:** Email address of the person who received the email
- **Name:** Name of the recipient
- **From Email:** The sender email address that was used to send the email
- **Sent By User:** Which user in your system sent this email
- **Campaign:** Subject line of the campaign
- **Status:** Whether the email was successfully sent or failed
- **Timestamp:** When the email was sent
- **Error:** Error message if the email failed to send

### 6. User Activity Tab
**Individual User Activity Dashboard:**
- See activity by user (not by campaign)
- Expandable cards for each user
- Real-time activity metrics per user
- Search users by name, email, or company
- Last activity tracking
- Success rate per user

**User Information Displayed:**
- **User Profile:** Avatar, name, email, company
- **Activity Stats:** Campaigns sent, emails sent/failed, success rate, scheduled emails
- **Last Activity:** When user last sent a campaign
- **Recent Campaigns:** List of last 5 campaigns with details
- **Member Since:** Account creation date
- **Total Activity Summary:** Overall statistics

**Features:**
- Click any user card to expand and see detailed activity
- Shows last 5 campaigns for each user
- Calculates success rate per user
- Tracks days since last activity
- Searchable by user name, email, or company

### 7. Activity Tab (General)
**System-Wide Activity Feed:**
- Comprehensive activity log
- Recent campaign activities across all users
- User actions with details
- Timestamps
- Email counts

## Security Features

### Role-Based Access Control
- Only admin users can access the dashboard
- Non-admin users are automatically redirected
- Authentication required

### Data Protection
- Admin actions require confirmation
- Delete operations show warning dialogs
- All actions are logged

## Best Practices

### User Management
1. **Regular Monitoring:** Check user activity regularly
2. **Cleanup:** Remove inactive or test accounts
3. **Support:** Use user data to provide better support

### Campaign Monitoring
1. **Performance:** Track success rates
2. **Issues:** Identify and address failed campaigns
3. **Trends:** Analyze usage patterns

### Email Records Monitoring
1. **Individual Tracking:** See every email sent by all users
2. **Deliverability:** Monitor which emails are failing and why
3. **User Activity:** Track which users are sending emails
4. **Troubleshooting:** Use error messages to diagnose issues
5. **Compliance:** Maintain complete records of all sent emails

### System Health
1. **Daily Checks:** Review today's statistics
2. **Weekly Reviews:** Analyze weekly trends
3. **Monthly Reports:** Generate monthly summaries

## Production Deployment

### Security Recommendations
1. **Database Security:**
   - Store admin roles in Firestore
   - Implement proper security rules
   - Use Firebase Auth custom claims

2. **Environment Variables:**
   ```javascript
   // Use environment variables for admin emails
   const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];
   ```

3. **Firestore Security Rules:**
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Admin-only access to all collections
       match /{document=**} {
         allow read, write: if request.auth != null && 
           request.auth.token.admin == true;
       }
     }
   }
   ```

4. **Custom Claims (Recommended):**
   ```javascript
   // Set admin claim in Firebase Cloud Functions
   admin.auth().setCustomUserClaims(uid, { admin: true });
   
   // Check in frontend
   const idTokenResult = await user.getIdTokenResult();
   const isAdmin = idTokenResult.claims.admin;
   ```

## Troubleshooting

### Access Issues
**Problem:** Can't access admin dashboard
**Solution:** 
- Verify your email is in the ADMIN_EMAILS array
- Check if you're logged in
- Clear browser cache and re-login

### Data Not Loading
**Problem:** Statistics not updating
**Solution:**
- Click "Refresh Data" button
- Check Firestore connection
- Verify Firestore security rules

### Performance Issues
**Problem:** Dashboard loading slowly
**Solution:**
- Implement pagination for large datasets
- Add Firestore indexes
- Optimize queries

## Future Enhancements

### Planned Features
- [ ] Export data to CSV/Excel
- [ ] Advanced analytics and reports
- [ ] User role management
- [ ] Email templates management from admin
- [ ] System configuration panel
- [ ] Audit logs
- [ ] Real-time monitoring
- [ ] Email sending limits management
- [ ] Bulk user operations

### Custom Claims Integration
For production, implement Firebase Custom Claims:
```javascript
// In Firebase Cloud Functions
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // Check if requester is admin
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can set admin roles'
    );
  }
  
  // Set admin claim
  await admin.auth().setCustomUserClaims(data.uid, { admin: true });
  return { message: 'Admin role set successfully' };
});
```

## Support
For issues or questions:
- Check Firebase console for errors
- Review Firestore security rules
- Check browser console for JavaScript errors
- Verify all Firebase services are properly initialized

## API Reference

### Admin Page Component
**Location:** `pages/admin.js`
**Props:** None
**Features:**
- Authentication check
- Admin role verification
- Navigation controls

### Admin Dashboard Component
**Location:** `components/AdminDashboard.js`
**Props:**
- `userProfile` (object): Current user profile

**Methods:**
- `loadAdminData()`: Refresh all data
- `handleDeleteUser(userId)`: Delete a user
- `handleDeleteCampaign(campaignId)`: Delete a campaign
- `handleDeleteScheduledEmail(scheduleId)`: Delete scheduled email

## Database Schema

### Collections Used
1. **users** - User accounts
2. **campaigns** - Email campaigns
3. **scheduledEmails** - Scheduled campaigns
4. **emailRecords** - Individual email records

### Required Indexes
See `FIREBASE_INDEX_SETUP.md` for Firestore composite index requirements.

---

**Version:** 1.0.0  
**Last Updated:** October 2, 2025  
**Author:** Email Marketing Dashboard Team

