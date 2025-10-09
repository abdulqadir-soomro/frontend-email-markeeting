import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Environment {
  // Server
  PORT: number;
  NODE_ENV: string;
  
  // Database
  MONGODB_URI: string;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  
  // AWS SES
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_SES_FROM_EMAIL: string;
  
  // Application URLs
  APP_URL: string;
  API_URL: string;
  
  // CORS
  CORS_ORIGINS: string[];
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // File Upload
  MAX_FILE_SIZE: number;
}

const environment: Environment = {
  // Server
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/email-marketing',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // AWS SES
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'us-east-2',
  AWS_SES_FROM_EMAIL: process.env.AWS_SES_FROM_EMAIL || '',
  
  // Application URLs
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:5000',
  
  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'https://frontend-email-markeeting.vercel.app'],
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
};

// Validate critical environment variables
const validateEnvironment = (): void => {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  
  const missing = required.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    if (environment.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

validateEnvironment();

export default environment;

