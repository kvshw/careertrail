# CareerTrail Deployment Guide

## Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub** (Already done!)
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your `careertrail` repository
   - Vercel will automatically detect it's a Next.js project

3. **Configure Environment Variables:**
   In your Vercel project dashboard, go to Settings → Environment Variables and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   OPENAI_API_KEY=sk-proj-your_openai_key
   PERPLEXITY_API_KEY=your_perplexity_key (optional)
   ```

4. **Configure Build Settings:**
   - Root Directory: `careertrail`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Deploy:**
   - Click "Deploy" 
   - Vercel will build and deploy your app
   - You'll get a live URL like `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   # or use npx vercel for one-time use
   ```

2. **Deploy from project root:**
   ```bash
   cd careertrail
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Set up environment variables
   - Deploy

## Environment Variables Required

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### OpenAI
- `OPENAI_API_KEY`: Your OpenAI API key for document analysis

### Optional
- `PERPLEXITY_API_KEY`: For enhanced research features

## Database Setup

Make sure your Supabase database has the latest migrations:
```sql
-- Run these in your Supabase SQL editor:
-- supabase/migrations/20241201000001_create_companies.sql
-- supabase/migrations/20241201000004_create_contacts_tables.sql
-- supabase/migrations/20241201000005_create_interviews_tables.sql
-- supabase/migrations/20241201000006_create_document_analyses.sql
-- supabase/migrations/20241201000007_create_document_optimizations.sql
```

## Domain Configuration

After deployment:
1. Add your Vercel domain to your Supabase Auth settings
2. Configure redirect URLs for authentication
3. Test all features in production

## Troubleshooting

- **Build Errors**: Check your environment variables are set correctly
- **Supabase Errors**: Ensure your database has all required tables and RLS policies
- **OpenAI Errors**: Verify your API key has sufficient credits
- **Runtime Errors**: Check browser console for detailed error messages

## Performance Tips

- Images are optimized automatically by Vercel
- API routes are serverless functions
- Static files are served from CDN
- Consider enabling Vercel Analytics for insights
