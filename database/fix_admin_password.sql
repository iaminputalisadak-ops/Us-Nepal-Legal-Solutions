-- Fix admin password: the old hash was for "password", not "admin123"
-- Run this in phpMyAdmin (usneppal database) if login with admin/admin123 fails.
-- After running, use: admin / admin123

USE us_nepal_legal_db;

UPDATE admins 
SET password = '$2y$10$eqF05ovfu/oqXjr.Rqqi6.jHoVC90PibiLvUV/P1BKJWlL5AodB2K' 
WHERE username = 'admin';
