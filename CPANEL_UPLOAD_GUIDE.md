# cPanel Upload Guide – US-Nepal Legal Solutions

## Step 1: Build the Frontend

Run in your project folder (Command Prompt or PowerShell):

```bash
npm run build
```

This creates the **`dist/`** folder (at project root) with all static files.

---

## Step 2: What to Upload to cPanel

### A. Frontend (React app)

Upload these files **from `dist/`** (project root folder) into **`public_html/`** (your website root):

| Upload FROM (dist/) | Upload TO (public_html/) |
|-----------------------------|---------------------------|
| index.html                  | index.html                |
| favicon.svg                 | favicon.svg               |
| robots.txt                  | robots.txt                |
| sitemap.xml                 | sitemap.xml               |
| assets/ (entire folder)     | assets/                   |
| .htaccess                   | .htaccess                 |

**If .htaccess is missing in dist/**, create it manually in `public_html/` with:

```
# Fix MIME type for JavaScript (prevents blank screen on cPanel)
<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/javascript .js .mjs
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api/
  RewriteCond %{REQUEST_URI} !^/backend/
  RewriteRule ^ index.html [L]
</IfModule>
```

### B. Backend (PHP API)

Upload the **`api/`** folder into **`public_html/api/`** so your site has:

```
public_html/
├── index.html
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── .htaccess
├── assets/                 ← Upload entire folder including .htaccess (fixes MIME type)
└── api/                    ← Upload entire api folder here
    ├── .htaccess
    ├── config.php
    ├── config.db.php       ← You CREATE this (see Step 3)
    ├── login.php
    ├── content_api.php
    ├── lawyers.php
    ├── consultations.php
    ├── site_settings.php
    ├── upload.php
    ├── verify_session.php
    ├── logout.php
    ├── diagnose.php
    ├── setup-database.php
    └── uploads/            ← Make sure this folder exists and is writable
```

---

## Step 3: Database Credentials (Username, Password, Database)

### Where to enter credentials

Create the file **`api/config.db.php`** on your server. Do **not** use `config.db.php.example` – that is only a template.

### How to create config.db.php

1. In cPanel, go to **File Manager** → `public_html/api/`
2. Create a new file: **`config.db.php`**
3. Paste this content and replace the values:

```php
<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_cpanel_mysql_username');   // ← Your cPanel MySQL username
define('DB_PASS', 'your_cpanel_mysql_password');   // ← Your cPanel MySQL password
define('DB_NAME', 'your_cpanel_database_name');    // ← Your cPanel database name
define('DB_PORT', 3306);                           // 3306 for cPanel (do not change)
```

### Where to get these values in cPanel

1. **MySQL Databases** (cPanel → Databases section)
2. Create a database (e.g. `username_usnepal`)
3. Create a MySQL user (e.g. `username_dbuser`) and set a password
4. Add the user to the database and grant **ALL PRIVILEGES**
5. Use:
   - **DB_USER** = the MySQL username (e.g. `username_dbuser`)
   - **DB_PASS** = the password you set
   - **DB_NAME** = the database name (e.g. `username_usnepal`)

### cPanel values summary

| Setting   | cPanel value                     |
|-----------|----------------------------------|
| DB_HOST   | `localhost`                      |
| DB_USER   | Your cPanel MySQL username       |
| DB_PASS   | Your cPanel MySQL password       |
| DB_NAME   | Your cPanel database name        |
| DB_PORT   | `3306`                           |

---

## Step 4: Import Database Schema

1. In cPanel → **phpMyAdmin**
2. Select your database
3. Go to **Import**
4. Choose `api/full_schema.sql` (or `database/schema.sql` + `database/data_seed.sql`)
5. Click **Go** to import

---

## Step 5: Make uploads Writable

1. Right‑click `public_html/api/uploads/` in File Manager
2. Choose **Change Permissions**
3. Set to **755** (or **775** if needed)
4. Ensure the folder is writable so image uploads work

---

## Checklist

- [ ] Run `npm run build`
- [ ] Upload `dist/*` (index.html, assets/, favicon.svg, robots.txt, sitemap.xml, .htaccess) to `public_html/`
- [ ] Upload `api/` folder to `public_html/api/`
- [ ] Create `api/config.db.php` with your cPanel MySQL credentials
- [ ] Import database schema via phpMyAdmin
- [ ] Set `api/uploads/` permissions to 755 or 775
- [ ] Test: `https://yoursite.com/api/diagnose.php` (should show DB status)
