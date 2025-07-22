# WebEDI Visual Workflow - Deployment Guide

## 🚀 Quick Start Deployment

### Prerequisites
- Node.js 18+ installed
- Git installed
- GitHub account
- Netlify account (free tier is sufficient)

## Option 1: Deploy to Netlify (Recommended)

### Step 1: Prepare Your Repository
```bash
# Initialize git if not already done
git init

# Create .gitignore if needed
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo "build/" >> .gitignore

# Add all files
git add .

# Commit
git commit -m "Initial commit - WebEDI Visual Workflow"

# Create a new repository on GitHub
# Then push your code:
git remote add origin https://github.com/YOUR_USERNAME/webedi-visual-workflow.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Netlify

#### Method A: Netlify CLI (Fastest)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy directly
netlify deploy --prod --dir=build

# Or link to Git repository for automatic deployments
netlify init
```

#### Method B: Netlify Web Interface
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and authorize Netlify
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click "Deploy site"

### Step 3: Configure Environment Variables (Optional)
In Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add any required variables:
   ```
   REACT_APP_ENABLE_AI_INTEGRATION=true
   REACT_APP_ENABLE_ANALYTICS=true
   ```

### Step 4: Set Up Custom Domain (Optional)
1. In Netlify dashboard → Domain settings
2. Add custom domain
3. Follow DNS configuration instructions

## Option 2: Deploy with Supabase Integration

### Step 1: Set Up Supabase
1. Create account at [https://supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API to get your keys

### Step 2: Create Database Schema
```sql
-- Create workflows table
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_data JSONB NOT NULL,
  workflow_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create tickets table
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type VARCHAR(10) NOT NULL,
  supplier VARCHAR(255),
  buyer VARCHAR(255),
  error_type VARCHAR(255),
  error_code VARCHAR(50),
  affected_pos TEXT[],
  raw_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth needs)
CREATE POLICY "Public read access" ON workflows FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tickets FOR SELECT USING (true);
```

### Step 3: Update Environment Variables
Add to Netlify:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Option 3: Deploy to Google Cloud Run

### Step 1: Create Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create nginx.conf
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### Step 3: Deploy to Cloud Run
```bash
# Build and push image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/webedi-workflow

# Deploy to Cloud Run
gcloud run deploy webedi-workflow \
  --image gcr.io/YOUR_PROJECT_ID/webedi-workflow \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔧 Post-Deployment Configuration

### Performance Optimization
1. Enable Netlify's asset optimization
2. Configure caching headers (already in netlify.toml)
3. Enable Brotli compression

### Monitoring
1. Set up Netlify Analytics (paid feature)
2. Or add Google Analytics:
   ```javascript
   // Add to public/index.html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

### Security Headers
Already configured in netlify.toml:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

## 📊 Deployment Checklist

- [ ] Code committed to Git
- [ ] Environment variables configured
- [ ] Build tested locally (`npm run build`)
- [ ] Deployment successful
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Performance tested
- [ ] Error tracking configured (optional)

## 🆘 Troubleshooting

### Build Failures
1. Check Node version (should be 18+)
2. Clear cache: `rm -rf node_modules package-lock.json && npm install`
3. Check for TypeScript errors: `npm run build`

### Runtime Errors
1. Check browser console for errors
2. Verify environment variables are set
3. Check network requests in browser DevTools

### Performance Issues
1. Enable production mode
2. Check bundle size: `npm run build` shows gzipped sizes
3. Use Chrome DevTools Lighthouse for analysis

## 🔄 Continuous Deployment

With Netlify connected to GitHub:
1. Every push to `main` triggers deployment
2. Pull requests create preview deployments
3. Branch deploys available for testing

## 📚 Additional Resources

- [Netlify Docs](https://docs.netlify.com)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment)
- [React Flow Performance](https://reactflow.dev/docs/guides/performance)
- [Supabase React Guide](https://supabase.com/docs/guides/with-react)