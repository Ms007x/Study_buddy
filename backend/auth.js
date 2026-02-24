const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('./database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const { rows } = await query(
      'SELECT id, email, full_name, avatar, provider FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is enrolled in course
const requireEnrollment = async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  try {
    // Check if course exists and get owner
    const { rows: courseRows } = await query(
      'SELECT id, owner_id FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseRows[0];

    // Allow if user is the course owner
    if (course.owner_id === userId) {
      req.isOwner = true;
      return next();
    }

    // Check enrollment
    const { rows: enrollmentRows } = await query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (enrollmentRows.length === 0) {
      return res.status(403).json({ error: 'Course enrollment required' });
    }

    req.isOwner = false;
    next();
  } catch (error) {
    console.error('Enrollment check error:', error);
    return res.status(500).json({ error: 'Failed to verify enrollment' });
  }
};

// Middleware to check if user is course owner
const requireOwner = async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  try {
    const { rows } = await query(
      'SELECT owner_id FROM courses WHERE id = $1',
      [courseId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (rows[0].owner_id !== userId) {
      return res.status(403).json({ error: 'Course owner access required' });
    }

    req.isOwner = true;
    next();
  } catch (error) {
    console.error('Owner check error:', error);
    return res.status(500).json({ error: 'Failed to verify course ownership' });
  }
};

// Helper functions for password hashing
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      provider: user.provider 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// User registration
const registerUser = async (email, password, fullName, provider = 'email', providerId = null) => {
  try {
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password for email registration
    let passwordHash = null;
    if (provider === 'email') {
      passwordHash = await hashPassword(password);
    } else {
      passwordHash = 'oauth_user_no_password';
    }

    // Create user
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name, provider, provider_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, full_name, avatar, provider, created_at`,
      [email, passwordHash, fullName, provider, providerId]
    );

    const user = rows[0];
    const token = generateToken(user);

    return { user, token };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// User login
const loginUser = async (email, password) => {
  try {
    const { rows } = await query(
      'SELECT id, email, password_hash, full_name, avatar, provider FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = rows[0];

    // For OAuth users, no password check needed
    if (user.provider !== 'email') {
      throw new Error('Please use OAuth login for this account');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Remove password hash from response
    delete user.password_hash;

    const token = generateToken(user);

    return { user, token };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// OAuth user login/create
const oauthLogin = async (userInfo) => {
  try {
    // Check if user exists
    const { rows } = await query(
      'SELECT id, email, full_name, avatar, provider FROM users WHERE email = $1 OR (provider = $2 AND provider_id = $3)',
      [userInfo.email, userInfo.provider, userInfo.id]
    );

    let user;
    if (rows.length > 0) {
      // User exists, update info if needed
      user = rows[0];
      await query(
        'UPDATE users SET full_name = $1, avatar = $2, updated_at = NOW() WHERE id = $3',
        [userInfo.name, userInfo.avatar, user.id]
      );
    } else {
      // Create new user
      const result = await registerUser(
        userInfo.email,
        null,
        userInfo.name,
        userInfo.provider,
        userInfo.id
      );
      user = result.user;
    }

    const token = generateToken(user);

    return { user, token };
  } catch (error) {
    console.error('OAuth login error:', error);
    throw error;
  }
};

// Get user profile
const getUserProfile = async (userId) => {
  try {
    const { rows } = await query(
      'SELECT id, email, full_name, avatar, provider, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) {
      throw new Error('User not found');
    }

    return rows[0];
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

// Update user profile
const updateUserProfile = async (userId, updates) => {
  try {
    const allowedFields = ['full_name', 'avatar'];
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(userId);

    const { rows } = await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, full_name, avatar, provider`,
      updateValues
    );

    if (rows.length === 0) {
      throw new Error('User not found');
    }

    return rows[0];
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

module.exports = {
  authenticateToken,
  requireEnrollment,
  requireOwner,
  hashPassword,
  verifyPassword,
  generateToken,
  registerUser,
  loginUser,
  oauthLogin,
  getUserProfile,
  updateUserProfile
};
