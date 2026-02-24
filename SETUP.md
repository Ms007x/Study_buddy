# StudyBuddy - Quick Setup Guide

## 🚀 **One-Command Setup**

```bash
# Clone and setup everything automatically
git clone <your-repo-url> studybuddy
cd studybuddy
npm run setup
npm run start
```

## 📋 **Manual Setup Steps**

### **1. Prerequisites**
- Node.js 16+ and npm 8+
- Git

### **2. Clone Repository**
```bash
git clone <your-repo-url> studybuddy
cd studybuddy
```

### **3. Install Dependencies**
```bash
# Install frontend and backend dependencies
npm run install:all
```

### **4. Environment Setup**
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration
```

### **5. Initialize Database**
```bash
npm run init-db
```

### **6. Start Development Servers**
```bash
# Start both frontend and backend
npm run start

# Or start individually:
npm run dev:backend  # Backend on port 3000-3010
npm run dev:frontend # Frontend on port 5175
```

## 🔧 **Configuration**

### **Backend Environment Variables (.env)**
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
AI_API_KEY=your-ai-service-api-key  # Optional for summarization
```

### **Frontend Environment Variables (.env)**
```env
VITE_API_URL=http://localhost:3000
```

## 🌐 **Access Points**

- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:3000
- **API Documentation**: Import `StudyBuddy-API-Postman-Collection.json`

## 📱 **Mobile Testing**

Resize browser to ≤768px width to test:
- Hamburger menu navigation
- Responsive layouts
- Touch-friendly interfaces

## 🧪 **Testing the Application**

### **1. Create Account**
- Go to http://localhost:5175
- Click "Sign up"
- Enter email, password, and full name

### **2. Create Course**
- Login and click "Add Course"
- Fill course details and learning path
- Save the course

### **3. Add Notes**
- Click "Go to Course" on your course
- Add notes with title and content
- Test AI summarization feature

### **4. Test Mobile View**
- Resize browser to mobile width
- Test hamburger menu
- Verify responsive layouts

## 🔍 **API Testing with Postman**

1. Open Postman
2. Import `StudyBuddy-API-Postman-Collection.json`
3. Set environment variables:
   - `baseUrl`: http://localhost:3000
   - `authToken`: Get from login response

## 🚨 **Troubleshooting**

### **Port Already in Use**
```bash
# Kill processes on ports 3000 and 5175
lsof -ti:3000 | xargs kill -9
lsof -ti:5175 | xargs kill -9
```

### **Database Issues**
```bash
# Reinitialize database
rm backend/studybuddy.db
npm run init-db
```

### **Permission Issues**
```bash
# macOS/Linux: Fix permissions
chmod +x scripts/start-dev.cjs
```

## 📊 **Project Structure**

```
studybuddy/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── context/           # React Context (Auth)
│   ├── services/          # API services
│   └── App.jsx            # Main App component
├── backend/               # Express backend
│   ├── server.js          # Main server file
│   ├── database-sqlite.js # Database operations
│   └── studybuddy.db      # SQLite database
├── scripts/               # Development scripts
├── docs/                  # Documentation
└── public/                # Static assets
```

## 🎯 **Next Steps**

1. **Explore Features**: Test all CRUD operations
2. **Mobile Testing**: Verify responsive design
3. **API Testing**: Use Postman collection
4. **Code Review**: Read through the documentation
5. **Deployment**: Prepare for production deployment

## 📞 **Support**

For issues:
1. Check console for error messages
2. Verify environment variables
3. Ensure all dependencies are installed
4. Review the troubleshooting section above

---

**Happy Coding! 🎉**
