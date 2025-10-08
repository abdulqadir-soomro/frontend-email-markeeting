# Quick Setup Guide

## 🚀 Get the Backend Running (5 minutes)

### Option 1: Use MongoDB Atlas (Recommended - Free)

1. **Create MongoDB Atlas Account**:
   - Go to https://www.mongodb.com/atlas
   - Sign up for free
   - Create a new cluster (free tier available)

2. **Get Connection String**:
   - In Atlas dashboard, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

3. **Set Environment Variable**:
   ```bash
   # In backend directory, create .env file
   echo "MONGODB_URI=mongodb+srv://your-connection-string" > .env
   ```

### Option 2: Use Docker (Local MongoDB)

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use docker-compose
docker-compose up -d
```

## 🔧 Start the Backend

```bash
cd backend
npm run dev
```

The backend will start on http://localhost:5000

## 🎯 Test the Frontend

The frontend should now work! Try registering a new account.

## 📝 Environment Variables

Create `backend/.env` with:
```
MONGODB_URI=mongodb+srv://your-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key
```

That's it! The application should be fully functional.
