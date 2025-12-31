-- =========================
-- Course table
-- Stores different courses offered by the institute
-- =========================
CREATE TABLE course (
  id VARCHAR(5) PRIMARY KEY,   -- short readable course ID (e.g. C101)
  name VARCHAR(50) NOT NULL,   -- course name
  level VARCHAR(20) NOT NULL,  -- difficulty level
  CHECK (level IN ('beginner','intermediate','advanced')),
  UNIQUE (name, level)         -- same course can exist at different levels
);

-- =========================
-- Faculty table
-- Stores faculty members information
-- =========================
CREATE TABLE faculty (
  id VARCHAR(5) PRIMARY KEY,   -- faculty ID (e.g. F001)
  first_name VARCHAR(40) NOT NULL,
  last_name VARCHAR(40) NOT NULL,
  qualification VARCHAR(100) NOT NULL,
  date_joined DATE NOT NULL
);

-- =========================
-- Faculty-Course mapping table
-- Many-to-many relationship between faculty and courses
-- =========================
CREATE TABLE faculty_course (
  faculty_id VARCHAR(5) NOT NULL,
  course_id  VARCHAR(5) NOT NULL,

  PRIMARY KEY (faculty_id, course_id),  -- prevents duplicate mappings

  CONSTRAINT fk_faculty         -- remove mappings if faculty is deleted
    FOREIGN KEY (faculty_id)
    REFERENCES faculty(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_course          -- remove mappings if course is deleted
    FOREIGN KEY (course_id)
    REFERENCES course(id)
    ON DELETE CASCADE
);

-- =========================
-- Enquiry table
-- Public Q&A system (no login required)
-- =========================
CREATE TABLE enquiry (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),        -- optional (anonymous allowed)
  question TEXT NOT NULL,
  answer TEXT,              -- NULL until answered by admin
  is_answered BOOLEAN DEFAULT false,   -- quick filter for admin
  is_visible BOOLEAN DEFAULT true,     -- moderation without deletion
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  answered_at TIMESTAMPTZ
);
