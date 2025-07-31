#!/usr/bin/env node

/**
 * Script to configure Google OAuth in Supabase
 * 
 * Usage:
 * 1. Get your Supabase access token from: https://supabase.com/dashboard/account/tokens
 * 2. Get your Google OAuth credentials from Google Cloud Console
 * 3. Run this script with your credentials
 * 
 * Example:
 * SUPABASE_ACCESS_TOKEN=your_token GOOGLE_CLIENT_ID=your_client_id GOOGLE_CLIENT_SECRET=your_secret node scripts/configure-google-oauth.js
 */

import https from 'https';

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ogiucaecljbmoddqcmno'; // Your project reference
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN environment variable is required');
  console.log('Get your access token from: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('❌ GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required');
  console.log('Get these from Google Cloud Console > APIs & Services > Credentials');
  process.exit(1);
}

const data = JSON.stringify({
  external_google_enabled: true,
  external_google_client_id: GOOGLE_CLIENT_ID,
  external_google_secret: GOOGLE_CLIENT_SECRET
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${PROJECT_REF}/config/auth`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🔧 Configuring Google OAuth in Supabase...');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Google OAuth configured successfully!');
      console.log('🎉 You can now sign in with Google in your CareerTrail app');
    } else {
      console.error('❌ Failed to configure Google OAuth');
      console.error('Status:', res.statusCode);
      console.error('Response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(data);
req.end(); 