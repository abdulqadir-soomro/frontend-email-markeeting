// Vercel entry point for Email Marketing Platform API
// Updated: Latest deployment with full API structure
// Deployment timestamp: 2025-01-09 22:15:00 UTC
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

const app = express();

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'https://frontend-email-markeeting.vercel.app'];

console.log('🔍 CORS Origins configured:', corsOrigins);

// Temporary: Add permissive CORS for debugging
if (process.env.NODE_ENV === 'development' || process.env.DEBUG_CORS === 'true') {
  console.log('⚠️  Using permissive CORS for debugging');
  app.use(cors({
    origin: true, // Allow all origins for debugging
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
  }));
} else {
  app.use(cors({
  origin: (origin, callback) => {
    console.log('🔍 CORS Request from origin:', origin);
    console.log('🔍 Allowed origins:', corsOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (corsOrigins.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      return callback(null, true);
    }
    
    // Log CORS issues for debugging
    console.log('❌ CORS blocked origin:', origin);
    console.log('❌ Allowed origins:', corsOrigins);
    
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  }));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/email-marketing';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to database
connectDatabase();

// Import routes (we'll need to add these)
// For now, let's add basic API structure

// Basic routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Email Marketing Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      corsTest: '/cors-test',
      auth: '/api/auth',
      campaigns: '/api/campaigns',
      subscribers: '/api/subscribers',
      templates: '/api/templates',
      domains: '/api/domains',
      gmail: '/api/gmail',
      tracking: '/api/track',
    },
  });
});

// API routes placeholder
app.use('/api/auth/login', (req, res) => {
  console.log('🔍 Login request received:', {
    method: req.method,
    origin: req.headers.origin,
    body: req.body,
    headers: req.headers
  });
  
  // Basic login response for CORS testing
  res.json({
    success: true,
    message: 'CORS test successful - Login endpoint working',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', (req, res) => {
  res.json({
    success: false,
    error: 'Auth routes not implemented yet. Please use the full TypeScript server.',
    message: 'This is a simplified version for CORS testing.',
  });
});

app.use('/api/campaigns', (req, res) => {
  res.json({
    success: false,
    error: 'Campaign routes not implemented yet. Please use the full TypeScript server.',
    message: 'This is a simplified version for CORS testing.',
  });
});

app.use('/api/subscribers', (req, res) => {
  res.json({
    success: false,
    error: 'Subscriber routes not implemented yet. Please use the full TypeScript server.',
    message: 'This is a simplified version for CORS testing.',
  });
});

app.use('/api/templates', (req, res) => {
  res.json({
    success: false,
    error: 'Template routes not implemented yet. Please use the full TypeScript server.',
    message: 'This is a simplified version for CORS testing.',
  });
});

app.use('/api/domains', (req, res) => {
  res.json({
    success: false,
    error: 'Domain routes not implemented yet. Please use the full TypeScript server.',
    message: 'This is a simplified version for CORS testing.',
  });
});

app.use('/api/gmail', (req, res) => {
  res.json({
    success: false,
    error: 'Gmail routes not implemented yet. Please use the full TypeScript server.',
    message: 'This is a simplified version for CORS testing.',
  });
});

app.use('/api/track', (req, res) => {
  res.json({
    success: false,
    error: 'Tracking routes not implemented yet. Please use the full TypeScript server.',
    message: 'This is a simplified version for CORS testing.',
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    corsOrigins: corsOrigins,
  });
});

app.get('/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    origin: req.headers.origin,
    allowedOrigins: corsOrigins,
  });
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/favicon.png', (req, res) => {
  res.status(204).end();
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// Export for Vercel
module.exports = app;
