-- Update contact phone to new number (run this in phpMyAdmin if you have existing data)
UPDATE site_settings SET setting_value = '+1 (785) 506-3402' WHERE setting_key = 'contact_phone';
