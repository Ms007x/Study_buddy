# OAuth Authentication Setup Guide

This guide explains how to set up OAuth authentication for StudyBuddy with Google and GitHub providers.

## Overview

StudyBuddy supports OAuth authentication allowing users to sign in with their existing accounts from:
- **Google** - Google Account OAuth 2.0
- **GitHub** - GitHub OAuth App

## OAuth Flow

The API supports two OAuth flows:

### 1. Server-Side Flow (Recommended for Web Apps)
```
Frontend → /auth/:provider → OAuth Provider → /auth/:provider/callback → Frontend
```

### 2. Token Exchange Flow (For SPAs/Mobile Apps)
```
Frontend → OAuth Provider → /auth/oauth/token → JWT Token
```

## Setup Instructions

### 1. Google OAuth Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API

#### Step 2: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
5. Copy **Client ID** and **Client Secret**

#### Step 3: Configure Environment
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. GitHub OAuth Setup

#### Step 1: Create GitHub OAuth App
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in application details:
   - **Application name**: StudyBuddy
   - **Homepage URL**: `http://localhost:3000` (dev) or `https://yourdomain.com` (prod)
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback` (dev) or `https://yourdomain.com/auth/github/callback` (prod)
4. Click **Register application**
5. Copy **Client ID** and generate **Client Secret**

#### Step 2: Configure Environment
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Frontend Configuration

#### Environment Variables
```env
# Frontend .env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_BASE_URL=http://localhost:3001  # Your frontend URL
```

#### Backend Environment
```env
# Backend .env
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

## API Endpoints

### OAuth Flow Endpoints

#### Get Available Providers
```http
GET /auth/providers
```

**Response:**
```json
{
  "data": {
    "providers": [
      {
        "name": "google",
        "displayName": "Google",
        "authUrl": "http://localhost:3000/auth/google"
      },
      {
        "name": "github",
        "displayName": "GitHub",
        "authUrl": "http://localhost:3000/auth/github"
      }
    ]
  }
}
```

#### Initiate OAuth (Server-Side Flow)
```http
GET /auth/:provider
```
Redirects user to OAuth provider.

#### OAuth Callback
```http
GET /auth/:provider/callback
```
Handles OAuth provider callback and redirects to frontend with token.

#### Token Exchange (SPA/Mobile Flow)
```http
POST /auth/oauth/token
Content-Type: application/json

{
  "provider": "google",
  "accessToken": "oauth_access_token"
}
```

**Response:**
```json
{
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "user_uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://...",
      "provider": "google"
    }
  }
}
```

## Frontend Implementation Examples

### React Example (Server-Side Flow)

```jsx
import React, { useEffect, useState } from 'react';

const OAuthLogin = () => {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetch('/auth/providers')
      .then(res => res.json())
      .then(data => setProviders(data.data.providers));
  }, []);

  const handleOAuthLogin = (provider) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/${provider}`;
  };

  return (
    <div>
      <h2>Login with OAuth</h2>
      {providers.map(provider => (
        <button 
          key={provider.name}
          onClick={() => handleOAuthLogin(provider.name)}
        >
          Login with {provider.displayName}
        </button>
      ))}
    </div>
  );
};

// Handle OAuth callback
const OAuthCallback = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      window.location.href = '/dashboard';
    }
  }, []);

  return <div>Processing login...</div>;
};
```

### React Example (Token Exchange Flow)

```jsx
import React from 'react';

const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    // Use Google's GSI or similar to get access token
    const { accessToken } = await getGoogleAccessToken();
    
    const response = await fetch('/auth/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'google',
        accessToken
      })
    });
    
    const { data } = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  return <button onClick={handleGoogleLogin}>Login with Google</button>;
};
```

## Database Schema Updates

The OAuth integration adds a `user_profiles` table:

```sql
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  provider TEXT, -- 'email', 'google', 'github'
  provider_id TEXT, -- ID from OAuth provider
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Considerations

### 1. State Parameter
- Random state tokens prevent CSRF attacks
- States are stored temporarily and verified on callback

### 2. Token Security
- JWT tokens expire in 7 days
- Use HTTPS in production
- Store tokens securely in frontend (httpOnly cookies recommended)

### 3. Redirect URI Validation
- Only allow pre-configured redirect URIs
- Validate OAuth provider responses

### 4. Rate Limiting
- Implement rate limiting on OAuth endpoints
- Prevent brute force attacks

## Testing OAuth Locally

### 1. Google OAuth Testing
1. Use `http://localhost:3000/auth/google/callback` in Google Console
2. Test with the Google OAuth 2.0 Playground first

### 2. GitHub OAuth Testing
1. Use `http://localhost:3000/auth/github/callback` in GitHub App settings
2. GitHub OAuth is simpler to test locally

### 3. Testing Flow
```bash
# Test OAuth initiation
curl http://localhost:3000/auth/providers

# Test token exchange (after getting OAuth token)
curl -X POST http://localhost:3000/auth/oauth/token \
  -H "Content-Type: application/json" \
  -d '{"provider": "google", "accessToken": "your_token"}'
```

## Production Deployment

### 1. Environment Variables
```env
# Production
BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# OAuth URLs in provider consoles:
# Google: https://api.yourdomain.com/auth/google/callback
# GitHub: https://api.yourdomain.com/auth/github/callback
```

### 2. HTTPS Required
- OAuth providers require HTTPS in production
- Configure SSL certificates
- Update all callback URLs

### 3. Domain Configuration
- Add custom domain to OAuth apps
- Update authorized JavaScript origins (if using Google Sign-In)
- Configure CORS properly

## Troubleshooting

### Common Issues

#### 1. "redirect_uri_mismatch" Error
- Check that redirect URI matches exactly in OAuth provider settings
- Include http:// or https:// and correct port

#### 2. "invalid_client" Error
- Verify client ID and client secret are correct
- Check for extra spaces or special characters

#### 3. "State mismatch" Error
- Clear browser cookies and try again
- Check that state parameter is being handled correctly

#### 4. CORS Issues
- Ensure frontend URL is in CORS allowed origins
- Check that API requests include proper headers

### Debug Mode
Enable debug logging:
```env
DEBUG=oauth:*
```

### Testing with OAuth Playground
- [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
- [GitHub OAuth Token Generator](https://github.com/settings/tokens)

## Additional Providers

To add more OAuth providers:

1. Add provider configuration to `oauth.js`
2. Update environment variables
3. Add provider-specific user info normalization
4. Update documentation

Example for Facebook:
```javascript
facebook: {
  authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
  userInfoUrl: 'https://graph.facebook.com/me',
  scope: 'email',
  clientId: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET
}
```

## Support

For OAuth-related issues:
1. Check provider documentation
2. Verify environment variables
3. Review callback URL configuration
4. Check browser console for errors
5. Review server logs for detailed error messages
