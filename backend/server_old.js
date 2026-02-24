const express = require('express');
const cors = require('cors');
const axios = require('axios');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to send responses
const sendResponse = (res, data, status = 200) => {
  res.status(status).json({ data });
};

const sendError = (res, message, status = 400) => {
  res.status(status).json({ error: message });
};

// COURTESY ENDPOINTS

// GET /courses — list all courses with note count
app.get('/courses', (req, res) => {
  try {
    const courses = db.prepare(`
      SELECT c.*, COUNT(n.id) as note_count
      FROM courses c
      LEFT JOIN notes n ON c.id = n.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `).all();
    sendResponse(res, courses);
  } catch (error) {
    sendError(res, 'Failed to fetch courses', 500);
  }
});

// POST /courses — create a course
app.post('/courses', (req, res) => {
  try {
    const { title, emoji, color } = req.body;
    
    if (!title) {
      return sendError(res, 'Title is required');
    }

    const stmt = db.prepare('INSERT INTO courses (title, emoji, color) VALUES (?, ?, ?)');
    const result = stmt.run(title, emoji || null, color || null);
    
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
    sendResponse(res, course, 201);
  } catch (error) {
    sendError(res, 'Failed to create course', 500);
  }
});

// PUT /courses/:id — update a course
app.put('/courses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, emoji, color } = req.body;
    
    const stmt = db.prepare('UPDATE courses SET title = ?, emoji = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(title, emoji, color, id);
    
    if (result.changes === 0) {
      return sendError(res, 'Course not found', 404);
    }
    
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
    sendResponse(res, course);
  } catch (error) {
    sendError(res, 'Failed to update course', 500);
  }
});

// DELETE /courses/:id — delete course + all its notes
app.delete('/courses/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM courses WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return sendError(res, 'Course not found', 404);
    }
    
    sendResponse(res, { message: 'Course and all its notes deleted successfully' });
  } catch (error) {
    sendError(res, 'Failed to delete course', 500);
  }
});

// NOTES ENDPOINTS

// GET /courses/:courseId/notes — list all notes in a course
app.get('/courses/:courseId/notes', (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if course exists
    const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId);
    if (!course) {
      return sendError(res, 'Course not found', 404);
    }
    
    const notes = db.prepare('SELECT * FROM notes WHERE course_id = ? ORDER BY created_at DESC').all(courseId);
    sendResponse(res, notes);
  } catch (error) {
    sendError(res, 'Failed to fetch notes', 500);
  }
});

// GET /courses/:courseId/notes/:id — get single note
app.get('/courses/:courseId/notes/:id', (req, res) => {
  try {
    const { courseId, id } = req.params;
    
    const note = db.prepare('SELECT * FROM notes WHERE course_id = ? AND id = ?').get(courseId, id);
    if (!note) {
      return sendError(res, 'Note not found', 404);
    }
    
    sendResponse(res, note);
  } catch (error) {
    sendError(res, 'Failed to fetch note', 500);
  }
});

// POST /courses/:courseId/notes — create a note
app.post('/courses/:courseId/notes', (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, body, summary } = req.body;
    
    if (!title || !body) {
      return sendError(res, 'Title and body are required');
    }
    
    // Check if course exists
    const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId);
    if (!course) {
      return sendError(res, 'Course not found', 404);
    }
    
    const stmt = db.prepare('INSERT INTO notes (course_id, title, body, summary) VALUES (?, ?, ?, ?)');
    const result = stmt.run(courseId, title, body, summary || null);
    
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    sendResponse(res, note, 201);
  } catch (error) {
    sendError(res, 'Failed to create note', 500);
  }
});

// PUT /courses/:courseId/notes/:id — update a note
app.put('/courses/:courseId/notes/:id', (req, res) => {
  try {
    const { courseId, id } = req.params;
    const { title, body, summary } = req.body;
    
    const stmt = db.prepare('UPDATE notes SET title = ?, body = ?, summary = ?, updated_at = CURRENT_TIMESTAMP WHERE course_id = ? AND id = ?');
    const result = stmt.run(title, body, summary, courseId, id);
    
    if (result.changes === 0) {
      return sendError(res, 'Note not found', 404);
    }
    
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    sendResponse(res, note);
  } catch (error) {
    sendError(res, 'Failed to update note', 500);
  }
});

// DELETE /courses/:courseId/notes/:id — delete a note
app.delete('/courses/:courseId/notes/:id', (req, res) => {
  try {
    const { courseId, id } = req.params;
    
    const stmt = db.prepare('DELETE FROM notes WHERE course_id = ? AND id = ?');
    const result = stmt.run(courseId, id);
    
    if (result.changes === 0) {
      return sendError(res, 'Note not found', 404);
    }
    
    sendResponse(res, { message: 'Note deleted successfully' });
  } catch (error) {
    sendError(res, 'Failed to delete note', 500);
  }
});

// AI SUMMARY ENDPOINT

// POST /courses/:courseId/notes/:id/summarize — AI summarize note
app.post('/courses/:courseId/notes/:id/summarize', async (req, res) => {
  try {
    const { courseId, id } = req.params;
    
    // Get the note
    const note = db.prepare('SELECT * FROM notes WHERE course_id = ? AND id = ?').get(courseId, id);
    if (!note) {
      return sendError(res, 'Note not found', 404);
    }
    
    if (!note.body) {
      return sendError(res, 'Note body is empty');
    }
    
    // Use Hugging Face Inference API (free tier)
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        { inputs: note.body },
        {
          headers: {
            'Authorization': 'Bearer hf_dummy', // You'll need to replace with actual token
            'Content-Type': 'application/json'
          }
        }
      );
      
      let summary = '';
      if (response.data && response.data[0] && response.data[0].summary_text) {
        summary = response.data[0].summary_text;
      } else {
        // Fallback: create a simple summary
        summary = note.body.substring(0, 200) + (note.body.length > 200 ? '...' : '');
      }
      
      // Update the note with the summary
      const updateStmt = db.prepare('UPDATE notes SET summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      updateStmt.run(summary, id);
      
      // Return the updated note
      const updatedNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
      sendResponse(res, updatedNote);
      
    } catch (apiError) {
      console.error('AI API Error:', apiError.message);
      // Fallback: create a simple summary
      const summary = note.body.substring(0, 200) + (note.body.length > 200 ? '...' : '');
      
      const updateStmt = db.prepare('UPDATE notes SET summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      updateStmt.run(summary, id);
      
      const updatedNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
      sendResponse(res, updatedNote);
    }
    
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
