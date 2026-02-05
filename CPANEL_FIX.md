# cPanel Fix: Backend Not Connecting + Missing .htaccess

## Quick Fix Steps

### 1. Add Root .htaccess (for SPA routing)

Create or edit **`public_html/.htaccess`** in cPanel File Manager:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api/
  RewriteRule ^ index.html [L]
</IfModule>
```

This makes `/admin`, `/lawyers`, `/login` work when you refresh the page.

---

### 2. Add Backend .htaccess

Create **`public_html/api/.htaccess`** (if your backend is in the `api` folder):

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

---

### 3. Verify Folder Structure

Your `public_html` should look like:

```
public_html/
├── .htaccess          ← Root .htaccess (Step 1)
├── index.html
├── assets/
├── favicon.svg
├── robots.txt
├── sitemap.xml
└── api/               ← Backend folder
    ├── .htaccess      ← Backend .htaccess (Step 2)
    ├── config.php
    ├── login.php
    ├── upload.php
    └── ... (all other PHP files)
```

---

### 4. Update config.php with cPanel Database

Edit **`public_html/api/config.php`** and set:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'youruser_dbuser');       // Your cPanel MySQL username
define('DB_PASS', 'your_password');         // Your cPanel MySQL password
define('DB_NAME', 'youruser_us_nepal_legal_db');  // Your cPanel database name
define('DB_PORT', 3306);  // cPanel uses 3306 (not 3308)
```

---

### 5. Create uploads Folder

Create **`public_html/api/uploads/`** and set permissions to **755** or **775**.

---

### 6. Test Backend

Open in browser: `https://yourdomain.com/api/site_settings.php`

You should see JSON (not an error page). If you see "Database connection failed", check your config.php credentials.

---

## If Backend is in a Different Folder

If you put the backend in `public_html/backend/` instead of `public_html/api/`:

1. Add the backend .htaccess to `public_html/backend/.htaccess`
2. Create `.env.production` before building: `VITE_API_URL=/backend`
3. Run `npm run build` again and re-upload the `dist` folder
