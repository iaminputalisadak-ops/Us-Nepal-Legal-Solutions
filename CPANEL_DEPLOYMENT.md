# cPanel Deployment Guide – US-NEPAL LEGAL SOLUTIONS

## Database Name
**`us_nepal_legal_db`**

On cPanel, the actual database name will usually be prefixed (e.g. `youruser_us_nepal_legal_db`).

---

## Step 1: Build the React App

On your computer:

```bash
cd c:\Users\Ghost\Downloads\usnepallegalsolutions
npm install
npm run build
```

This creates a `dist` folder with the built site.

---

## Step 2: Create Database in cPanel

1. Log in to **cPanel**
2. Open **MySQL® Databases**
3. Create a new database:
   - Name: `us_nepal_legal_db` (cPanel will add your username prefix)
   - Example result: `youruser_us_nepal_legal_db`
4. Create a database user and password
5. Add the user to the database with **ALL PRIVILEGES**
6. Note down:
   - Database name (with prefix)
   - Username (with prefix)
   - Password
   - Host: usually `localhost`

---

## Step 3: Import Database

1. In cPanel, open **phpMyAdmin**
2. Select your database (e.g. `youruser_us_nepal_legal_db`)
3. Go to **Import**
4. Import in this order:
   - `database/schema.sql`
   - `database/data_seed.sql`
5. Click **Go**

---

## Step 4: Upload Files via File Manager or FTP

### Option A: Same domain (recommended)

**Folder structure on server:**

```
public_html/
├── index.html          (from dist/)
├── assets/             (from dist/assets/)
├── favicon.svg         (from dist/)
├── robots.txt          (from dist/)
├── sitemap.xml         (from dist/)
└── api/                (entire backend folder contents)
    ├── config.php
    ├── login.php
    ├── .htaccess
    └── ... (all PHP files)
```

**Upload steps:**
1. Upload everything from `dist/` into `public_html/`
2. Create folder `public_html/api/`
3. Upload all files from `backend/` into `public_html/api/`
4. Create `public_html/api/uploads/` and set permissions to **755** or **775**

---

## Step 5: Update backend/config.php on Server

Edit `public_html/api/config.php` (or `public_html/backend/config.php` if you use that path) with your cPanel database details:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'youruser_dbuser');      // cPanel database username
define('DB_PASS', 'your_db_password');     // cPanel database password
define('DB_NAME', 'youruser_us_nepal_legal_db');  // cPanel database name
define('DB_PORT', 3306);  // cPanel uses 3306, not 3308
```

Update CORS to allow your domain:

```php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:5175', 'https://yourdomain.com', 'https://www.yourdomain.com'];
if (in_array($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
}
```

---

## Step 6: Set API URL for Production

If the backend is at `https://yourdomain.com/api/`, the frontend should call `/api/`. The build already uses `API_URL = "/api"` by default, so no change is needed if you use the structure above.

If the backend is at a different path (e.g. `/backend/`), create `.env.production` before building:

```
VITE_API_URL=https://yourdomain.com/backend
```

Then run `npm run build` again.

---

## Step 7: .htaccess Files (REQUIRED)

**Root .htaccess** – Create `public_html/.htaccess`:

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

**Backend .htaccess** – Create `public_html/api/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

> **Note:** The `public/` folder now includes `.htaccess` – it will be in `dist/` after build. Upload it to `public_html/` as `.htaccess`.

---

## Checklist

- [ ] `npm run build` completed
- [ ] Database created in cPanel
- [ ] `schema.sql` and `data_seed.sql` imported
- [ ] `dist/` contents uploaded to `public_html/`
- [ ] `backend/` contents uploaded to `public_html/api/`
- [ ] `config.php` updated with cPanel DB credentials
- [ ] `uploads/` folder created with write permissions
- [ ] `.htaccess` added for SPA routing

---

## Admin Login After Deployment

- **URL:** `https://yourdomain.com/admin`
- **Username:** `admin`
- **Password:** `admin123`

Change the password after first login.
