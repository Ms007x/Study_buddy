require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { supabase, supabaseAdmin } = require('./supabase');
const { authenticateToken, requireEnrollment, requireInstructor } = require('./auth');
const oauthService = require('./oauth');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

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

// Store OAuth states in memory (in production, use Redis or database)
const oauthStates = new Map();

// OAUTH ENDPOINTS

// GET /auth/:provider - Initiate OAuth flow
app.get('/auth/:provider', (req, res) => {
  try {
    const { provider } = req.params;
    const state = oauthService.generateState();
    
    // Store state with timestamp
    oauthStates.set(state, {
      provider,
      timestamp: Date.now()
    });

    const redirectUri = `${BASE_URL}/auth/${provider}/callback`;
    const authUrl = oauthService.getAuthUrl(provider, redirectUri);
    
    res.redirect(authUrl);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    sendError(res, 'OAuth initiation failed', 500);
  }
});

// GET /auth/:provider/callback - OAuth callback
app.get('/auth/:provider/callback', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      console.error('OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/error?error=${error}`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/error?error=missing_parameters`);
    }

    // Verify state
    const storedState = oauthStates.get(state);
    if (!storedState || storedState.provider !== provider) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/error?error=invalid_state`);
    }

    // Clean up state
    oauthStates.delete(state);

    // Exchange code for token
    const redirectUri = `${BASE_URL}/auth/${provider}/callback`;
    const tokenData = await oauthService.exchangeCodeForToken(provider, code, redirectUri);
    
    // Get user info
    const userInfo = await oauthService.getUserInfo(provider, tokenData.access_token);
    
    // Create or update user in Supabase
    const userRecord = await oauthService.createOrUpdateUser(userInfo);
    
    // Create Supabase session for the user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userInfo.email,
      email_confirm: true,
      user_metadata: {
        full_name: userInfo.name,
        avatar_url: userInfo.avatar,
        provider: userInfo.provider
      }
    });

    let user = authData.user;
    
    if (authError && authError.message.includes('already registered')) {
      // User already exists, get them
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(userRecord.user_id);
      user = existingUser.user;
    } else if (authError) {
      console.error('Auth error:', authError);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/error?error=auth_failed`);
    }

    // Create JWT token
    const jwtToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        provider: userInfo.provider 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/success?token=${jwtToken}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: userInfo.name,
      avatar: userInfo.avatar,
      provider: userInfo.provider
    }))}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/error?error=callback_failed`);
  }
});

// POST /auth/oauth/token - Exchange OAuth token for JWT token (for SPA applications)
app.post('/auth/oauth/token', async (req, res) => {
  try {
    const { provider, accessToken } = req.body;
    
    if (!provider || !accessToken) {
      return sendError(res, 'Provider and access token are required');
    }

    // Get user info from OAuth provider
    const userInfo = await oauthService.getUserInfo(provider, accessToken);
    
    // Create or update user in Supabase
    const userRecord = await oauthService.createOrUpdateUser(userInfo);
    
    // Create JWT token
    const jwtToken = jwt.sign(
      { 
        id: userRecord.user_id, 
        email: userInfo.email,
        provider: userInfo.provider 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendResponse(res, {
      token: jwtToken,
      user: {
        id: userRecord.user_id,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.avatar,
        provider: userInfo.provider
      }
    });
  } catch (error) {
    console.error('OAuth token exchange error:', error);
    sendError(res, 'OAuth token exchange failed', 500);
  }
});

// AUTH ENDPOINTS

// POST /auth/signup - Sign up new user
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    if (!email || !password) {
      return sendError(res, 'Email and password are required');
    }

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0]
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return sendError(res, error.message, 400);
    }

    sendResponse(res, { user: data.user, session: data.session }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    sendError(res, 'Failed to sign up', 500);
  }
});

// POST /auth/login - Login user
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return sendError(res, 'Email and password are required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      return sendError(res, error.message, 400);
    }

    sendResponse(res, { user: data.user, session: data.session });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Failed to login', 500);
  }
});

// POST /auth/logout - Logout user
app.post('/auth/logout', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return sendError(res, 'Failed to logout', 500);
    }

    sendResponse(res, { message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    sendError(res, 'Failed to logout', 500);
  }
});

// GET /auth/me - Get current user
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    // Get user profile from user_profiles table
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return sendError(res, 'Failed to fetch user profile', 500);
    }

    sendResponse(res, { 
      user: {
        ...req.user,
        profile
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    sendError(res, 'Failed to get user', 500);
  }
});

// GET /auth/providers - Get available OAuth providers
app.get('/auth/providers', (req, res) => {
  const providers = [];
  
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push({
      name: 'google',
      displayName: 'Google',
      authUrl: `${BASE_URL}/auth/google`
    });
  }
  
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push({
      name: 'github',
      displayName: 'GitHub',
      authUrl: `${BASE_URL}/auth/github`
    });
  }

  sendResponse(res, { providers });
});

// COURSES ENDPOINTS

// GET /courses — list all public courses with search and enrollment status
app.get('/courses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, category, sort = 'created_at', order = 'desc' } = req.query;
    
    let query = supabase
      .from('courses')
      .select(`
        *,
        notes(count),
        enrollments!inner(user_id, enrolled_at),
        user_profiles!instructor_id(name, avatar)
      `);

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply category filter (if implemented)
    if (category) {
      query = query.eq('category', category);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    const { data: courses, error } = await query;

    if (error) {
      console.error('Error fetching courses:', error);
      return sendError(res, 'Failed to fetch courses', 500);
    }

    // Format response
    const formattedCourses = courses.map(course => ({
      ...course,
      note_count: course.notes[0]?.count || 0,
      is_enrolled: course.enrollments.some(e => e.user_id === userId),
      enrolled_at: course.enrollments.find(e => e.user_id === userId)?.enrolled_at,
      owner: course.user_profiles
    }));

    sendResponse(res, formattedCourses);
  } catch (error) {
    console.error('Courses error:', error);
    sendError(res, 'Failed to fetch courses', 500);
  }
});

// GET /courses/:id — get single course with details
app.get('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        notes(count),
        enrollments!inner(user_id, enrolled_at),
        user_profiles!instructor_id(name, avatar, email)
      `)
      .eq('id', id)
      .single();

    if (error || !course) {
      return sendError(res, 'Course not found', 404);
    }

    // Format response
    const formattedCourse = {
      ...course,
      note_count: course.notes[0]?.count || 0,
      is_enrolled: course.enrollments.some(e => e.user_id === userId),
      enrolled_at: course.enrollments.find(e => e.user_id === userId)?.enrolled_at,
      owner: course.user_profiles,
      is_owner: course.instructor_id === userId
    };

    sendResponse(res, formattedCourse);
  } catch (error) {
    console.error('Course error:', error);
    sendError(res, 'Failed to fetch course', 500);
  }
});

// POST /courses — create a course (any authenticated user)
app.post('/courses', authenticateToken, async (req, res) => {
  try {
    const { title, emoji, color, description, category } = req.body;
    const userId = req.user.id;
    
    if (!title) {
      return sendError(res, 'Title is required');
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        title,
        emoji: emoji || null,
        color: color || null,
        description: description || null,
        category: category || null,
        instructor_id: userId
      })
      .select(`
        *,
        user_profiles!instructor_id(name, avatar)
      `)
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return sendError(res, 'Failed to create course', 500);
    }

    sendResponse(res, data, 201);
  } catch (error) {
    console.error('Create course error:', error);
    sendError(res, 'Failed to create course', 500);
  }
});

// PUT /courses/:id — update a course (owner only)
app.put('/courses/:id', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, emoji, color, description, category } = req.body;
    
    const { data, error } = await supabase
      .from('courses')
      .update({
        title,
        emoji,
        color,
        description,
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        user_profiles!instructor_id(name, avatar)
      `)
      .single();

    if (error) {
      console.error('Error updating course:', error);
      return sendError(res, 'Failed to update course', 500);
    }

    sendResponse(res, data);
  } catch (error) {
    console.error('Update course error:', error);
    sendError(res, 'Failed to update course', 500);
  }
});

// DELETE /courses/:id — delete course (owner only)
app.delete('/courses/:id', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting course:', error);
      return sendError(res, 'Failed to delete course', 500);
    }

    sendResponse(res, { message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    sendError(res, 'Failed to delete course', 500);
  }
});

// ENROLLMENT ENDPOINTS

// POST /courses/:courseId/enroll — enroll in a course
app.post('/courses/:courseId/enroll', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, instructor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return sendError(res, 'Course not found', 404);
    }

    // Prevent course owner from enrolling in their own course
    if (course.instructor_id === userId) {
      return sendError(res, 'Cannot enroll in your own course', 400);
    }
    
    // Enroll user
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId
      })
      .select(`
        *,
        courses(id, title, emoji, color)
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return sendError(res, 'Already enrolled in this course', 400);
      }
      console.error('Error enrolling:', error);
      return sendError(res, 'Failed to enroll', 500);
    }

    sendResponse(res, data, 201);
  } catch (error) {
    console.error('Enroll error:', error);
    sendError(res, 'Failed to enroll', 500);
  }
});

// DELETE /courses/:courseId/enroll — unenroll from a course
app.delete('/courses/:courseId/enroll', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) {
      console.error('Error unenrolling:', error);
      return sendError(res, 'Failed to unenroll', 500);
    }

    sendResponse(res, { message: 'Unenrolled successfully' });
  } catch (error) {
    console.error('Unenroll error:', error);
    sendError(res, 'Failed to unenroll', 500);
  }
});

// GET /courses/:courseId/enrollments — get course enrollments (owner only)
app.get('/courses/:courseId/enrollments', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        user_profiles(name, avatar, email)
      `)
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      console.error('Error fetching enrollments:', error);
      return sendError(res, 'Failed to fetch enrollments', 500);
    }

    sendResponse(res, data);
  } catch (error) {
    console.error('Enrollments error:', error);
    sendError(res, 'Failed to fetch enrollments', 500);
  }
});

// NOTES ENDPOINTS

// GET /courses/:courseId/notes — list all notes in a course (enrolled users and owner)
app.get('/courses/:courseId/notes', authenticateToken, requireEnrollment, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return sendError(res, 'Failed to fetch notes', 500);
    }

    sendResponse(res, data);
  } catch (error) {
    console.error('Notes error:', error);
    sendError(res, 'Failed to fetch notes', 500);
  }
});

// GET /courses/:courseId/notes/:id — get single note (enrolled users and owner)
app.get('/courses/:courseId/notes/:id', authenticateToken, requireEnrollment, async (req, res) => {
  try {
    const { courseId, id } = req.params;
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('course_id', courseId)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching note:', error);
      return sendError(res, 'Note not found', 404);
    }

    // Track user viewing the note
    await supabase
      .from('user_note_history')
      .insert({
        user_id: req.user.id,
        note_id: id,
        action: 'viewed'
      });

    sendResponse(res, data);
  } catch (error) {
    console.error('Note error:', error);
    sendError(res, 'Failed to fetch note', 500);
  }
});

// POST /courses/:courseId/notes — create a note (owner only)
app.post('/courses/:courseId/notes', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, body, summary } = req.body;
    const userId = req.user.id;
    
    if (!title || !body) {
      return sendError(res, 'Title and body are required');
    }
    
    const { data, error } = await supabase
      .from('notes')
      .insert({
        course_id: courseId,
        title,
        body,
        summary: summary || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return sendError(res, 'Failed to create note', 500);
    }

    // Track note creation
    await supabase
      .from('user_note_history')
      .insert({
        user_id: userId,
        note_id: data.id,
        action: 'created'
      });

    sendResponse(res, data, 201);
  } catch (error) {
    console.error('Create note error:', error);
    sendError(res, 'Failed to create note', 500);
  }
});

// PUT /courses/:courseId/notes/:id — update a note (owner only)
app.put('/courses/:courseId/notes/:id', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const { courseId, id } = req.params;
    const { title, body, summary } = req.body;
    
    const { data, error } = await supabase
      .from('notes')
      .update({
        title,
        body,
        summary,
        updated_at: new Date().toISOString()
      })
      .eq('course_id', courseId)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      return sendError(res, 'Failed to update note', 500);
    }

    // Track note update
    await supabase
      .from('user_note_history')
      .insert({
        user_id: req.user.id,
        note_id: id,
        action: 'updated'
      });

    sendResponse(res, data);
  } catch (error) {
    console.error('Update note error:', error);
    sendError(res, 'Failed to update note', 500);
  }
});

// DELETE /courses/:courseId/notes/:id — delete a note (owner only)
app.delete('/courses/:courseId/notes/:id', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const { courseId, id } = req.params;
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('course_id', courseId)
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      return sendError(res, 'Failed to delete note', 500);
    }

    sendResponse(res, { message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    sendError(res, 'Failed to delete note', 500);
  }
});

// AI SUMMARY ENDPOINT

// POST /courses/:courseId/notes/:id/summarize — AI summarize note (enrolled users and owner)
app.post('/courses/:courseId/notes/:id/summarize', authenticateToken, requireEnrollment, async (req, res) => {
  try {
    const { courseId, id } = req.params;
    const userId = req.user.id;
    
    // Get the note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('course_id', courseId)
      .eq('id', id)
      .single();

    if (noteError || !note) {
      return sendError(res, 'Note not found', 404);
    }
    
    if (!note.body) {
      return sendError(res, 'Note body is empty');
    }
    
    // Use Google AI Studio (Gemini API) for summarization
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY || 'your_api_key_here';
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: `Please provide a concise summary of the following text in 1-2 sentences:\n\n${note.body}`
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      let summary = '';
      if (response.data && response.data.candidates && response.data.candidates[0] && 
          response.data.candidates[0].content && response.data.candidates[0].content.parts &&
          response.data.candidates[0].content.parts[0] && response.data.candidates[0].content.parts[0].text) {
        summary = response.data.candidates[0].content.parts[0].text.trim();
      } else {
        // Fallback: create a simple summary
        summary = note.body.substring(0, 200) + (note.body.length > 200 ? '...' : '');
      }
      
      // Update the note with the summary
      const { data: updatedNote, error: updateError } = await supabase
        .from('notes')
        .update({
          summary,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating note summary:', updateError);
        return sendError(res, 'Failed to update note summary', 500);
      }
      
      // Track AI summarization
      await supabase
        .from('user_note_history')
        .insert({
          user_id: userId,
          note_id: id,
          action: 'summarized',
          summary_generated: summary
        });
      
      sendResponse(res, updatedNote);
      
    } catch (apiError) {
      console.error('Google AI API Error:', apiError.message);
      // Fallback: create a simple summary
      const summary = note.body.substring(0, 200) + (note.body.length > 200 ? '...' : '');
      
      const { data: updatedNote, error: updateError } = await supabase
        .from('notes')
        .update({
          summary,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating note summary (fallback):', updateError);
        return sendError(res, 'Failed to update note summary', 500);
      }

      // Track fallback summarization
      await supabase
        .from('user_note_history')
        .insert({
          user_id: userId,
          note_id: id,
          action: 'summarized',
          summary_generated: summary
        });
      
      sendResponse(res, updatedNote);
    }
    
  } catch (error) {
    console.error('Summary error:', error);
    sendError(res, 'Failed to summarize note', 500);
  }
});

// USER DASHBOARD ENDPOINTS

// GET /user/dashboard — get user's dashboard data
app.get('/user/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's enrollments with course info
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses(id, title, emoji, color, notes(count))
      `)
      .eq('user_id', userId);

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return sendError(res, 'Failed to fetch dashboard data', 500);
    }

    // Get user's progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return sendError(res, 'Failed to fetch progress data', 500);
    }

    // Get user's recent activity
    const { data: history, error: historyError } = await supabase
      .from('user_note_history')
      .select(`
        *,
        notes(title, course_id),
        courses(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Error fetching history:', historyError);
      return sendError(res, 'Failed to fetch history data', 500);
    }

    // Get courses user owns
    const { data: ownedCourses, error: ownedError } = await supabase
      .from('courses')
      .select(`
        *,
        notes(count),
        enrollments(count),
        user_profiles(name, avatar)
      `)
      .eq('instructor_id', userId);

    if (ownedError) {
      console.error('Error fetching owned courses:', ownedError);
      return sendError(res, 'Failed to fetch owned courses', 500);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return sendError(res, 'Failed to fetch profile', 500);
    }

    sendResponse(res, {
      profile,
      enrollments: enrollments.map(e => ({
        ...e,
        course: {
          ...e.courses,
          note_count: e.courses.notes[0]?.count || 0
        }
      })),
      progress,
      recentActivity: history,
      ownedCourses: ownedCourses.map(c => ({
        ...c,
        note_count: c.notes[0]?.count || 0,
        enrollment_count: c.enrollments[0]?.count || 0
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    sendError(res, 'Failed to fetch dashboard data', 500);
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
  console.log(`StudyBuddy API with OAuth and new permissions running on port ${PORT}`);
  console.log(`OAuth callbacks will redirect to: ${BASE_URL}`);
  console.log('Features:');
  console.log('- All users can create courses');
  console.log('- Only course owners can modify/delete their courses');
  console.log('- Everyone can view and enroll in all courses');
  console.log('- Search functionality available');
});
