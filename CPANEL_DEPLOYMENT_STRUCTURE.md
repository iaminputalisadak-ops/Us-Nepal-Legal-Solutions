# cPanel Deployment Structure

This project uses the structure you requested:

```
my-website/
│
├── frontend/                      ← React App
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.svg
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Navbar.jsx (optional)
│   │   │   ├── ContentManager.jsx
│   │   │   ├── LawyersManagement.jsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.jsx (in App.jsx)
│   │   │   ├── About.jsx (in App.jsx)
│   │   │   └── Contact.jsx (in App.jsx)
│   │   ├── services/
│   │   │   └── api.js             ← ALL API calls here
│   │   ├── config.js              ← API URL defined here
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
│
├── api/                            ← PHP Backend (NOT "backend" folder)
│   ├── config.php                  ← DB connection
│   ├── config.db.php.example       ← Copy to config.db.php with your credentials
│   ├── login.php                   ← Admin login
│   ├── content_api.php             ← Content CRUD
│   ├── lawyers.php
│   ├── consultations.php
│   ├── site_settings.php
│   ├── upload.php
│   ├── verify_session.php
│   ├── test.php                    ← Test DB connection (alias for diagnose.php)
│   └── .htaccess                   ← CORS handling
│
└── .htaccess                       ← React router fix
```

## What Goes on cPanel (public_html/)

After `npm run build` (run from project root or `cd frontend && npm run build`), upload like this:

```
public_html/                        ← YOUR WEBSITE ROOT
│
├── index.html                      ← From frontend/dist/
├── favicon.svg                     ← From frontend/dist/
├── robots.txt                      ← From frontend/dist/
├── sitemap.xml                     ← From frontend/dist/
├── .htaccess                       ← From root .htaccess (React SPA routing)
├── assets/                         ← From frontend/dist/assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
│
└── api/                            ← Upload your PHP files here
    ├── .htaccess
    ├── config.php
    ├── config.db.php               ← Create from config.db.php.example
    ├── login.php
    ├── content_api.php
    ├── lawyers.php
    ├── consultations.php
    ├── site_settings.php
    ├── upload.php
    ├── verify_session.php
    ├── test.php
    ├── diagnose.php
    └── uploads/                    ← Writable folder for image uploads
```

## Local Development

1. Copy `api/` to `C:\xampp\htdocs\api\` (or your Apache document root)
2. Create `api/config.db.php` from `config.db.php.example`
3. Run `npm run dev` (from project root) or `cd frontend && npm run dev`
4. Open http://localhost:5175 - Vite proxies `/api` to `http://localhost:8080/api`

## API URL Configuration

- **Production**: `config.js` uses `window.location.origin + "/api"` for usnepallegalsolutions.com
- **Local**: Uses `/api` (proxied by Vite to Apache)
