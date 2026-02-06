# Fix "Backend not found (404)" on cPanel

## The Problem
The frontend expects the backend at the URL in `.env.production`. If you get 404, the backend is either missing or in the wrong folder.

**Current setup:** `.env.production` uses `VITE_API_URL=https://usnepallegalsolutions.com/backend`  
→ Backend must be in `public_html/backend/`

---

## Step-by-Step Fix

### 1. Check Your Folder Structure in cPanel File Manager

Your **`public_html`** must look like this:

```
public_html/
├── .htaccess
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── htaccess.txt
└── backend/                  ← BACKEND MUST BE HERE (matches .env.production)
    ├── .htaccess
    ├── config.php
    ├── login.php
    ├── verify_session.php
    ├── logout.php
    ├── site_settings.php
    ├── content_api.php
    ├── lawyers.php
    ├── consultations.php
    ├── upload.php
    ├── api-test.php
    └── uploads/              ← Create this folder (permissions: 755)
```

---

### 2. If You Prefer `api/` Instead of `backend/`

1. Edit `.env.production`: `VITE_API_URL=https://usnepallegalsolutions.com/api`
2. Run `npm run build`
3. In cPanel, put backend files in `public_html/api/` instead of `public_html/backend/`
4. Re-upload the new `dist/` folder

---

### 3. Upload Backend to backend/ Folder

1. In cPanel File Manager, go to `public_html/`
2. Create folder **`backend`** (if it doesn't exist)
3. Upload **all files** from your project's `backend/` folder into `public_html/backend/`
4. Create folder `public_html/backend/uploads/` and set permissions to **755**

---

### 4. Test Backend

Open these URLs in your browser:

1. **`https://usnepallegalsolutions.com/backend/api-test.php`**  
   - Should show: `{"success":true,"message":"Backend is working"}`

2. **`https://usnepallegalsolutions.com/backend/site_settings.php`**  
   - Should show JSON (database settings)

3. **`https://usnepallegalsolutions.com/backend/login.php`**  
   - Should show: `{"success":false,"message":"Invalid request method"}` (that's OK – it means the file is reachable)

If any of these return **404**, the `backend` folder or files are in the wrong place.

---

### 5. Create config.cpanel.php for Database

**Use config.cpanel.php (not config.local.php) on cPanel** – this won't get overwritten when you re-upload the backend.

1. In `public_html/backend/`, copy `config.cpanel.php.example` to `config.cpanel.php`
2. Edit `config.cpanel.php` with your cPanel MySQL user, password, database name
3. MySQL Databases → Add User To Database → grant ALL PRIVILEGES
4. Test: `https://usnepallegalsolutions.com/backend/db-check.php`

---

### 6. Rebuild and Re-upload Frontend

The project has `.env.production` with your domain. Run:

```bash
npm run build
```

Then upload the **entire contents** of the `dist/` folder to `public_html/` (overwrite existing files).

---

## Quick Checklist

- [ ] `public_html/backend/` folder exists
- [ ] All PHP files from `backend/` are inside `public_html/backend/`
- [ ] `public_html/backend/uploads/` exists (permissions 755)
- [ ] `https://usnepallegalsolutions.com/backend/api-test.php` returns JSON (not 404)
- [ ] `config.php` has correct cPanel database credentials
- [ ] Ran `npm run build` and re-uploaded `dist/` contents
