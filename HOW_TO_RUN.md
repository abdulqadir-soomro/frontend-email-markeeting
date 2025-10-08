# 🚀 How to Run Your Email Marketing Platform

## 📁 Your Clean Project Structure

```
amzonwork-next/
│
├── 📂 backend/          ← Express.js API (Port 5000)
├── 📂 frontend/         ← Next.js App (Port 3000)
├── 📂 docs/             ← Guides & Documentation
│
├── 📄 start-backend.bat  ← Double-click to start backend
├── 📄 start-frontend.bat ← Double-click to start frontend
│
└── 📄 README.md         ← Main documentation
```

---

## ⚡ Quick Start (3 Steps)

### Step 1: Setup MongoDB (5 minutes)

**Choose ONE option:**

#### Option A: MongoDB Atlas (Recommended - Free Cloud)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create cluster (M0 Free tier)
4. Database Access:
   - Add user: `admin` / `admin123`
5. Network Access:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
6. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the string (looks like):
     ```
     mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

7. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/email-marketing?retryWrites=true&w=majority
   ```

#### Option B: Local MongoDB
1. Download: https://www.mongodb.com/try/download/community
2. Install and start service
3. Use default: `MONGODB_URI=mongodb://localhost:27017/email-marketing`

---

### Step 2: Start Backend

**Windows (Easy):**
- Double-click `start-backend.bat`

**Manual:**
```bash
cd backend
npm install
npm run dev
```

✅ Wait for: `✅ MongoDB connected successfully`  
✅ Backend running on: **http://localhost:5000**

---

### Step 3: Start Frontend (New Window)

**Windows (Easy):**
- Double-click `start-frontend.bat`

**Manual:**
```bash
cd frontend
npm install
npm run dev
```

✅ Wait for: `ready - started server on 0.0.0.0:3000`  
✅ Frontend running on: **http://localhost:3000**

---

## 🎉 You're Ready!

1. Open: **http://localhost:3000**
2. Click "Register"
3. Create your account
4. Start using the platform!

---

## 🔧 Configuration Files

### Backend Config (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/email-marketing
JWT_SECRET=your-secret-key-change-this
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-2
```

### Frontend Config (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ Verify Everything Works

### Backend Health Check
Open: http://localhost:5000/api/health

Should show:
```json
{
  "success": true,
  "message": "Email Marketing API is running"
}
```

### Frontend Check
Open: http://localhost:3000

Should show the landing page with Login/Register buttons.

---

## 🐳 Alternative: Docker (Everything Together)

If you have Docker installed:

```bash
docker-compose up -d
```

This starts:
- ✅ MongoDB
- ✅ Backend
- ✅ Frontend (optional)

---

## ❓ Troubleshooting

### Backend won't start?
**Issue:** "Cannot connect to MongoDB"
**Fix:** 
- Check `MONGODB_URI` in `backend/.env`
- MongoDB Atlas: Verify IP whitelist (use 0.0.0.0/0)
- Local MongoDB: Make sure service is running

### Frontend won't start?
**Issue:** "Cannot connect to API"
**Fix:**
- Check backend is running first
- Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Make sure it points to: `http://localhost:5000/api`

### Port already in use?
**Backend (5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

**Frontend (3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### CORS errors?
**Fix:** Update `backend/.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

---

## 📚 What's Next?

After starting the platform:

1. ✅ **Register** an account
2. ✅ **Add domain** (if you have AWS SES)
3. ✅ **Upload subscribers** (CSV or manual)
4. ✅ **Create templates** (or use 5 samples)
5. ✅ **Send campaign** (test with small list first)
6. ✅ **View analytics** in Reports

---

## 📖 Documentation

- **README.md** - Main overview
- **QUICK_START.md** - 5-minute setup
- **MIGRATION_GUIDE.md** - Detailed guide
- **PROJECT_STRUCTURE.md** - Complete structure
- **backend/README.md** - API documentation
- **docs/** - Specific guides

---

## 🎯 Two Ways to Start

### Way 1: Batch Files (Windows - Easiest!)
```
1. Double-click start-backend.bat
2. Double-click start-frontend.bat
3. Open http://localhost:3000
```

### Way 2: Manual Commands
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

### Way 3: Docker
```bash
docker-compose up
```

---

## ✨ Features Available

Once running, you can:

- ✅ User authentication (Email/Password, Google)
- ✅ Campaign management (Create, send, track)
- ✅ Subscriber management (CSV upload, bulk ops)
- ✅ Email templates (5 pre-built + custom)
- ✅ Domain verification (AWS SES)
- ✅ Email tracking (Opens & clicks)
- ✅ Analytics dashboard
- ✅ Gmail integration (500/day)
- ✅ AWS SES (50K+/day)

---

## 💡 Pro Tips

1. **Test first** - Send to yourself before bulk sending
2. **Use MongoDB Atlas** - Free and easy
3. **Check logs** - Both terminals show helpful messages
4. **AWS SES optional** - Can use Gmail initially
5. **Read docs** - Comprehensive guides available

---

## 🆘 Need Help?

1. Check **QUICK_START.md** for setup
2. Check **MIGRATION_GUIDE.md** for details
3. Check **README.md** for overview
4. Check backend logs for errors
5. Check browser console for frontend errors

---

**Your project is ready to run! Just setup MongoDB and start the servers! 🚀**

