// Environment configuration with fallbacks
export const config = {
  // API Configuration
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  
  // Supabase Configuration (for future use)
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
  
  // Feature Flags
  ENABLE_AI_INTEGRATION: process.env.REACT_APP_ENABLE_AI_INTEGRATION === 'true',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  
  // App Configuration
  APP_NAME: process.env.REACT_APP_NAME || 'WebEDI Visual Workflow',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  
  // Environment
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Performance
  MAX_NODES: parseInt(process.env.REACT_APP_MAX_NODES || '100', 10),
  ANIMATION_DURATION: parseInt(process.env.REACT_APP_ANIMATION_DURATION || '300', 10),
};

// Type-safe environment variable access
export type Config = typeof config;