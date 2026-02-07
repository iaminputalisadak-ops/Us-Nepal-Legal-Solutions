# Database Configuration – One File

All database credentials are stored in **one file**: `backend/config.db.php`

## Setup

1. Copy `backend/config.db.php.example` to `backend/config.db.php`
2. Edit `backend/config.db.php` and add your:
   - **DB_USER** – MySQL username
   - **DB_PASS** – MySQL password  
   - **DB_NAME** – Database name
   - **DB_PORT** – 3308 for local (XAMPP), 3306 for cPanel

## Used everywhere

These files use `config.db.php` via `config.php`:

- login.php, logout.php, verify_session.php
- site_settings.php, content_api.php, lawyers.php
- consultations.php, upload.php
- setup.php, setup_full.php
- run_seed.php, run_seed_cli.php, test_db.php
- db-check.php, login-test.php

You only ever edit `backend/config.db.php` for database settings.
