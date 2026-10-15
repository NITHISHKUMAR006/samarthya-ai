-- ============================================================================
-- SAMARTHYA AI — Supabase (PostgreSQL) Database Schema
-- ============================================================================
-- Copy and paste this entire script directly into your Supabase Dashboard:
-- 1. Open your Supabase Project: https://supabase.com/dashboard
-- 2. Go to "SQL Editor" on the left menu
-- 3. Click "New Query", paste this SQL, and click "Run"
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Official Profiles Table
CREATE TABLE IF NOT EXISTS official_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(255) DEFAULT '',
    job_role VARCHAR(255) DEFAULT '',
    years_of_experience INTEGER DEFAULT 0,
    skills TEXT DEFAULT '[]',
    completed_training TEXT DEFAULT '[]',
    bio TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_official_profiles_user_id ON official_profiles(user_id);

-- 3. User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    courses_completed INTEGER DEFAULT 0,
    courses_in_progress INTEGER DEFAULT 0,
    quizzes_taken INTEGER DEFAULT 0,
    average_score FLOAT DEFAULT 0.0,
    total_learning_hours FLOAT DEFAULT 0.0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- 4. Competencies Table
CREATE TABLE IF NOT EXISTS competencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255) DEFAULT '',
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Official Competencies Table
CREATE TABLE IF NOT EXISTS official_competencies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    competency_id INTEGER NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    current_score FLOAT DEFAULT 0.0,
    required_score FLOAT DEFAULT 0.0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_official_competency UNIQUE (user_id, competency_id)
);

CREATE INDEX IF NOT EXISTS idx_official_competencies_user ON official_competencies(user_id);

-- 6. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    competency_area VARCHAR(255) DEFAULT '',
    difficulty VARCHAR(50) DEFAULT 'Beginner',
    duration_hours FLOAT DEFAULT 1.0,
    description TEXT DEFAULT '',
    provider VARCHAR(255) DEFAULT 'iGOT Karmayogi',
    is_igot BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_competency ON courses(competency_area);

-- 7. Learning Paths Table
CREATE TABLE IF NOT EXISTS learning_paths (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_user ON learning_paths(user_id);

-- 8. Learning Path Courses Table
CREATE TABLE IF NOT EXISTS learning_path_courses (
    id SERIAL PRIMARY KEY,
    learning_path_id INTEGER NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "order" INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'not_started',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_lpc_path ON learning_path_courses(learning_path_id);

-- 9. Learning Materials Table
CREATE TABLE IF NOT EXISTS learning_materials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER DEFAULT 0,
    extracted_text TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'uploaded',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_materials_user ON learning_materials(user_id);

-- 10. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    competency_area VARCHAR(255) DEFAULT '',
    material_id INTEGER NULL REFERENCES learning_materials(id) ON DELETE SET NULL,
    created_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    total_questions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option VARCHAR(1) NOT NULL,
    explanation TEXT DEFAULT '',
    question_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);

-- 12. Assessment Results Table
CREATE TABLE IF NOT EXISTS assessment_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    percentage FLOAT DEFAULT 0.0,
    answers TEXT DEFAULT '[]',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_results_user ON assessment_results(user_id);
