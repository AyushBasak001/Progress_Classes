import { db } from '../utils/db.js';

export const fetchCoursesWithFaculty = async () => {
  const result = await db.query(`
    SELECT c.id, c.name, c.level,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', f.id,
          'first_name', f.first_name,
          'last_name', f.last_name
        )
        ORDER BY f.first_name
      ) FILTER (WHERE f.id IS NOT NULL),
      '[]'
    ) AS faculty
    FROM course c
    LEFT JOIN faculty_course fc ON fc.course_id = c.id
    LEFT JOIN faculty f ON f.id = fc.faculty_id
    GROUP BY c.id, c.name, c.level
    ORDER BY c.name ASC,
    CASE c.level
      WHEN 'beginner' THEN 1
      WHEN 'intermediate' THEN 2
      WHEN 'advanced' THEN 3
    END
  `);

  return result.rows;
};

export const fetchFacultyWithCourses = async () => {
  const result = await db.query(`
    SELECT f.id, f.first_name, f.last_name, f.qualification, f.date_joined,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', c.id,
          'name', c.name,
          'level', c.level
        )
        ORDER BY c.name,
        CASE c.level
          WHEN 'beginner' THEN 1
          WHEN 'intermediate' THEN 2
          WHEN 'advanced' THEN 3
        END
      ) FILTER (WHERE c.id IS NOT NULL),
      '[]'
    ) AS courses
    FROM faculty f
    LEFT JOIN faculty_course fc ON fc.faculty_id = f.id
    LEFT JOIN course c ON c.id = fc.course_id
    GROUP BY f.id, f.first_name, f.last_name, f.qualification, f.date_joined
    ORDER BY f.first_name, f.last_name
  `);

  return result.rows;
};
