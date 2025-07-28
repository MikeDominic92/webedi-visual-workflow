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

  // AI Configuration - Unified OpenRouter API
  OPENROUTER_API_KEY: process.env.REACT_APP_OPENROUTER_API_KEY || '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',

  // Legacy API keys (deprecated - now using OpenRouter)
  GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY || '',
  GROQ_API_KEY: process.env.REACT_APP_GROQ_API_KEY || '',
  
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