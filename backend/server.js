require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, get, run, initializeDatabase } = require('./database-sqlite');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'Access token required', 401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return sendError(res, 'Invalid or expired token', 401);
    }
    req.user = user;
    next();
  });
};

// Helper function to send responses
const sendResponse = (res, data, status = 200) => {
  res.status(status).json({ data });
};

const sendError = (res, message, status = 400) => {
  res.status(status).json({ error: message });
};

// AUTHENTICATION ENDPOINTS

// POST /auth/signup
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return sendError(res, 'Email, password, and full name are required');
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser) {
      return sendError(res, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await run(
      'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)',
      [email, hashedPassword, fullName]
    );

    const user = await get('SELECT id, email, full_name, created_at FROM users WHERE id = ?', [result.id]);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    sendResponse(res, { user, token }, 201);

  } catch (error) {
    console.error('Signup error:', error);
    sendError(res, 'Internal server error', 500);
  }
});

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required');
    }

    // Find user
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return sendError(res, 'Invalid email or password');
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return sendError(res, 'Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    sendResponse(res, { user: userWithoutPassword, token });

  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Internal server error', 500);
  }
});

// GET /auth/me
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await get('SELECT id, email, full_name, created_at FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendResponse(res, user);
  } catch (error) {
    console.error('Error fetching user:', error);
    sendError(res, 'Database error', 500);
  }
});

// POST /auth/logout
app.post('/auth/logout', (req, res) => {
  // In a stateless JWT setup, logout is handled client-side by removing the token
  sendResponse(res, { message: 'Logged out successfully' });
});

// GET /auth/providers
app.get('/auth/providers', (req, res) => {
  sendResponse(res, { providers: [] });
});

// COURTESY ENDPOINTS

// GET /courses — list all courses with note count (public view)
app.get('/courses', async (req, res) => {
  try {
    const courses = await query(`
      SELECT c.*, COUNT(n.id) as note_count,
             u.full_name as owner_name
      FROM courses c
      LEFT JOIN notes n ON c.id = n.course_id
      LEFT JOIN users u ON c.owner_id = u.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    // Parse learning_path JSON for each course
    const coursesWithParsedPath = courses.map(course => ({
      ...course,
      learning_path: course.learning_path ? JSON.parse(course.learning_path) : null
    }));

    sendResponse(res, coursesWithParsedPath);
  } catch (error) {
    console.error('Error fetching courses:', error);
    sendError(res, 'Failed to fetch courses', 500);
  }
});

// POST /courses — create a course
app.post('/courses', authenticateToken, async (req, res) => {
  try {
    const { title, emoji, color, description, learningPath } = req.body;

    if (!title) {
      return sendError(res, 'Title is required');
    }

    const result = await run(
      'INSERT INTO courses (title, emoji, color, owner_id, description, learning_path) VALUES (?, ?, ?, ?, ?, ?)',
      [title, emoji || null, color || null, req.user.id, description || null, learningPath ? JSON.stringify(learningPath) : null]
    );

    const course = await get('SELECT * FROM courses WHERE id = ?', [result.id]);
    sendResponse(res, course, 201);
  } catch (error) {
    console.error('Error creating course:', error);
    sendError(res, 'Failed to create course', 500);
  }
});

// PUT /courses/:id — update a course (owner only)
app.put('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, emoji, color, description, learningPath } = req.body;

    // First check if user owns the course
    const course = await get('SELECT * FROM courses WHERE id = ?', [id]);

    if (!course) {
      return sendError(res, 'Course not found', 404);
    }

    if (course.owner_id !== req.user.id) {
      return sendError(res, 'You can only edit your own courses', 403);
    }

    const result = await run(
      'UPDATE courses SET title = ?, emoji = ?, color = ?, description = ?, learning_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, emoji, color, description || null, learningPath ? JSON.stringify(learningPath) : null, id]
    );

    if (result.changes === 0) {
      return sendError(res, 'Course not found', 404);
    }

    const updatedCourse = await get('SELECT * FROM courses WHERE id = ?', [id]);
    // Parse learning_path JSON
    if (updatedCourse && updatedCourse.learning_path) {
      updatedCourse.learning_path = JSON.parse(updatedCourse.learning_path);
    }
    sendResponse(res, updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    sendError(res, 'Failed to update course', 500);
  }
});

// DELETE /courses/:id — delete course + all its notes (owner only)
app.delete('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if user owns the course
    const course = await get('SELECT * FROM courses WHERE id = ?', [id]);

    if (!course) {
      return sendError(res, 'Course not found', 404);
    }

    if (course.owner_id !== req.user.id) {
      return sendError(res, 'You can only delete your own courses', 403);
    }

    const result = await run('DELETE FROM courses WHERE id = ?', [id]);

    if (result.changes === 0) {
      return sendError(res, 'Course not found', 404);
    }

    sendResponse(res, { message: 'Course and all its notes deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    sendError(res, 'Failed to delete course', 500);
  }
});

// NOTES ENDPOINTS

// GET /courses/:courseId/notes — list all notes in a course
app.get('/courses/:courseId/notes', async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await get('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (!course) return sendError(res, 'Course not found', 404);

    const notes = await query(
      'SELECT * FROM notes WHERE course_id = ? ORDER BY created_at DESC',
      [courseId]
    );
    sendResponse(res, notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    sendError(res, 'Failed to fetch notes', 500);
  }
});

// GET /courses/:courseId/notes/:id — get single note
app.get('/courses/:courseId/notes/:id', async (req, res) => {
  try {
    const { courseId, id } = req.params;

    const note = await get(
      'SELECT * FROM notes WHERE course_id = ? AND id = ?',
      [courseId, id]
    );
    if (!note) return sendError(res, 'Note not found', 404);

    sendResponse(res, note);
  } catch (error) {
    console.error('Error fetching note:', error);
    sendError(res, 'Failed to fetch note', 500);
  }
});

// POST /courses/:courseId/notes — create a note
app.post('/courses/:courseId/notes', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, body, summary } = req.body;

    if (!title || !body) {
      return sendError(res, 'Title and body are required');
    }

    const course = await get('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (!course) return sendError(res, 'Course not found', 404);

    const result = await run(
      'INSERT INTO notes (course_id, title, body, summary) VALUES (?, ?, ?, ?)',
      [courseId, title, body, summary || null]
    );

    const note = await get('SELECT * FROM notes WHERE id = ?', [result.id]);
    sendResponse(res, note, 201);
  } catch (error) {
    console.error('Error creating note:', error);
    sendError(res, 'Failed to create note', 500);
  }
});

// PUT /courses/:courseId/notes/:id — update a note
app.put('/courses/:courseId/notes/:id', async (req, res) => {
  try {
    const { courseId, id } = req.params;
    const { title, body, summary } = req.body;

    const result = await run(
      'UPDATE notes SET title = ?, body = ?, summary = ?, updated_at = CURRENT_TIMESTAMP WHERE course_id = ? AND id = ?',
      [title, body, summary, courseId, id]
    );

    if (result.changes === 0) return sendError(res, 'Note not found', 404);

    const note = await get('SELECT * FROM notes WHERE id = ?', [id]);
    sendResponse(res, note);
  } catch (error) {
    console.error('Error updating note:', error);
    sendError(res, 'Failed to update note', 500);
  }
});

// DELETE /courses/:courseId/notes/:id — delete a note
app.delete('/courses/:courseId/notes/:id', async (req, res) => {
  try {
    const { courseId, id } = req.params;

    const result = await run(
      'DELETE FROM notes WHERE course_id = ? AND id = ?',
      [courseId, id]
    );

    if (result.changes === 0) return sendError(res, 'Note not found', 404);

    sendResponse(res, { message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    sendError(res, 'Failed to delete note', 500);
  }
});

// AI SUMMARY ENDPOINT

// POST /courses/:courseId/notes/:id/summarize — AI summarize note
app.post('/courses/:courseId/notes/:id/summarize', authenticateToken, async (req, res) => {
  try {
    const { courseId, id } = req.params;

    const note = await get(
      'SELECT * FROM notes WHERE course_id = ? AND id = ?',
      [courseId, id]
    );

    if (!note) return sendError(res, 'Note not found', 404);
    if (!note.body) return sendError(res, 'Note body is empty');

    let summary = '';

    // Use Google Gemini API for summarization
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        console.log('GOOGLE_AI_API_KEY not configured, using fallback summary');
        throw new Error('API key not configured');
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: `Please provide a concise summary of the following text in 2-3 sentences:\n\n${note.body}`
            }]
          }]
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000 // 30 second timeout
        }
      );

      summary =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        note.body.substring(0, 200) + (note.body.length > 200 ? '...' : '');
      
      console.log('AI summary generated successfully');
    } catch (apiError) {
      console.error('Gemini API error (using fallback):', apiError.message);
      // Fallback: create a simple summary
      const sentences = note.body.split('.').filter(s => s.trim().length > 0);
      summary = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '');
      
      if (summary.length > 200) {
        summary = summary.substring(0, 200) + '...';
      }
    }

    await run(
      'UPDATE notes SET summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [summary, id]
    );

    const updatedNote = await get('SELECT * FROM notes WHERE id = ?', [id]);
    sendResponse(res, updatedNote);
  } catch (error) {
    console.error('Summary error:', error);
    sendError(res, 'Failed to summarize note', 500);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  sendError(res, 'Internal server error', 500);
});

// 404 handler
app.use((req, res) => {
  sendError(res, 'Endpoint not found', 404);
});

app.listen(PORT, () => {
  console.log(`StudyBuddy API server running on port ${PORT}`);
});
