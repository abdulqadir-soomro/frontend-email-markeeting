import express, { Application } from 'express';
import cors from 'cors';
import environment from './config/environment';
import connectDatabase from './config/database';
import routes from './routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rate-limit.middleware';

// Create Express app
const app: Application = express();

// Connect to database
connectDatabase();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    console.log('🔍 CORS Request from origin:', origin);
    console.log('🔍 Allowed origins:', environment.CORS_ORIGINS);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (environment.CORS_ORIGINS.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      return callback(null, true);
    }
    
    // Log CORS issues for debugging
    console.log('❌ CORS blocked origin:', origin);
    console.log('❌ Allowed origins:', environment.CORS_ORIGINS);
    
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Email Marketing Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
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

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    corsOrigins: environment.CORS_ORIGINS,
  });
});

// CORS test route
app.get('/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    origin: req.headers.origin,
    allowedOrigins: environment.CORS_ORIGINS,
  });
});

// Handle favicon requests (browsers automatically request these)
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response
});

app.get('/favicon.png', (req, res) => {
  res.status(204).end(); // No content response
});

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = environment.PORT;

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   📧 EMAIL MARKETING PLATFORM API         ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   🚀 Server running on port ${PORT}          ║`);
  console.log(`║   🌍 Environment: ${environment.NODE_ENV.padEnd(20)} ║`);
  console.log(`║   📡 API URL: http://localhost:${PORT}       ║`);
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log('✅ Ready to accept requests');
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

export default app;

