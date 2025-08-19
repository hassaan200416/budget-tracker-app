import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment variable configuration with validation
export const env = {
  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/budget-app',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  
  // Server Configuration
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3005',
} as const;

// Validate required environment variables
export const validateEnv = (): void => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'] as const;
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.warn(`Warning: ${varName} is not set. Using default value.`);
    }
  }
};

// Export individual variables for convenience
export const { MONGODB_URI, JWT_SECRET, PORT, NODE_ENV, CORS_ORIGIN } = env;
