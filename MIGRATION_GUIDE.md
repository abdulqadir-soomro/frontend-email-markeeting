# 🔄 Migration Guide: Firebase to MongoDB Backend

## ✅ What Changed

### Backend Architecture
- **Before**: Next.js API Routes + Firebase/Firestore
- **After**: Separate Express.js Backend + MongoDB

### Authentication
- **Before**: Firebase Authentication
- **After**: JWT (JSON Web Tokens) with bcrypt password hashing

### Database
- **Before**: Cloud Firestore (NoSQL)
- **After**: MongoDB with Mongoose (NoSQL)

### Email Services
- **Before**: AWS SES only
- **After**: AWS SES + Gmail SMTP (both options)

---

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB on your system
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `.env` file

### 3. Configure Environment Variables

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/email-marketing
# Or Atlas: mongodb+srv://username:password@cluster.mongodb.net/email-marketing

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d

# AWS SES (same as before)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-2

# URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env.local)**
```bash
# In root directory
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
# In root directory
npm run dev
```

### 5. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Register a new account
3. The backend should be running on [http://localhost:5000](http://localhost:5000)

---

## 📊 Database Schema Comparison

### Firebase Firestore Structure
```
users/{userId}
campaigns/{userId}/userCampaigns/{campaignId}
subscribers/{userId}/contacts/{contactId}
templates/{userId}/userTemplates/{templateId}
domains/{userId}/userDomains/{domainId}
emailRecords/{recordId}
gmailCredentials/{userId}
```

### MongoDB Collections
```
users - All users
campaigns - All campaigns (with userId reference)
subscribers - All subscribers (with userId reference)
templates - All templates (with userId reference)
domains - All domains (with userId reference)
emailRecords - All email records (with campaignId reference)
gmailCredentials - Gmail credentials (with userId reference)
```

**Advantages of MongoDB:**
- Better complex queries
- More powerful aggregations
- Easier joins/references
- Predictable costs
- No read/write limits

---

## 🔐 Authentication Flow

### Before (Firebase)
1. User signs up with Firebase Auth
2. Firebase generates UID
3. Client stores auth state
4. Firestore uses UID for queries

### After (JWT)
1. User signs up → Backend creates user in MongoDB
2. Backend generates JWT token
3. Client stores token in localStorage
4. Client sends token in Authorization header
5. Backend verifies token for protected routes

**Token Storage:**
```typescript
// Login successful
localStorage.setItem('token', response.data.token);

// Include in requests
headers: {
  'Authorization': `Bearer ${token}`
}

// Logout
localStorage.removeItem('token');
```

---

## 🔄 API Changes

### Frontend API Calls

**Before:**
```typescript
// Using Firebase
import { collection, addDoc } from 'firebase/firestore';
await addDoc(collection(db, "campaigns"), data);
```

**After:**
```typescript
// Using API Client
import { campaignAPI } from '@/lib/api-client';
await campaignAPI.create(data);
```

### Available API Endpoints

All endpoints are prefixed with `http://localhost:5000/api`

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/google` - Google OAuth
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

#### Campaigns
- `POST /campaigns` - Create campaign
- `GET /campaigns` - List campaigns
- `GET /campaigns/:id` - Get campaign
- `POST /campaigns/:id/send` - Send campaign
- `DELETE /campaigns/:id` - Delete campaign
- `GET /campaigns/:id/recipients` - Get recipients
- `GET /campaigns/:id/analytics` - Get analytics
- `POST /campaigns/quick-send` - Quick send

#### Subscribers
- `POST /subscribers` - Add subscriber
- `GET /subscribers` - List subscribers
- `GET /subscribers/:id` - Get subscriber
- `PUT /subscribers/:id` - Update subscriber
- `DELETE /subscribers/:id` - Delete subscriber
- `POST /subscribers/bulk-delete` - Bulk delete
- `POST /subscribers/upload` - CSV upload
- `GET /subscribers/stats` - Get stats

#### Templates
- `POST /templates` - Create template
- `GET /templates` - List templates
- `GET /templates/:id` - Get template
- `PUT /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template
- `POST /templates/seed` - Seed default templates

#### Domains
- `POST /domains` - Add domain
- `GET /domains` - List domains
- `GET /domains/:id` - Get domain
- `POST /domains/:id/verify` - Verify domain
- `DELETE /domains/:id` - Delete domain
- `POST /domains/:id/emails` - Add email
- `DELETE /domains/:id/emails` - Remove email

#### Gmail
- `POST /gmail/connect` - Connect Gmail
- `GET /gmail/status` - Get status
- `DELETE /gmail/disconnect` - Disconnect
- `GET /gmail/test` - Test connection

#### Tracking
- `GET /track/open/:campaignId?email=xxx` - Track opens
- `GET /track/click?campaignId=xxx&url=xxx&email=xxx` - Track clicks

---

## 🗑️ Removed Files

The following Firebase-related files have been removed:
- `lib/firebase.ts` - Firebase client config
- `lib/firebase-admin.ts` - Firebase Admin SDK
- `lib/aws-ses.ts` - Moved to backend
- `contexts/AuthContext.tsx` - Firebase auth context
- `firestore-email-platform.rules` - Firestore security rules
- `firestore-email-indexes.json` - Firestore indexes
- `app/api/*` - All old API routes

---

## ✨ New Features

### 1. Better Query Performance
MongoDB indexes are automatically created for:
- User lookups
- Campaign filtering
- Subscriber searches
- Email record tracking

### 2. Advanced Analytics
MongoDB aggregation pipelines enable:
- Complex reporting
- Real-time statistics
- User segmentation
- Performance metrics

### 3. No Rate Limits
- Firebase had 50K reads/day limit
- MongoDB Atlas free tier is unlimited reads
- Pay only for storage and bandwidth

### 4. Easier Scaling
- Backend can be scaled independently
- Can add Redis for caching
- Can implement job queues (Bull/BeeQueue)
- Can add WebSocket support

---

## 🐳 Docker Deployment

```bash
# Start all services (MongoDB + Backend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
# Local:
mongosh

# Atlas: Test connection string
```

### Authentication errors
```bash
# Clear localStorage
localStorage.clear()

# Check JWT_SECRET in .env
# Make sure it's the same value you used when generating tokens
```

### CORS errors
```bash
# Update backend/.env
CORS_ORIGINS=http://localhost:3000,http://localhost:5000

# Restart backend
cd backend
npm run dev
```

### MongoDB connection errors
```bash
# Local MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# Atlas MongoDB
# Check IP whitelist (allow 0.0.0.0/0 for testing)
# Verify connection string format
```

---

## 📚 Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [Express.js Guide](https://expressjs.com/)
- [JWT Introduction](https://jwt.io/introduction)

---

## ❓ FAQ

**Q: Can I still use Firebase?**
A: No, Firebase has been completely removed. The new architecture uses MongoDB.

**Q: Do I need to migrate existing data?**
A: If you have existing Firebase data, you'll need to export it and import to MongoDB. Contact support for migration scripts.

**Q: Will tracking pixels still work?**
A: Yes! Tracking works the same way. The backend handles open/click tracking.

**Q: Can I use Gmail sending?**
A: Yes! Gmail integration is still available and works the same way.

**Q: Is MongoDB Atlas free?**
A: Yes, MongoDB Atlas has a generous free tier (512MB storage, unlimited queries).

**Q: How do I deploy to production?**
A: Use Docker, Railway, Render, or any VPS. See backend/README.md for deployment guides.

---

## 🎉 Benefits of New Architecture

✅ **Better Performance** - MongoDB is optimized for complex queries  
✅ **Predictable Costs** - No surprise bills from Firebase  
✅ **More Control** - Full control over backend logic  
✅ **Easier Scaling** - Independent backend scaling  
✅ **Industry Standard** - REST API is universally compatible  
✅ **Better Developer Experience** - Cleaner code, easier debugging  
✅ **No Vendor Lock-in** - Can switch databases or services easily  

---

**Need help? Open an issue on GitHub or contact support!**

