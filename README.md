# Progress_Classes

## Database Setup (PostgreSQL)

This project uses PostgreSQL and includes:

- `schema.sql` → table definitions  
- `seed.sql` → sample data for testing  

## Steps to Load the Database

### 1. Create a database
```sql
CREATE DATABASE progress_classes;
```

### 2. Connect to the database:
```sql
\c progress_classes
```

### 3. Run the schema file:
```sql
\i schema.sql
```

### 4. Insert sample data:
```sql
\i seed.sql
```

After this, all tables and sample records will be available for use.
