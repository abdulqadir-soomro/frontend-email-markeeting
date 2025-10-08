# ⚡ Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (from root)
cd ..
npm install
```

### Step 2: Setup Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/email-marketing
JWT_SECRET=your-secret-key-change-this
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-2
```

**Frontend:**
Create `.env.local` in root:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB

**Local:**
```bash
mongod
```

**Or use MongoDB Atlas** (free cloud database):
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in backend/.env

### Step 4: Run Backend

```bash
cd backend
npm run dev
```

✅ Backend running at **http://localhost:5000**

### Step 5: Run Frontend

```bash
# In new terminal, from root directory
npm run dev
```

✅ Frontend running at **http://localhost:3000**

### Step 6: Test It!

1. Open **http://localhost:3000**
2. Click **Register**
3. Create account
4. Start using the platform!

---

## 🐳 Alternative: Docker (Even Easier!)

```bash
# Start everything
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop everything
docker-compose down
```

Done! Everything running in Docker containers.

---

## 🧪 Test the API

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

---

## 📚 Next Steps

- Read **MIGRATION_GUIDE.md** for detailed documentation
- Check **backend/README.md** for API endpoints
- See **PROJECT_SUMMARY.md** for architecture overview

---

## ❓ Troubleshooting

**Backend won't start?**
- Make sure MongoDB is running: `mongosh`
- Check port 5000 is free: `lsof -i :5000`

**CORS errors?**
- Check `CORS_ORIGINS` in backend/.env
- Should include `http://localhost:3000`

**Can't connect to MongoDB?**
- Local: `sudo systemctl start mongod`
- Atlas: Check IP whitelist (allow 0.0.0.0/0)

---

**Need help?** See full documentation in MIGRATION_GUIDE.md

