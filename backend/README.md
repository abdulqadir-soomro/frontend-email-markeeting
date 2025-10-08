# Email Marketing Platform - Backend API

A robust Express.js backend with MongoDB for email marketing campaigns.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- AWS SES account
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your credentials
```

### Required Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/email-marketing
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/email-marketing

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# AWS SES
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-2

# Application
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:5000
```

### Development

```bash
# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Campaign Endpoints

#### Create Campaign
```http
POST /api/campaigns
Authorization: Bearer {token}
Content-Type: application/json

{
  "subject": "Newsletter Title",
  "htmlContent": "<h1>Hello!</h1>",
  "fromEmail": "hello@yourdomain.com",
  "fromName": "Your Company"
}
```

#### List Campaigns
```http
GET /api/campaigns?page=1&limit=10
Authorization: Bearer {token}
```

#### Send Campaign
```http
POST /api/campaigns/:id/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "sendingMethod": "ses"
}
```

### Subscriber Endpoints

#### Add Subscriber
```http
POST /api/subscribers
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "subscriber@example.com",
  "name": "Jane Smith",
  "status": "active"
}
```

#### Upload CSV
```http
POST /api/subscribers/upload
Authorization: Bearer {token}
Content-Type: application/json

{
  "csvData": "email,name\nuser@example.com,John Doe"
}
```

### Template Endpoints

#### Create Template
```http
POST /api/templates
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Welcome Email",
  "category": "transactional",
  "subject": "Welcome!",
  "htmlContent": "<h1>Welcome {{name}}!</h1>"
}
```

### Domain Endpoints

#### Add Domain
```http
POST /api/domains
Authorization: Bearer {token}
Content-Type: application/json

{
  "domain": "yourdomain.com"
}
```

#### Verify Domain
```http
POST /api/domains/:id/verify
Authorization: Bearer {token}
```

### Gmail Endpoints

#### Connect Gmail
```http
POST /api/gmail/connect
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "your.email@gmail.com",
  "appPassword": "xxxxxxxxxxxx"
}
```

### Tracking Endpoints

#### Track Email Open
```http
GET /api/track/open/:campaignId?email=user@example.com
```

#### Track Link Click
```http
GET /api/track/click?campaignId=xxx&url=https://example.com&email=user@example.com
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts
│   │   └── environment.ts
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── campaign.controller.ts
│   │   ├── subscriber.controller.ts
│   │   ├── template.controller.ts
│   │   ├── domain.controller.ts
│   │   ├── gmail.controller.ts
│   │   └── tracking.controller.ts
│   ├── models/           # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Campaign.ts
│   │   ├── Subscriber.ts
│   │   ├── Template.ts
│   │   ├── Domain.ts
│   │   ├── EmailRecord.ts
│   │   └── GmailCredential.ts
│   ├── routes/           # API routes
│   │   ├── auth.routes.ts
│   │   ├── campaign.routes.ts
│   │   ├── subscriber.routes.ts
│   │   ├── template.routes.ts
│   │   ├── domain.routes.ts
│   │   ├── gmail.routes.ts
│   │   ├── tracking.routes.ts
│   │   └── index.ts
│   ├── services/         # Business logic
│   │   ├── aws-ses.service.ts
│   │   └── gmail.service.ts
│   ├── middleware/       # Middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rate-limit.middleware.ts
│   └── server.ts         # Entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS protection
- MongoDB injection prevention
- XSS protection

## 📈 Scalability

- Optimized MongoDB indexes
- Efficient query patterns
- Connection pooling
- Proper error handling
- Stateless authentication (JWT)

## 🧪 Testing

```bash
# Run tests (if configured)
npm test
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t email-marketing-backend .

# Run container
docker run -p 5000:5000 --env-file .env email-marketing-backend
```

### Railway/Render Deployment

1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### Traditional VPS Deployment

```bash
# Build the project
npm run build

# Run with PM2
pm2 start dist/server.js --name email-marketing-api
pm2 save
pm2 startup
```

## 📞 Support

For issues or questions, please open an issue on GitHub.

## 📄 License

MIT License

