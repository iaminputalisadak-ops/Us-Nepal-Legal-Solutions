# Connect Database, Frontend & Backend

## Connection Flow

```
Frontend (React)          Backend (PHP)           Database (MySQL)
localhost:5175     →     localhost:8080/backend   →   localhost:3308
     │                           │                            │
     │  /api/* requests          │  getDBConnection()         │
     │  proxied by Vite    →     │  connects to MySQL    →    │  usneppal
     │                           │                            │
```

## Step-by-Step Setup

### 1. Start XAMPP Services

- Open **XAMPP Control Panel**
- Start **Apache** (port 8080)
- Start **MySQL** (port 3308)

### 2. Configure Apache Port (if needed)

- XAMPP → Apache → Config → `httpd.conf`
- Find `Listen 80` and change to `Listen 8080`
- Restart Apache

### 3. Configure MySQL Port (if needed)

- XAMPP → MySQL → Config → `my.ini`
- Find `port=3306` and change to `port=3308`
- Restart MySQL

### 4. Copy Backend to XAMPP

Copy your project's `backend` folder to:
```
C:\xampp\htdocs\backend\
```

### 5. Setup Database

1. Open **phpMyAdmin**: http://localhost:8080/phpmyadmin
2. Create database: **usneppal** (collation: utf8mb4_unicode_ci)
3. Import: `database/schema.sql` (Import tab)

### 6. Start Frontend

```bash
cd c:\Users\Ghost\Downloads\usnepallegalsolutions
npm run dev
```

### 7. Open Website

- **Frontend**: http://localhost:5175
- **Admin**: http://localhost:5175/admin (login: admin / admin123)
- **Backend API test**: http://localhost:8080/backend/site_settings.php

## Current Configuration

| Component | Port | Location |
|-----------|------|----------|
| Frontend | 5175 | Vite dev server |
| Backend | 8080 | C:\xampp\htdocs\backend\ |
| MySQL | 3308 | XAMPP MySQL |
| Database | - | usneppal |

## Troubleshooting

- **"Backend returned invalid JSON"** → Apache not running or backend not in htdocs
- **"Database connection failed"** → MySQL not running or wrong port (3308)
- **Blank /admin page** → Restart Vite (`npm run dev`)
