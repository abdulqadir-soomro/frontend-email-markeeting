# 📁 Project Structure

## Overview

This project is organized as **two separate applications**:
- **Frontend** - Next.js application (Port 3000)
- **Backend** - Express.js API (Port 5000)

---

## 🎯 Folder Structure

```
amzonwork-next/
│
├── 📁 frontend/                      # NEXT.JS FRONTEND APPLICATION
│   │
│   ├── 📁 app/                        # Next.js 14 App Router
│   │   ├── auth/                      # Authentication pages
│   │   │   ├── login/                 # Login page
│   │   │   └── register/              # Registration page
│   │   │
│   │   ├── dashboard/                 # Protected dashboard routes
│   │   │   ├── page.tsx               # Main dashboard
│   │   │   ├── campaigns/             # Campaign management
│   │   │   ├── subscribers/           # Subscriber management
│   │   │   ├── templates/             # Template management
│   │   │   ├── domains/               # Domain management
│   │   │   ├── reports/               # Analytics & reports
│   │   │   ├── settings/              # User settings
│   │   │   ├── admin/                 # Admin dashboard
│   │   │   ├── test-tracking/         # Developer tools
│   │   │   └── layout.tsx             # Dashboard layout
│   │   │
│   │   ├── page.tsx                   # Landing page
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Global styles
│   │
│   ├── 📁 components/                 # React Components
│   │   ├── ui/                        # ShadCN UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── dashboard/                 # Dashboard components
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   └── ProtectedRoute.tsx         # Auth guard component
│   │
│   ├── 📁 lib/                        # Utilities & Helpers
│   │   ├── api-client.ts              # 🔥 API client for backend
│   │   └── utils.ts                   # Utility functions
│   │
│   ├── 📁 public/                     # Static assets
│   │
│   ├── 📄 package.json                # Frontend dependencies
│   ├── 📄 next.config.js              # Next.js configuration
│   ├── 📄 tailwind.config.ts          # Tailwind CSS config
│   ├── 📄 postcss.config.js           # PostCSS config
│   └── 📄 tsconfig.json               # TypeScript config
│
│
├── 📁 backend/                       # EXPRESS.JS BACKEND API
│   │
│   ├── 📁 src/                        # Source code
│   │   │
│   │   ├── 📁 models/                 # Mongoose Models (Database)
│   │   │   ├── User.ts                # User authentication
│   │   │   ├── Campaign.ts            # Email campaigns
│   │   │   ├── Subscriber.ts          # Email list contacts
│   │   │   ├── Template.ts            # Email templates
│   │   │   ├── Domain.ts              # Verified domains
│   │   │   ├── EmailRecord.ts         # Email tracking
│   │   │   └── GmailCredential.ts     # Gmail integration
│   │   │
│   │   ├── 📁 controllers/            # Request Handlers
│   │   │   ├── auth.controller.ts     # Authentication logic
│   │   │   ├── campaign.controller.ts # Campaign CRUD
│   │   │   ├── subscriber.controller.ts # Subscriber CRUD
│   │   │   ├── template.controller.ts # Template CRUD
│   │   │   ├── domain.controller.ts   # Domain management
│   │   │   ├── gmail.controller.ts    # Gmail integration
│   │   │   └── tracking.controller.ts # Open/Click tracking
│   │   │
│   │   ├── 📁 services/               # Business Logic
│   │   │   ├── aws-ses.service.ts     # AWS SES email sending
│   │   │   └── gmail.service.ts       # Gmail SMTP sending
│   │   │
│   │   ├── 📁 routes/                 # API Routes
│   │   │   ├── auth.routes.ts         # /api/auth/*
│   │   │   ├── campaign.routes.ts     # /api/campaigns/*
│   │   │   ├── subscriber.routes.ts   # /api/subscribers/*
│   │   │   ├── template.routes.ts     # /api/templates/*
│   │   │   ├── domain.routes.ts       # /api/domains/*
│   │   │   ├── gmail.routes.ts        # /api/gmail/*
│   │   │   ├── tracking.routes.ts     # /api/track/*
│   │   │   └── index.ts               # Route aggregator
│   │   │
│   │   ├── 📁 middleware/             # Express Middleware
│   │   │   ├── auth.middleware.ts     # JWT authentication
│   │   │   ├── error.middleware.ts    # Error handling
│   │   │   ├── validation.middleware.ts # Input validation
│   │   │   └── rate-limit.middleware.ts # Rate limiting
│   │   │
│   │   ├── 📁 config/                 # Configuration
│   │   │   ├── database.ts            # MongoDB connection
│   │   │   └── environment.ts         # Environment variables
│   │   │
│   │   └── 📄 server.ts               # Express app entry point
│   │
│   ├── 📄 package.json                # Backend dependencies
│   ├── 📄 tsconfig.json               # TypeScript config
│   ├── 📄 nodemon.json                # Development config
│   ├── 📄 Dockerfile                  # Docker image
│   ├── 📄 .env.example                # Environment template
│   └── 📄 README.md                   # Backend documentation
│
│
├── 📁 docs/                          # DOCUMENTATION
│   ├── DNS_PROVIDER_SETUP.md          # DNS API setup
│   ├── EMAIL_DELIVERABILITY_GUIDE.md  # Spam prevention
│   └── EMAIL_TRACKING_TROUBLESHOOTING.md # Tracking issues
│
│
├── 📄 docker-compose.yml             # Docker orchestration
├── 📄 .dockerignore                  # Docker ignore file
├── 📄 .gitignore                     # Git ignore file
│
├── 📄 start-backend.bat              # 🚀 Start backend (Windows)
├── 📄 start-frontend.bat             # 🚀 Start frontend (Windows)
│
├── 📄 README.md                      # Main documentation
├── 📄 START_PROJECT.md               # Setup instructions
├── 📄 QUICK_START.md                 # 5-minute guide
├── 📄 MIGRATION_GUIDE.md             # Detailed migration
├── 📄 PROJECT_SUMMARY.md             # Architecture overview
├── 📄 CHANGELOG.md                   # Version history
├── 📄 STRUCTURE.md                   # This file
│
├── 📄 GET_STARTED.md                 # Legacy guide
├── 📄 SETUP_INSTRUCTIONS.md          # Legacy Firebase setup
├── 📄 GMAIL_SETUP_GUIDE.md           # Gmail integration
└── 📄 TEMPLATES_GUIDE.md             # Template usage
```

---

## 🎯 Key Files

### Frontend
- **`frontend/lib/api-client.ts`** - All API calls to backend
- **`frontend/app/layout.tsx`** - Root layout with providers
- **`frontend/components/ProtectedRoute.tsx`** - Authentication guard

### Backend
- **`backend/src/server.ts`** - Express app entry point
- **`backend/src/config/database.ts`** - MongoDB connection
- **`backend/src/routes/index.ts`** - All API routes

### Configuration
- **`backend/.env`** - Backend environment variables
- **`frontend/.env.local`** - Frontend environment variables
- **`docker-compose.yml`** - Multi-service Docker setup

---

## 🔄 Data Flow

```
User Browser
    ↓
Next.js Frontend (Port 3000)
    ↓ HTTP/REST API
Express.js Backend (Port 5000)
    ↓ Mongoose ODM
MongoDB Database
```

---

## 📦 Dependencies

### Frontend Dependencies
```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "tailwindcss": "3.x",
  "@radix-ui/*": "UI components",
  "lucide-react": "Icons"
}
```

### Backend Dependencies
```json
{
  "express": "4.x",
  "mongoose": "8.x",
  "jsonwebtoken": "9.x",
  "bcryptjs": "2.x",
  "@aws-sdk/client-sesv2": "3.x",
  "nodemailer": "6.x",
  "express-validator": "7.x",
  "express-rate-limit": "7.x"
}
```

---

## 🚀 Running the Project

### Development (Two Separate Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Quick Start (Windows)
```cmd
start-backend.bat    # Terminal 1
start-frontend.bat   # Terminal 2
```

### Docker (All in One)
```bash
docker-compose up
```

---

## 📊 API Structure

```
http://localhost:5000/api/
│
├── /auth                 # Authentication
│   ├── POST /register
│   ├── POST /login
│   ├── POST /google
│   ├── GET /me
│   └── POST /logout
│
├── /campaigns            # Campaign Management
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── POST /:id/send
│   ├── DELETE /:id
│   ├── GET /:id/recipients
│   ├── GET /:id/analytics
│   └── POST /quick-send
│
├── /subscribers          # Subscriber Management
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PUT /:id
│   ├── DELETE /:id
│   ├── POST /bulk-delete
│   ├── POST /upload
│   └── GET /stats
│
├── /templates            # Template Management
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PUT /:id
│   ├── DELETE /:id
│   └── POST /seed
│
├── /domains              # Domain Management
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── POST /:id/verify
│   ├── DELETE /:id
│   ├── POST /:id/emails
│   └── DELETE /:id/emails
│
├── /gmail                # Gmail Integration
│   ├── POST /connect
│   ├── GET /status
│   ├── DELETE /disconnect
│   └── GET /test
│
└── /track                # Email Tracking
    ├── GET /open/:campaignId
    └── GET /click
```

---

## 🔐 Security Layers

1. **JWT Authentication** - Token-based auth in `auth.middleware.ts`
2. **Password Hashing** - Bcrypt in `User.ts` model
3. **Rate Limiting** - Express rate limit in `rate-limit.middleware.ts`
4. **Input Validation** - Express validator in `validation.middleware.ts`
5. **CORS Protection** - Configured in `server.ts`
6. **Error Handling** - Centralized in `error.middleware.ts`

---

## 📝 Notes

- **Frontend** is completely independent from backend
- **Backend** can be deployed separately
- **API Client** (`api-client.ts`) handles all HTTP requests
- **Environment variables** are separate for each application
- **Both** can be run simultaneously on different ports

---

**This structure allows for:**
✅ Independent development
✅ Separate deployment
✅ Easy scaling
✅ Team collaboration
✅ Microservices migration

---

For more details, see:
- **README.md** - Main documentation
- **START_PROJECT.md** - Setup guide
- **PROJECT_SUMMARY.md** - Architecture overview

