# Supported Formats & Capabilities - StudyBuddy

## 🚀 **Project Overview**

StudyBuddy is a full-stack learning management application built with modern web technologies. Here's what formats and capabilities we support:

## 📱 **Frontend Technologies**

### **React.js (v18+)**
- **File Extensions**: `.jsx`, `.js`, `.css`
- **Component Architecture**: Functional components with hooks
- **State Management**: React Context API
- **Routing**: Custom routing (no React Router)
- **Styling**: CSS with CSS variables
- **Build Tool**: Vite
- **Package Manager**: npm

### **UI Framework**
- **Responsive Design**: Mobile-first approach
- **Component Library**: Lucide React icons
- **CSS Framework**: Custom CSS with CSS Grid/Flexbox
- **Animation**: CSS transitions and keyframes

## 🔧 **Backend Technologies**

### **Node.js (v18+)**
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **API Style**: RESTful endpoints
- **File Upload**: Multer middleware
- **Environment**: dotenv configuration

### **Data Formats**
- **JSON**: API request/response format
- **SQL**: SQLite database queries
- **JWT**: Token-based authentication
- **Environment Variables**: .env configuration

## 📊 **Data Storage Formats**

### **Database Schema**
```sql
-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    emoji TEXT,
    color TEXT DEFAULT 'theme-blue',
    description TEXT,
    learning_path TEXT, -- JSON array stored as TEXT
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id)
);

-- Notes Table
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id)
);
```

### **API Response Format**
```json
{
  "data": {
    "id": 1,
    "title": "Course Title",
    "body": "Note content...",
    "summary": "AI-generated summary..."
  },
  "error": "Error message"
}
```

## 🔐 **Authentication Formats**

### **JWT Token Structure**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "iat": 1640995200,
  "exp": 1641601600
}
```

### **Environment Variables**
```env
# Server Configuration
PORT=3000
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5175

# Database
DATABASE_URL=sqlite:./studybuddy.db

# Authentication
JWT_SECRET=your-jwt-secret-key

# AI Services
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

## 📝 **File Formats**

### **Configuration Files**
- **`.env`**: Environment variables
- **`.env.example`**: Template configuration
- **`package.json`**: Dependencies and scripts
- **`vite.config.js`**: Build configuration

### **Data Files**
- **`studybuddy.db`**: SQLite database
- **`uploads/`**: File upload directory
- **`src/`**: React components and styles
- **`public/`**: Static assets

### **Export Formats**
- **Postman Collection**: JSON API documentation
- **Environment Export**: .env template
- **Database Export**: SQL schema dumps

## 🌐 **API Formats**

### **Request Formats**
```javascript
// POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// POST /courses
{
  "title": "Course Title",
  "description": "Course description",
  "learningPath": [
    {
      "id": 1,
      "day": "Day 1",
      "topic": "Topic Name"
    }
  ]
}
```

### **Response Formats**
```javascript
// Success Response
{
  "data": {
    "user": { "id": 1, "email": "..." },
    "token": "eyJ..."
  }
}

// Error Response
{
  "error": "Error message"
}

// List Response
{
  "data": [
    {
      "id": 1,
      "title": "Course Title",
      "note_count": 3
    }
  ]
}
```

## 🎨 **UI Component Formats**

### **Component Structure**
```jsx
// Functional Component with Hooks
const Component = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialState);
  
  return (
    <div className="component-wrapper">
      {/* JSX Content */}
    </div>
  );
};
```

### **CSS Architecture**
```css
/* CSS Variables */
:root {
  --primary-color: #3b82f6;
  --text-color: #1f2937;
  --border-radius: 8px;
}

/* Component Styles */
.component-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

## 🔧 **Development Formats**

### **Code Standards**
- **ESLint**: JavaScript/React linting
- **Prettier**: Code formatting
- **TypeScript**: Optional type checking
- **Git Hooks**: Pre-commit validation

### **Build Process**
```bash
# Development
npm run dev

# Production
npm run build
npm run preview
```

## 📱 **Mobile Formats**

### **Responsive Design**
- **Breakpoints**: 
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px
  - Desktop: 1024px+
- **Touch Targets**: 44px minimum touch targets
- **Viewport**: Mobile-first CSS approach

### **Progressive Enhancement**
- **Core Functionality**: Works without JavaScript
- **Enhanced Features**: JavaScript adds interactivity
- **Performance**: Optimized for mobile networks

## 🤖 **AI Integration Formats**

### **AI Service Integration**
```javascript
// Google Gemini API Integration
const response = await axios.post(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  {
    contents: [{
      parts: [{
        text: `Summarize: ${noteContent}`
      }]
    }]
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  }
);
```

### **Fallback System**
```javascript
// AI Summarization Fallback
if (apiError) {
  const sentences = noteBody.split('.').filter(s => s.trim().length > 0);
  const summary = sentences.slice(0, 2).join('. ') + 
    (sentences.length > 2 ? '...' : '');
  return summary;
}
```

## 📋 **Testing Formats**

### **Postman Collection**
```json
{
  "info": {
    "name": "StudyBuddy API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [...]
}
```

### **API Testing**
```bash
# Test Authentication
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test Protected Endpoint
curl -X GET http://localhost:3000/courses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 **Deployment Formats**

### **Environment Configuration**
```bash
# Production Environment
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# Development Environment
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5175
```

### **Docker Support**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
CMD ["npm", "start"]
```

## 📚 **Documentation Formats**

### **README Structure**
```markdown
# StudyBuddy

## Features
- 🔐 JWT Authentication
- 📚 Course Management
- 📝 Note Taking
- 🤖 AI Summarization
- 📱 Responsive Design

## Tech Stack
- **Frontend**: React 18, Vite, CSS3
- **Backend**: Node.js, Express, SQLite
- **AI**: Google Gemini API

## Quick Start
```bash
npm install
npm run dev
```

## API Endpoints
### Authentication
- `POST /auth/signup` - Create user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Courses
- `GET /courses` - List all courses
- `POST /courses` - Create course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Notes
- `GET /courses/:id/notes` - List notes
- `POST /courses/:id/notes` - Create note
- `PUT /courses/:id/notes/:id` - Update note
- `DELETE /courses/:id/notes/:id` - Delete note
- `POST /courses/:id/notes/:id/summarize` - AI summarize
```

## 🎯 **Current Capabilities**

✅ **Full CRUD Operations**: Create, Read, Update, Delete for courses and notes  
✅ **JWT Authentication**: Secure token-based authentication  
✅ **AI Integration**: Google Gemini API with fallback system  
✅ **Responsive Design**: Mobile-first, tablet and desktop support  
✅ **RESTful API**: Well-documented endpoints  
✅ **Modern Stack**: React 18, Node.js, SQLite  
✅ **Testing Ready**: Postman collection and test scripts  
✅ **Environment Config**: Development and production support  
✅ **File Upload**: Multer-based file handling  

## 🔄 **Format Compatibility**

### **Import/Export**
- **Data**: JSON, SQL, CSV
- **Configuration**: .env, JSON, YAML
- **Documentation**: Markdown, HTML, PDF
- **Code**: JavaScript, JSX, CSS, SQL

### **Browser Support**
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Works with JavaScript disabled

---

**🎉 StudyBuddy supports comprehensive modern web development formats and best practices!**

All formats are designed for:
- 🚀 **Developer Experience**: Clean, consistent, well-documented
- 🔧 **Maintainability**: Modular, testable, extensible
- 📱 **User Experience**: Responsive, accessible, performant
- 🛡️ **Security**: JWT-based, environment-separated
- 🚀 **Deployment**: Docker-ready, environment-configurable
