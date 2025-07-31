# 🔐 Google OAuth Setup Guide for CareerTrail

This guide will help you set up Google OAuth authentication for your CareerTrail app.

## 📋 Prerequisites

- A Google account
- Access to Google Cloud Console
- Your Supabase project (already created)

## 🚀 Step-by-Step Setup

### Step 1: Create Google OAuth Application

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Name: `CareerTrail OAuth`
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Name: `CareerTrail Web Client`
   - **Authorized redirect URIs**: Add this URL:
     ```
     https://ogiucaecljbmoddqcmno.supabase.co/auth/v1/callback
     ```
   - Click "Create"

5. **Save Your Credentials**
   - You'll get a **Client ID** and **Client Secret**
   - Save these securely - you'll need them for the next step

### Step 2: Get Supabase Access Token

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account

2. **Get Access Token**
   - Go to "Account" > "Access Tokens"
   - Click "Generate new token"
   - Give it a name like "CareerTrail OAuth Setup"
   - Copy the token (you won't see it again)

### Step 3: Configure Google OAuth in Supabase

1. **Run the Configuration Script**
   ```bash
   # Set your environment variables
   export SUPABASE_ACCESS_TOKEN="your_supabase_token"
   export GOOGLE_CLIENT_ID="your_google_client_id"
   export GOOGLE_CLIENT_SECRET="your_google_client_secret"
   
   # Run the configuration script
   node scripts/configure-google-oauth.js
   ```

2. **Verify Configuration**
   - Go to your Supabase project dashboard
   - Navigate to "Authentication" > "Providers"
   - You should see Google enabled

### Step 4: Test Google OAuth

1. **Start your development server**
   ```bash
   cd careertrail
   npm run dev
   ```

2. **Test the sign-in flow**
   - Go to http://localhost:3000/signin
   - Click "Sign in with Google"
   - You should be redirected to Google's consent screen
   - After authorization, you should be redirected back to your dashboard

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Make sure the redirect URI in Google Cloud Console exactly matches:
     ```
     https://ogiucaecljbmoddqcmno.supabase.co/auth/v1/callback
     ```

2. **"OAuth client not found" error**
   - Verify your Google Client ID and Secret are correct
   - Make sure you're using the Web application credentials, not other types

3. **"Access denied" error**
   - Check that your Supabase access token is valid
   - Make sure you have the correct project reference

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Check the Supabase dashboard logs
3. Verify all environment variables are set correctly
4. Make sure the Google+ API is enabled in your Google Cloud project

## 🎉 Success!

Once configured, users will be able to:
- Sign in with their Google account
- Have their profile automatically created
- Access all CareerTrail features seamlessly

The Google OAuth integration provides a secure, user-friendly authentication experience for your CareerTrail app! 