# Postman Import Instructions for StudyBuddy API

## 🚀 **Quick Import**

### **Method 1: Import from URL**
1. Open Postman
2. Click **"Import"** → **"Link"**
3. Paste this URL and click **"Continue"**:
   ```
   http://localhost:3000/collection
   ```

### **Method 2: Import from File**
1. Open Postman
2. Click **"Import"** → **"Upload Files"**
3. Select `StudyBuddy-API-Postman-Collection.json`
4. Click **"Import"**

## 🔐 **Authentication Setup**

### **Environment Variables**
After importing, create an environment:
1. Click **"Environments"** → **"Add"**
2. Name: `StudyBuddy Dev`
3. Add variables:
   - `baseUrl`: `http://localhost:3000`
   - `authToken`: `{{authToken}}`
4. Click **"Add"**
5. Select `StudyBuddy Dev` from dropdown

## 📋 **Testing Workflow**

### **Step 1: Authentication**
1. **Signup**: 
   - Request: `POST /auth/signup`
   - Body: `{"email":"test@example.com","password":"password123","fullName":"Test User"}`
   - Copy `token` from response
   - Set `authToken` environment variable

2. **Login**:
   - Request: `POST /auth/login`
   - Body: `{"email":"test@example.com","password":"password123"}`
   - Verify token is returned

3. **Get User**:
   - Request: `GET /auth/me`
   - Header: `Authorization: Bearer {{authToken}}`
   - Should return user data

### **Step 2: Courses**
1. **List Courses**: `GET /courses`
2. **Create Course**: `POST /courses`
3. **Get Course**: `GET /courses/1`
4. **Update Course**: `PUT /courses/1`
5. **Delete Course**: `DELETE /courses/1`

### **Step 3: Notes**
1. **List Notes**: `GET /courses/1/notes`
2. **Create Note**: `POST /courses/1/notes`
3. **Update Note**: `PUT /courses/1/notes/1`
4. **Delete Note**: `DELETE /courses/1/notes/1`
5. **AI Summarize**: `POST /courses/1/notes/1/summarize`

## 🎯 **Expected Results**

### **Success Responses**:
- **200 OK**: Successful GET/PUT/DELETE
- **201 Created**: Successful POST
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Missing/invalid token
- **404 Not Found**: Resource doesn't exist

### **Test Data**:
Use these for testing:
```json
{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User",
  "title": "Test Course",
  "description": "Test course description",
  "body": "Test note content"
}
```

## 📊 **Collection Structure**

The imported collection contains:
- **12 folders**: Authentication, Courses, Notes, AI Features
- **15 endpoints**: Complete API coverage
- **Environment variables**: baseUrl, authToken, courseId, noteId
- **Pre-configured requests**: With example data
- **Documentation**: Each endpoint has description

## 🔍 **Debugging Tips**

### **Common Issues**:
1. **401 Unauthorized**: Check `authToken` is set correctly
2. **404 Not Found**: Verify resource IDs exist
3. **400 Bad Request**: Check JSON syntax and required fields
4. **500 Internal Server**: Check backend logs

### **Response Validation**:
- Check status codes first
- Verify response structure matches documentation
- Test with missing/invalid data
- Check JWT token format

---

**🎉 Your StudyBuddy API is ready for comprehensive testing!**

Import the collection and start testing all endpoints systematically.
