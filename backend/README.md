# StudyBuddy Backend API

A comprehensive RESTful API for a study platform with user authentication, course management, enrollment system, and AI-powered note summarization.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- PostgreSQL database (local or Render PostgreSQL)
- Google AI Studio API key (for summarization)

### Installation
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure environment variables (see Configuration section)
```

### Database Setup
1. Create a PostgreSQL database
2. Run the SQL schema from `postgresql-schema.sql` in your PostgreSQL client
3. Configure OAuth providers if needed (see OAuth Setup)

### Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000` by default.

## 📋 Features

### 🔐 Authentication
- Email/password authentication with bcrypt
- OAuth support (Google, GitHub)
- JWT token-based security
- User profile management

### 📚 Course Management
- **All users can create courses**
- Course owners can modify/delete their courses
- Public course browsing and search
- Category and metadata support

### 👥 Enrollment System
- Users can enroll in any course (except their own)
- Course owners can view enrollments
- Progress tracking and analytics

### 📝 Notes & Content
- Course owners can create/manage notes
- Enrolled students can access notes
- AI-powered summarization (Google Gemini API)
- PDF upload support with text extraction

### 🔍 Search & Discovery
- Full-text search in courses
- Category filtering
- Multiple sorting options
- Public course catalog

### 📊 Analytics & Tracking
- User activity history
- Course progress tracking
- Enrollment statistics
- AI usage analytics

## 🏗️ Architecture

### Database (PostgreSQL)
- **PostgreSQL** with proper indexing
- **ACID compliance** for data integrity
- **Automatic backups** (if using managed service)
- **JSON support** for flexible data

### Key Tables
```sql
users (custom authentication)
├── courses (course catalog)
├── notes (course content with PDF support)
├── enrollments (user-course relationships)
├── user_note_history (activity tracking)
├── user_progress (learning analytics)
└── pdf_uploads (PDF file management)
```

### Security Model
- **bcrypt password hashing** for secure authentication
- **JWT authentication** for API access
- **Role-based permissions** (public, user, owner)
- **Input validation** and sanitization

## 🔧 Configuration

### Environment Variables
Create `.env` file with:

```env
# Server Configuration
PORT=3000
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# PostgreSQL Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/studybuddy
DB_HOST=localhost
DB_PORT=5432
DB_NAME=studybuddy
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Google AI Studio (for summarization)
GOOGLE_AI_API_KEY=your_google_ai_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### PostgreSQL Setup
1. **Create Database**: `createdb studybuddy`
2. **Run Schema**: Execute `postgresql-schema.sql`
3. **Create User**: Optional dedicated database user
4. **Test Connection**: Verify with `psql` or GUI tool

### OAuth Setup (Optional)
1. **Google OAuth**: 
   - Create credentials in Google Cloud Console
   - Add redirect URI: `{BASE_URL}/auth/google/callback`
2. **GitHub OAuth**:
   - Create OAuth App in GitHub Settings
   - Set callback URL: `{BASE_URL}/auth/github/callback`

## 📡 API Documentation

### Base URL
```
http://localhost:3000
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

### Authentication
All protected endpoints require:
```http
Authorization: Bearer JWT_TOKEN
```

### Core Endpoints

#### Authentication
```http
POST /auth/signup          # User registration
POST /auth/login           # User login
POST /auth/logout          # User logout
GET  /auth/me              # Current user info
GET  /auth/providers       # Available OAuth providers
GET  /auth/:provider       # Initiate OAuth flow
GET  /auth/:provider/callback  # OAuth callback
POST /auth/oauth/token     # Exchange OAuth token
```

#### Courses (Public + Authenticated)
```http
GET    /courses            # List/search courses (public)
GET    /courses/:id        # Get course details (public)
POST   /courses            # Create course (auth required)
PUT    /courses/:id        # Update course (owner only)
DELETE /courses/:id        # Delete course (owner only)
```

#### Enrollments
```http
POST   /courses/:id/enroll         # Enroll in course (auth)
DELETE /courses/:id/enroll         # Unenroll (auth)
GET    /courses/:id/enrollments    # View enrollments (owner only)
```

#### Notes
```http
GET    /courses/:id/notes          # List notes (enrolled + owner)
GET    /courses/:id/notes/:noteId  # Get note (enrolled + owner)
POST   /courses/:id/notes          # Create note (owner only)
PUT    /courses/:id/notes/:noteId  # Update note (owner only)
DELETE /courses/:id/notes/:noteId  # Delete note (owner only)
POST   /courses/:id/notes/:noteId/summarize  # AI summarize (enrolled + owner)
```

#### PDF Uploads
```http
POST   /courses/:id/notes/:noteId/pdf     # Upload PDF to note
GET    /pdfs/:filename                    # Download PDF
DELETE /pdfs/:id                          # Delete PDF
```

#### User Dashboard
```http
GET /user/dashboard    # User dashboard (auth)
```

### Search Parameters
```http
GET /courses?search=programming&category=Technology&sort=created_at&order=desc
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/courses
```

### Authentication Test
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@studybuddy.com", "password": "password"}'

# Use token for protected requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/user/dashboard
```

### Course Creation Test
```bash
curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Course", "description": "Test Description"}'
```

## 🔒 Security

### Authentication Flow
1. **Email/Password**: Traditional signup/login with bcrypt
2. **OAuth**: Google/GitHub social login
3. **JWT Tokens**: Secure session management
4. **Database-level**: Proper user validation

### Permission Levels
- **Public**: Browse courses, search
- **Authenticated**: Create courses, enroll, access content
- **Course Owner**: Full control over own courses

### Security Features
- **bcrypt password hashing** (not reversible)
- **JWT token validation** on all protected routes
- **OAuth state validation** prevents CSRF
- **CORS configuration** for frontend integration
- **Input sanitization** and validation
- **SQL injection prevention** with parameterized queries

## 📦 Project Structure

```
backend/
├── 📄 README.md                 # This file
├── 📄 package.json              # Dependencies and scripts
├── 📄 .env.example              # Environment template
├── 📄 .gitignore                # Git ignore rules
├── 
├── 📁 Database/
│   ├── 📄 postgresql-schema.sql # Complete database schema
│   └── 📄 database.js           # PostgreSQL client
│
├── 📁 Authentication/
│   ├── 📄 auth.js               # Auth middleware and functions
│   └── 📄 oauth.js              # OAuth service
│
├── 📁 API Servers/
│   ├── 📄 server.js             # Original SQLite version
│   └── 📄 server-final.js       # Final PostgreSQL version ⭐
│
└── 📁 Documentation/
    ├── 📄 SETUP-INSTRUCTIONS.md # Quick setup guide
    ├── 📄 PERMISSIONS-GUIDE.md  # Permission system guide
    └── 📄 OAUTH-SETUP.md        # OAuth configuration guide
```

## 🚀 Deployment

### Render Deployment (Recommended)
1. **Environment**: Set production environment variables
2. **Database**: Use Render PostgreSQL
3. **HTTPS**: Automatic SSL certificates
4. **Domain**: Custom domain support
5. **Process Manager**: Automatic process management

### render.yaml Configuration
```yaml
services:
  - type: web
    name: studybuddy-api
    runtime: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: your-postgres-db
          property: connectionString
  - type: pserv
    name: your-postgres-db
    plan: free
    databaseName: studybuddy
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

## 🔄 Migration Guide

### From SQLite to PostgreSQL
1. **Backup**: Export existing SQLite data
2. **Schema**: Run `postgresql-schema.sql`
3. **Data**: Migrate users and content
4. **Update**: Switch to `server-final.js`
5. **Test**: Verify all functionality

### Frontend Integration
Update frontend API calls to:
- Use new authentication endpoints
- Handle OAuth flow if implemented
- Update error handling for new response format

## 🛠️ Development

### Adding New Features
1. **Database**: Add tables/columns to schema
2. **Models**: Update database queries
3. **API**: Add endpoints in `server-final.js`
4. **Tests**: Add test cases
5. **Docs**: Update documentation

### Code Style
- **ESLint**: Configure for consistent code
- **Prettier**: Format code automatically
- **Comments**: Document complex logic
- **Error Handling**: Comprehensive error responses

### Debugging
```bash
# Enable debug logging
DEBUG=* npm start

# Check database connection
curl http://localhost:3000/courses
```

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Branch** for new features
3. **Test** thoroughly
4. **Document** changes
5. **Pull Request** with description

### Code Review Checklist
- [ ] Security implications considered
- [ ] Database queries optimized
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] Tests added/updated

## 📞 Support

### Common Issues
- **Database Connection**: Check PostgreSQL credentials
- **OAuth Errors**: Verify callback URLs
- **CORS Issues**: Update frontend URL in environment
- **JWT Errors**: Check token expiration and secret

### Debug Commands
```bash
# Check environment
npm run env-check

# Test database
npm run db-test

# Validate schema
npm run schema-check
```

### Getting Help
1. Check this README first
2. Review `PERMISSIONS-GUIDE.md` for permission issues
3. See `OAUTH-SETUP.md` for authentication problems
4. Check server logs for detailed errors

## 📄 License

MIT License - see LICENSE file for details.

---

## 🎯 Quick Reference for Other Agents

### To Start This Backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm start
```

### Key Files to Understand:
- `server-final.js` - Main API server ⭐
- `postgresql-schema.sql` - Database structure
- `database.js` - PostgreSQL client
- `auth.js` - Security middleware
- `.env.example` - Required environment variables

### Database Setup:
1. Create PostgreSQL database
2. Run `postgresql-schema.sql` 
3. Configure environment variables
4. Start server

### API Base: `http://localhost:3000`
### Health Check: `GET /courses`

This backend is ready for frontend integration and supports a complete learning platform with user management, course creation, enrollment, PDF uploads, and AI features.
