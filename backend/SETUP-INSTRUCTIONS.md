# 🚀 StudyBuddy Backend Setup Instructions

## For Other Agents/Developers

This guide helps you quickly set up and understand the StudyBuddy backend API when moving this folder to a new location.

## ⚡ Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Configure Supabase
1. Create a free Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API and copy:
   - Project URL
   - Anon public key
   - Service role key
4. Add these to your `.env` file

### 4. Database Setup
1. In Supabase, go to SQL Editor
2. Copy and paste the entire contents of `supabase-schema.sql`
3. Click "Run" to create all tables and policies

### 5. Start Server
```bash
npm start
```

Server runs on `http://localhost:3000`

### 6. Test It
```bash
curl http://localhost:3000/courses
```

You should see sample course data!

## 📁 What's in This Folder

### 🎯 Main Files (You Need These)
- **`server-final.js`** - The main API server ⭐ USE THIS ONE
- **`supabase-schema.sql`** - Complete database structure
- **`.env.example`** - Environment variables template
- **`package.json`** - Dependencies and scripts

### 📚 Documentation Files
- **`README.md`** - Comprehensive API documentation
- **`PERMISSIONS-GUIDE.md`** - Permission system explained
- **`OAUTH-SETUP.md`** - OAuth configuration guide

### 🔐 Authentication Files
- **`auth.js`** - Security middleware
- **`oauth.js`** - OAuth service (Google/GitHub)
- **`supabase.js`** - Database client

### 🗄️ Legacy Files (Ignore These)
- **`server.js`** - Old SQLite version
- **`database.js`** - Legacy database code
- **`server-supabase.js`** - Previous Supabase version
- **`server-oauth.js`** - Previous OAuth version

## 🔧 Environment Variables Explained

Create `.env` file with these values:

```env
# Required for all features
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=any_random_string_here

# Required for AI summarization
GOOGLE_AI_API_KEY=get_from_aistudio.google.com

# Optional: For OAuth login
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Optional: For frontend integration
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

## 🏗️ System Architecture

### Database (Supabase)
- PostgreSQL with Row Level Security (RLS)
- Automatic backups and scaling
- Real-time subscriptions
- Built-in authentication

### Permission System
- **Public**: Anyone can browse courses
- **Authenticated Users**: Can create courses and enroll
- **Course Owners**: Full control over their courses

### Key Features
- ✅ User authentication (email + OAuth)
- ✅ Course creation and management
- ✅ Student enrollment system
- ✅ Note management with AI summarization
- ✅ Search and filtering
- ✅ Progress tracking

## 📡 API Quick Reference

### Base URL: `http://localhost:3000`

### Public Endpoints (No Auth Required)
```http
GET /courses              # List all courses
GET /courses?search=keyword  # Search courses
GET /courses/:id          # Get course details
```

### Authentication Endpoints
```http
POST /auth/signup         # Register new user
POST /auth/login          # Login user
GET  /auth/me             # Get current user (requires token)
```

### Protected Endpoints (Require Auth)
```http
POST /courses             # Create course
PUT  /courses/:id         # Update course (owner only)
DELETE /courses/:id       # Delete course (owner only)
POST /courses/:id/enroll  # Enroll in course
GET  /user/dashboard      # User dashboard
```

### Response Format
```json
// Success
{
  "data": { ... }
}

// Error
{
  "error": "Error message"
}
```

## 🧪 Testing the API

### 1. Test Public Access
```bash
curl http://localhost:3000/courses
```

### 2. Create a User
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "fullName": "Test User"}'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 4. Use the Token
```bash
# Replace YOUR_TOKEN with the actual token from login response
curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Test Course", "description": "A test course"}'
```

## 🔍 Search Functionality

The API supports advanced course search:

```bash
# Search by title or description
curl "http://localhost:3000/courses?search=programming"

# Filter by category
curl "http://localhost:3000/courses?category=Technology"

# Sort results
curl "http://localhost:3000/courses?sort=created_at&order=desc"

# Combine parameters
curl "http://localhost:3000/courses?search=javascript&category=Technology&sort=title&order=asc"
```

## 🤖 AI Summarization Setup

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add it to your `.env` file: `GOOGLE_AI_API_KEY=your_key_here`
3. The summarization feature will now work automatically

## 🔐 OAuth Setup (Optional)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:3000/auth/google/callback`
4. Add client ID and secret to `.env`

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set callback URL: `http://localhost:3000/auth/github/callback`
4. Add client ID and secret to `.env`

## 🚨 Common Issues & Solutions

### "Database connection failed"
- Check SUPABASE_URL and keys in `.env`
- Ensure Supabase project is active
- Verify you ran the schema SQL

### "JWT token invalid"
- Check JWT_SECRET in `.env`
- Ensure token is not expired
- Verify token format: `Bearer TOKEN`

### "CORS errors" in frontend
- Set FRONTEND_URL in `.env` to your frontend URL
- Restart server after changing environment

### "OAuth redirect mismatch"
- Check redirect URIs in OAuth provider settings
- Ensure they match exactly (including http/https and port)

## 📱 Frontend Integration

### Base API URL
```javascript
const API_BASE = 'http://localhost:3000';
```

### Authentication Headers
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Example API Calls
```javascript
// Get courses
fetch(`${API_BASE}/courses`)
  .then(res => res.json())
  .then(data => console.log(data.data));

// Create course
fetch(`${API_BASE}/courses`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    title: 'New Course',
    description: 'Course description'
  })
});
```

## 🔄 Production Deployment

### Environment Changes
```env
NODE_ENV=production
BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### PM2 Setup
```bash
npm install -g pm2
pm2 start server-final.js --name "studybuddy-api"
```

### SSL/HTTPS
- Use HTTPS in production
- Update OAuth callback URLs
- Configure SSL certificates

## 🎯 Key Things to Remember

1. **Use `server-final.js`** - It's the complete production version
2. **Run the SQL schema** - Database won't work without it
3. **Configure environment** - All features need proper env vars
4. **Check permissions** - Course owners can only modify their own courses
5. **Public browsing** - Anyone can view courses without auth
6. **AI features** - Need Google AI Studio API key

## 📞 Need Help?

1. **Check the logs** - Server errors are logged in console
2. **Review README.md** - Has comprehensive API documentation
3. **Check PERMISSIONS-GUIDE.md** - For permission issues
4. **Verify environment** - Most issues are env var problems

## ✅ Setup Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment configured (`.env` created)
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Server starts successfully (`npm start`)
- [ ] Health check passes (`curl /courses`)
- [ ] User registration works
- [ ] Course creation works
- [ ] Search functionality works

Once all these pass, the backend is ready for frontend integration!

---

**This backend supports a complete learning platform where users can create courses, enroll in others' courses, and use AI-powered features. It's production-ready and secure.**
