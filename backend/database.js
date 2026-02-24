const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', { text, error });
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        avatar TEXT,
        provider TEXT DEFAULT 'email',
        provider_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create courses table
    await query(`
      CREATE TABLE IF NOT EXISTS courses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        emoji TEXT,
        color TEXT,
        description TEXT,
        category TEXT,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create notes table
    await query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        summary TEXT,
        pdf_url TEXT,
        pdf_filename TEXT,
        pdf_size INTEGER,
        pdf_extracted_text TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create enrollments table
    await query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      )
    `);

    // Create user_note_history table
    await query(`
      CREATE TABLE IF NOT EXISTS user_note_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        summary_generated TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create user_progress table
    await query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        notes_completed INTEGER DEFAULT 0,
        last_accessed TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      )
    `);

    // Create pdf_uploads table
    await query(`
      CREATE TABLE IF NOT EXISTS pdf_uploads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        extracted_text TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_courses_owner_id ON courses(owner_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_notes_course_id ON notes(course_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_note_history_user_id ON user_note_history(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)`);

    // Insert sample data if tables are empty
    const courseCount = await query('SELECT COUNT(*) FROM courses');
    if (parseInt(courseCount.rows[0].count) === 0) {
      // Create a sample user first
      const sampleUser = await query(`
        INSERT INTO users (email, password_hash, full_name, provider)
        VALUES ('demo@studybuddy.com', '$2a$10$dummy.hash.for.demo', 'Demo User', 'email')
        RETURNING id
      `);

      const userId = sampleUser.rows[0].id;

      // Insert sample courses
      await query(`
        INSERT INTO courses (title, emoji, color, description, category, owner_id) VALUES
        ('Computer Science Fundamentals', '💻', '#3B82F6', 'Learn the basics of computer science including data structures and algorithms', 'Programming', $1),
        ('Mathematics for Engineers', '🧮', '#10B981', 'Essential mathematics topics including calculus and linear algebra', 'Mathematics', $1)
      `, [userId]);

      // Get the course IDs
      const courses = await query('SELECT id FROM courses ORDER BY created_at LIMIT 2');
      
      if (courses.rows.length >= 2) {
        const courseId1 = courses.rows[0].id;
        const courseId2 = courses.rows[1].id;

        // Insert sample notes
        await query(`
          INSERT INTO notes (course_id, title, body, summary) VALUES
          ($1, 'Data Structures', 'Arrays, linked lists, stacks, and queues are fundamental data structures in computer science. Arrays provide O(1) access time, while linked lists offer efficient insertion and deletion.', 'Fundamental data structures including arrays, linked lists, stacks, and queues with their time complexity characteristics.'),
          ($1, 'Algorithms', 'Sorting algorithms like bubble sort, merge sort, and quick sort have different time and space complexities. Merge sort guarantees O(n log n) time complexity.', 'Overview of sorting algorithms and their performance characteristics including time and space complexity.'),
          ($2, 'Calculus', 'Derivatives measure the rate of change of a function. The power rule states that d/dx(x^n) = nx^(n-1). Integration is the reverse process.', 'Introduction to derivatives and integrals, including the power rule for differentiation and the relationship between differentiation and integration.'),
          ($2, 'Linear Algebra', 'Matrices are rectangular arrays of numbers. Matrix multiplication is not commutative but is associative. Identity matrices serve as the multiplicative identity.', 'Fundamentals of matrices, matrix multiplication properties, and the role of identity matrices in linear algebra.')
        `, [courseId1, courseId2]);
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Graceful shutdown
const closePool = async () => {
  await pool.end();
  console.log('Database connection pool closed');
};

module.exports = {
  pool,
  query,
  transaction,
  initializeDatabase,
  closePool
};
