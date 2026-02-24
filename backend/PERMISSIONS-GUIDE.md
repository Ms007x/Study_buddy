# StudyBuddy Permission System Guide

## Overview

StudyBuddy implements a flexible permission system where:
- **All authenticated users** can create courses
- **Course owners** have full control over their courses
- **Everyone** can view and enroll in public courses
- **Enrolled students** can access course content

## Permission Levels

### 1. Public Access (No Authentication Required)
- View basic course information
- Search courses
- Browse course catalog

### 2. Authenticated Users
- Create courses
- Enroll in courses
- View enrolled course content
- Use AI summarization on enrolled courses

### 3. Course Owners
- Full control over their courses
- Create, update, delete their courses
- Manage notes within their courses
- View enrollment statistics
- Manage student enrollments

## Database Schema Changes

### Courses Table
```sql
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  emoji TEXT,
  color TEXT,
  description TEXT,
  category TEXT,
  instructor_id UUID REFERENCES auth.users(id), -- Course owner
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### RLS Policies

#### Course Access Policies
```sql
-- Anyone can view courses
CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  USING (true);

-- Authenticated users can create courses
CREATE POLICY "Authenticated users can create courses"
  ON courses FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only course owners can update their courses
CREATE POLICY "Course owners can update their own courses"
  ON courses FOR UPDATE
  USING (auth.uid() = instructor_id);

-- Only course owners can delete their courses
CREATE POLICY "Course owners can delete their own courses"
  ON courses FOR DELETE
  USING (auth.uid() = instructor_id);
```

## API Endpoints and Permissions

### Course Management

#### `GET /courses` - Public
- **Access**: Anyone (with optional authentication for enrollment status)
- **Description**: List all courses with search and filtering
- **Query Parameters**:
  - `search` - Search in title and description
  - `category` - Filter by category
  - `sort` - Sort field (created_at, title, updated_at)
  - `order` - Sort order (asc, desc)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Course Title",
      "description": "Course description",
      "emoji": "💻",
      "color": "#3B82F6",
      "category": "Programming",
      "note_count": 5,
      "is_enrolled": true,
      "enrolled_at": "2024-01-01T00:00:00Z",
      "owner": {
        "name": "John Doe",
        "avatar": "https://...",
        "email": "john@example.com"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `GET /courses/:id` - Public
- **Access**: Anyone (with optional authentication for enrollment status)
- **Description**: Get detailed course information

#### `POST /courses` - Authenticated Users
- **Access**: Any authenticated user
- **Description**: Create a new course
- **Request Body**:
```json
{
  "title": "New Course",
  "description": "Course description",
  "emoji": "📚",
  "color": "#10B981",
  "category": "Science"
}
```

#### `PUT /courses/:id` - Course Owner Only
- **Access**: Course owner only
- **Description**: Update course information

#### `DELETE /courses/:id` - Course Owner Only
- **Access**: Course owner only
- **Description**: Delete course and all associated data

### Enrollment System

#### `POST /courses/:courseId/enroll` - Authenticated Users
- **Access**: Any authenticated user (except course owner)
- **Description**: Enroll in a course
- **Restrictions**: Course owners cannot enroll in their own courses

#### `DELETE /courses/:courseId/enroll` - Authenticated Users
- **Access**: Enrolled students only
- **Description**: Unenroll from a course

#### `GET /courses/:courseId/enrollments` - Course Owner Only
- **Access**: Course owner only
- **Description**: View all enrollments in the course

### Notes Management

#### `GET /courses/:courseId/notes` - Enrolled Students + Owner
- **Access**: Course owner and enrolled students
- **Description**: List all notes in a course

#### `POST /courses/:courseId/notes` - Course Owner Only
- **Access**: Course owner only
- **Description**: Create a new note

#### `PUT /courses/:courseId/notes/:id` - Course Owner Only
- **Access**: Course owner only
- **Description**: Update a note

#### `DELETE /courses/:courseId/notes/:id` - Course Owner Only
- **Access**: Course owner only
- **Description**: Delete a note

### AI Features

#### `POST /courses/:courseId/notes/:id/summarize` - Enrolled Students + Owner
- **Access**: Course owner and enrolled students
- **Description**: Generate AI summary for a note

## Search and Filtering

### Course Search
```http
GET /courses?search=programming&category=Technology&sort=created_at&order=desc
```

### Search Features
- **Text Search**: Search in course title and description
- **Category Filter**: Filter by course category
- **Sorting**: Sort by creation date, title, or last update
- **Pagination**: Can be implemented with limit/offset

### Search Response Enhancement
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Programming Fundamentals",
      "description": "Learn basic programming concepts",
      "category": "Technology",
      "note_count": 10,
      "enrollment_count": 25,
      "is_enrolled": false,
      "owner": {
        "name": "Jane Smith",
        "avatar": "https://..."
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

## User Dashboard

### `GET /user/dashboard` - Authenticated Users
- **Access**: Authenticated users
- **Description**: Get comprehensive user dashboard

**Response**:
```json
{
  "data": {
    "profile": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://...",
      "provider": "google"
    },
    "enrollments": [
      {
        "id": "uuid",
        "enrolled_at": "2024-01-01T00:00:00Z",
        "course": {
          "id": "uuid",
          "title": "Course Title",
          "emoji": "💻",
          "note_count": 5
        }
      }
    ],
    "ownedCourses": [
      {
        "id": "uuid",
        "title": "My Course",
        "note_count": 10,
        "enrollment_count": 25
      }
    ],
    "progress": [
      {
        "course_id": "uuid",
        "notes_completed": 3,
        "last_accessed": "2024-01-01T00:00:00Z"
      }
    ],
    "recentActivity": [
      {
        "action": "viewed",
        "note_id": "uuid",
        "created_at": "2024-01-01T00:00:00Z",
        "notes": {
          "title": "Note Title"
        },
        "courses": {
          "title": "Course Title"
        }
      }
    ]
  }
}
```

## Security Features

### Row Level Security (RLS)
- **Database-level security** for all data access
- **Automatic enforcement** of permission rules
- **No bypass possible** at application level

### Authentication Middleware
- **JWT token validation** for all protected endpoints
- **User context injection** for permission checks
- **Automatic token refresh** support

### Permission Checks
- **Course ownership verification** for modification operations
- **Enrollment status verification** for content access
- **Role-based access control** throughout the application

## Use Cases

### 1. Student Journey
1. **Browse courses** without authentication
2. **Sign up/Login** with email or OAuth
3. **Search and enroll** in interesting courses
4. **Access course content** (notes, AI summaries)
5. **Track progress** through dashboard

### 2. Instructor Journey
1. **Create account** and authenticate
2. **Create courses** on any topic
3. **Add notes and content** to courses
4. **Manage enrollments** and track student progress
5. **Update course information** as needed

### 3. Mixed Role Users
1. **Create and own** some courses
2. **Enroll as student** in other courses
3. **Switch between** owner and student roles
4. **Comprehensive dashboard** showing all activities

## Implementation Examples

### Frontend Course List Component
```jsx
const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [search]);

  const fetchCourses = async () => {
    const token = localStorage.getItem('token');
    const url = `/courses?search=${search}`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await fetch(url, { headers });
    const data = await response.json();
    setCourses(data.data);
  };

  const handleEnroll = async (courseId) => {
    await fetch(`/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchCourses(); // Refresh list
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {courses.map(course => (
        <div key={course.id}>
          <h3>{course.emoji} {course.title}</h3>
          <p>{course.description}</p>
          <p>By {course.owner.name}</p>
          <p>{course.note_count} notes</p>
          {user && !course.is_enrolled && course.instructor_id !== user.id && (
            <button onClick={() => handleEnroll(course.id)}>
              Enroll
            </button>
          )}
          {course.is_enrolled && <span>✓ Enrolled</span>}
        </div>
      ))}
    </div>
  );
};
```

### Course Creation Component
```jsx
const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '📚',
    color: '#3B82F6',
    category: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      // Course created successfully
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Course Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />
      <textarea
        placeholder="Course Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <input
        type="text"
        placeholder="Category"
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      />
      <button type="submit">Create Course</button>
    </form>
  );
};
```

## Testing the Permission System

### Test Cases

1. **Unauthenticated Access**:
   - ✅ Can view course list
   - ✅ Can search courses
   - ❌ Cannot create courses
   - ❌ Cannot enroll in courses

2. **Authenticated User**:
   - ✅ Can create courses
   - ✅ Can enroll in courses
   - ✅ Can access enrolled course content
   - ❌ Cannot modify others' courses

3. **Course Owner**:
   - ✅ Can modify own courses
   - ✅ Can manage enrollments
   - ✅ Can create/update/delete notes
   - ❌ Cannot modify others' courses

### API Testing Examples

```bash
# Test public course access
curl http://localhost:3000/courses

# Test course creation (requires auth)
curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Course", "description": "Test Description"}'

# Test enrollment
curl -X POST http://localhost:3000/courses/COURSE_ID/enroll \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test unauthorized course modification (should fail)
curl -X PUT http://localhost:3000/courses/OTHER_COURSE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hacked Title"}'
```

## Migration from Previous System

### Key Changes
1. **Terminology**: "Instructor" → "Course Owner"
2. **Permissions**: All users can create courses
3. **Access**: Public course browsing
4. **Search**: Enhanced course discovery

### Database Updates
Run the updated `supabase-schema.sql` to apply new RLS policies and triggers.

### Code Updates
- Update middleware to use `isOwner` instead of `isInstructor`
- Update error messages to reflect new terminology
- Add search functionality to frontend
- Update course creation flows

This permission system provides a flexible and secure foundation for the StudyBuddy platform, allowing users to both learn and teach while maintaining proper data security and access control.
