# Email Marketing Dashboard - Setup Guide

## Quick Start

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables** (see below)
4. **Run the application**: `npm run dev`

## Environment Variables Setup

### 1. Copy Environment File
```bash
cp env.local.example .env.local
```

### 2. Firebase Configuration

#### Get Firebase Credentials:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `emailmarkeeting-423fc`
3. Go to Project Settings (gear icon) → General
4. Scroll down to "Your apps" section
5. Copy the config values

#### Update `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=emailmarkeeting-423fc.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=emailmarkeeting-423fc
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=emailmarkeeting-423fc.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### 3. AWS SES Configuration

#### Create AWS IAM User:
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Create a new user with programmatic access
3. Attach the `AmazonSESFullAccess` policy
4. Save the Access Key ID and Secret Access Key

#### Update `.env.local`:
```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

#### Verify Email Addresses in SES:
1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Navigate to "Verified identities"
3. Add and verify your sender email addresses
4. For production, request to move out of sandbox mode

### 4. Firebase Security Rules

Update your Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to create and read their own user documents
    match /users/{userId} {
      allow read, write: if true; // For now, allow all operations for testing
    }
    
    // Allow reading/writing email campaigns
    match /campaigns/{campaignId} {
      allow read, write: if true; // For now, allow all operations for testing
    }
    
    // Allow reading/writing email records (individual email tracking)
    match /emailRecords/{emailRecordId} {
      allow read, write: if true; // For now, allow all operations for testing
    }
    
    // Allow reading/writing email lists (if you plan to store them)
    match /emailLists/{listId} {
      allow read, write: if true; // For now, allow all operations for testing
    }
    
    // Block access to all other documents
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Firebase Index Setup (Optional)

For optimal performance, create a composite index:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database → Indexes
4. Click "Create Index"
5. Set:
   - **Collection ID**: `campaigns`
   - **Fields**: `userId` (Ascending), `createdAt` (Descending)

Or use the provided `firestore-indexes.json` file.

## Running the Application

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

## Features

### ✅ Implemented Features:
- **User Authentication** (Firebase Auth)
- **User Registration** (Firebase Firestore)
- **Email Campaign Management**
- **CSV Email List Upload**
- **Real-time Email Sending Progress**
- **Email History Tracking** (Database)
- **Email Content Editor** (HTML)
- **AWS SES Integration**
- **Multi-region Support**
- **Comprehensive Error Handling**

### 🔧 Configuration Options:
- **AWS Regions**: All major AWS regions supported
- **Email Templates**: Customizable HTML templates
- **Rate Limiting**: Configurable email delays
- **Error Handling**: Comprehensive error management
- **Database**: Firebase Firestore integration

## Troubleshooting

### Common Issues:

#### 1. Firebase Index Error
**Error**: "The query requires an index"
**Solution**: The app works without the index, but for optimal performance, create the composite index as described above.

#### 2. AWS SES Email Not Verified
**Error**: "Email address is not verified"
**Solution**: Verify your sender email addresses in AWS SES Console.

#### 3. CORS Issues
**Error**: CORS policy errors
**Solution**: Ensure your domain is in the allowed origins list.

#### 4. Firebase Permission Denied
**Error**: "Permission denied"
**Solution**: Update your Firestore security rules as shown above.

### Debug Mode:
Set `NEXT_PUBLIC_DEBUG=true` in your `.env.local` for detailed logging.

## Security Considerations

### Production Checklist:
- [ ] Update Firestore security rules for production
- [ ] Use environment-specific Firebase projects
- [ ] Implement proper user authentication checks
- [ ] Set up proper CORS policies
- [ ] Enable AWS SES production mode
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Use HTTPS in production

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Firebase and AWS documentation
3. Check the application logs for detailed error messages

## License

This project is for educational and commercial use.
