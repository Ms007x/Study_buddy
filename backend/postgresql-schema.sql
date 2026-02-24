-- StudyBuddy PostgreSQL Database Schema
-- Compatible with Render PostgreSQL and local PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    avatar TEXT,
    provider TEXT DEFAULT 'email',
    provider_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    emoji TEXT,
    color TEXT,
    description TEXT,
    category TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notes table with PDF support
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- User note history table
CREATE TABLE IF NOT EXISTS user_note_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    summary_generated TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    notes_completed INTEGER DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- PDF uploads table
CREATE TABLE IF NOT EXISTS pdf_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    extracted_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_courses_owner_id ON courses(owner_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_notes_course_id ON notes(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_user_note_history_user_id ON user_note_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_note_history_note_id ON user_note_history(note_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_pdf_uploads_user_id ON pdf_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_uploads_note_id ON pdf_uploads(note_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- Check if sample user exists
    SELECT id INTO sample_user_id FROM users WHERE email = 'demo@studybuddy.com';
    
    IF sample_user_id IS NULL THEN
        -- Create sample user
        INSERT INTO users (email, password_hash, full_name, provider)
        VALUES ('demo@studybuddy.com', '$2a$10$dummy.hash.for.demo', 'Demo User', 'email')
        RETURNING id INTO sample_user_id;
    END IF;
    
    -- Check if courses exist
    IF NOT EXISTS (SELECT 1 FROM courses LIMIT 1) THEN
        -- Insert sample courses
        INSERT INTO courses (title, emoji, color, description, category, owner_id) VALUES
        ('Computer Science Fundamentals', '💻', '#3B82F6', 'Learn the basics of computer science including data structures and algorithms', 'Programming', sample_user_id),
        ('Mathematics for Engineers', '🧮', '#10B981', 'Essential mathematics topics including calculus and linear algebra', 'Mathematics', sample_user_id),
        ('Web Development', '🌐', '#F59E0B', 'Modern web development with HTML, CSS, and JavaScript', 'Programming', sample_user_id),
        ('Data Science', '📊', '#8B5CF6', 'Introduction to data analysis, statistics, and machine learning', 'Data Science', sample_user_id);
    END IF;
    
    -- Check if notes exist
    IF NOT EXISTS (SELECT 1 FROM notes LIMIT 1) THEN
        -- Get course IDs
        INSERT INTO notes (course_id, title, body, summary) 
        SELECT 
            c.id,
            'Data Structures', 
            'Arrays, linked lists, stacks, and queues are fundamental data structures in computer science. Arrays provide O(1) access time, while linked lists offer efficient insertion and deletion.',
            'Fundamental data structures including arrays, linked lists, stacks, and queues with their time complexity characteristics.'
        FROM courses c WHERE c.title = 'Computer Science Fundamentals' LIMIT 1;
        
        INSERT INTO notes (course_id, title, body, summary) 
        SELECT 
            c.id,
            'Algorithms', 
            'Sorting algorithms like bubble sort, merge sort, and quick sort have different time and space complexities. Merge sort guarantees O(n log n) time complexity.',
            'Overview of sorting algorithms and their performance characteristics including time and space complexity.'
        FROM courses c WHERE c.title = 'Computer Science Fundamentals' LIMIT 1;
        
        INSERT INTO notes (course_id, title, body, summary) 
        SELECT 
            c.id,
            'Calculus', 
            'Derivatives measure the rate of change of a function. The power rule states that d/dx(x^n) = nx^(n-1). Integration is the reverse process.',
            'Introduction to derivatives and integrals, including the power rule for differentiation and the relationship between differentiation and integration.'
        FROM courses c WHERE c.title = 'Mathematics for Engineers' LIMIT 1;
        
        INSERT INTO notes (course_id, title, body, summary) 
        SELECT 
            c.id,
            'Linear Algebra', 
            'Matrices are rectangular arrays of numbers. Matrix multiplication is not commutative but is associative. Identity matrices serve as the multiplicative identity.',
            'Fundamentals of matrices, matrix multiplication properties, and the role of identity matrices in linear algebra.'
        FROM courses c WHERE c.title = 'Mathematics for Engineers' LIMIT 1;
    END IF;
END $$;

-- Create view for course statistics
CREATE OR REPLACE VIEW course_statistics AS
SELECT 
    c.id,
    c.title,
    c.category,
    c.owner_id,
    u.full_name as owner_name,
    COUNT(DISTINCT n.id) as note_count,
    COUNT(DISTINCT e.user_id) as enrollment_count,
    c.created_at
FROM courses c
LEFT JOIN users u ON c.owner_id = u.id
LEFT JOIN notes n ON c.id = n.course_id
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title, c.category, c.owner_id, u.full_name, c.created_at;

-- Create view for user dashboard
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    COUNT(DISTINCT CASE WHEN c.owner_id = u.id THEN c.id END) as owned_courses,
    COUNT(DISTINCT CASE WHEN e.user_id = u.id THEN e.course_id END) as enrolled_courses,
    COUNT(DISTINCT CASE WHEN n.course_id IN (SELECT course_id FROM enrollments WHERE user_id = u.id) THEN n.id END) as accessible_notes,
    u.created_at
FROM users u
LEFT JOIN courses c ON c.owner_id = u.id
LEFT JOIN enrollments e ON e.user_id = u.id
LEFT JOIN notes n ON n.course_id = c.id OR n.course_id = e.course_id
GROUP BY u.id, u.email, u.full_name, u.created_at;

-- Grant permissions (for local development)
-- In production, these will be managed by the application
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- Create function to search courses
CREATE OR REPLACE FUNCTION search_courses(search_term TEXT DEFAULT NULL, category_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    emoji TEXT,
    color TEXT,
    owner_name TEXT,
    note_count BIGINT,
    enrollment_count BIGINT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.emoji,
        c.color,
        u.full_name as owner_name,
        COUNT(DISTINCT n.id) as note_count,
        COUNT(DISTINCT e.user_id) as enrollment_count,
        c.created_at
    FROM courses c
    LEFT JOIN users u ON c.owner_id = u.id
    LEFT JOIN notes n ON c.id = n.course_id
    LEFT JOIN enrollments e ON c.id = e.course_id
    WHERE 
        (search_term IS NULL OR (c.title ILIKE '%' || search_term || '%' OR c.description ILIKE '%' || search_term || '%'))
        AND (category_filter IS NULL OR c.category = category_filter)
    GROUP BY c.id, c.title, c.description, c.category, c.emoji, c.color, u.full_name, c.created_at
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user activity
CREATE OR REPLACE FUNCTION get_user_activity(user_uuid UUID)
RETURNS TABLE (
    action_date TIMESTAMP,
    action_type TEXT,
    course_title TEXT,
    note_title TEXT,
    details TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.created_at as action_date,
        h.action as action_type,
        c.title as course_title,
        n.title as note_title,
        CASE 
            WHEN h.action = 'viewed' THEN 'Viewed note'
            WHEN h.action = 'created' THEN 'Created note'
            WHEN h.action = 'updated' THEN 'Updated note'
            WHEN h.action = 'summarized' THEN 'Generated AI summary'
            ELSE h.action
        END as details
    FROM user_note_history h
    LEFT JOIN notes n ON h.note_id = n.id
    LEFT JOIN courses c ON n.course_id = c.id
    WHERE h.user_id = user_uuid
    ORDER BY h.created_at DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Create function to update user progress
CREATE OR REPLACE FUNCTION update_user_progress(user_uuid UUID, course_uuid UUID)
RETURNS VOID AS $$
DECLARE
    completed_notes INTEGER;
BEGIN
    -- Count accessible notes for this user (owner or enrolled)
    SELECT COUNT(DISTINCT n.id) INTO completed_notes
    FROM notes n
    WHERE n.course_id = course_uuid
    AND (
        n.course_id IN (SELECT id FROM courses WHERE owner_id = user_uuid)
        OR
        EXISTS (SELECT 1 FROM enrollments e WHERE e.user_id = user_uuid AND e.course_id = course_uuid)
    );
    
    -- Update or insert progress
    INSERT INTO user_progress (user_id, course_id, notes_completed, last_accessed)
    VALUES (user_uuid, course_uuid, completed_notes, NOW())
    ON CONFLICT (user_id, course_id) 
    DO UPDATE SET 
        notes_completed = completed_notes,
        last_accessed = NOW();
END;
$$ LANGUAGE plpgsql;

-- Sample data summary
-- After running this schema, you will have:
-- 1 demo user: demo@studybuddy.com
-- 4 sample courses with different categories
-- 4 sample notes across the courses
-- Proper indexes and triggers for performance
-- Views for common queries
-- Functions for search and activity tracking

-- To verify installation:
-- SELECT * FROM users;
-- SELECT * FROM courses;
-- SELECT * FROM notes;
-- SELECT * FROM course_statistics;
-- SELECT * FROM user_dashboard;
