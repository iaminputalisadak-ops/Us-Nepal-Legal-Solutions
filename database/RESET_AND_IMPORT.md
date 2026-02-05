# Fix Empty Database - Reset and Import Data

Your database has corrupted/orphaned tablespace files. Follow these steps in **phpMyAdmin**:

## Step 1: Drop and recreate the database

1. Open phpMyAdmin: http://localhost:8080/phpmyadmin (or http://localhost/phpmyadmin)
2. Click **usneppal** in the left sidebar
3. Go to the **Operations** tab
4. Scroll to **Remove database** → Click **Drop the database (DROP)**
5. Confirm
6. Click **New** in the left sidebar to create a new database
7. Database name: **usneppal**
8. Collation: **utf8mb4_unicode_ci**
9. Click **Create**

## Step 2: Import the full schema

1. Click **usneppal** in the left sidebar
2. Go to the **Import** tab
3. Click **Choose File** and select: `database/schema.sql` from your project
4. Click **Go** at the bottom
5. Wait for "Import has been successfully finished"

## Step 3: Done

- Login at http://localhost:5175/admin with **admin** / **admin123**
- Your site will have all default data (lawyers, practice areas, etc.)
