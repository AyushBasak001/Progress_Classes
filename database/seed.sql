BEGIN;

-- =========================
-- Example Courses
-- =========================
INSERT INTO course (id, name, level) VALUES
('C101', 'Data Structures', 'beginner'),
('C102', 'Data Structures', 'intermediate'),
('C201', 'Algorithms', 'intermediate'),
('C301', 'Operating Systems', 'advanced');

-- =========================
-- Example Faculty
-- =========================
INSERT INTO faculty (id, first_name, last_name, qualification, date_joined) VALUES
('F001', 'Amit', 'Sharma', 'M.Tech Computer Science', '2021-07-01'),
('F002', 'Neha', 'Verma', 'PhD Computer Science', '2019-01-15'),
('F003', 'Rohit', 'Kumar', 'M.Tech Information Technology', '2022-06-10');

-- =========================
-- Example Faculty <-> Course mapping
-- =========================
INSERT INTO faculty_course (faculty_id, course_id) VALUES
('F001', 'C101'),
('F001', 'C102'),
('F002', 'C201'),
('F002', 'C301'),
('F003', 'C101');

-- =========================
-- Example Unanswered Enquiries
-- =========================
INSERT INTO enquiry (name, question) VALUES
('Rahul', 'Is Data Structures suitable for beginners?'),
(NULL, 'Do you provide weekend batches?');

-- =========================
-- Example Answered Enquiry
-- =========================
INSERT INTO enquiry (
  name,
  question,
  answer,
  is_answered,
  answered_at
) VALUES (
  'Sneha',
  'What is the duration of the Algorithms course?',
  'The Algorithms course runs for 12 weeks with weekly assignments.',
  true,
  CURRENT_TIMESTAMP
);

COMMIT;
