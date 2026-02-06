# LOCAL vs CPANEL – Clear Setup Guide

---

## LOCAL (XAMPP) – Your Computer

| What | Where / How |
|------|-------------|
| **Frontend** | `npm run dev` → opens http://localhost:5175 |
| **Backend** | Copy `backend/` → `C:\xampp\htdocs\backend\` |
| **Database** | MySQL on port **3308**, database `us_nepal_legal_db` |
| **API calls** | Vite proxies `/api` → `http://localhost:8080/backend` (dev only) |
| **config.php** | `DB_PORT = 3308`, `DB_NAME = us_nepal_legal_db` |

**Local URLs:**
- Site: http://localhost:5175
- Admin: http://localhost:5175/admin
- Backend test: http://localhost:8080/backend/login.php

---

## CPANEL (LIVE SERVER) – usnepallegalsolutions.com

| What | Where / How |
|------|-------------|
| **Frontend** | Upload `dist/` contents → `public_html/` |
| **Backend** | Upload `backend/` contents → `public_html/backend/` |
| **Database** | cPanel MySQL on port **3306**, your cPanel database |
| **API calls** | Frontend uses `https://usnepallegalsolutions.com/backend` (from .env.production) |
| **config.php** | Edit on server: `DB_PORT = 3306`, your cPanel DB credentials |

**Live URLs:**
- Site: https://usnepallegalsolutions.com
- Admin: https://usnepallegalsolutions.com/admin
- Backend test: https://usnepallegalsolutions.com/backend/api-test.php

---

## Quick Reference

| | LOCAL (XAMPP) | CPANEL (LIVE) |
|---|---------------|---------------|
| **Backend folder** | `C:\xampp\htdocs\backend\` | `public_html/backend/` |
| **MySQL port** | 3308 | 3306 |
| **Build for deploy** | Not needed | `npm run build` → upload `dist/` |
| **config.php** | Project copy (port 3308) | Server copy (port 3306, cPanel DB) |

---

## Rule of Thumb

- **Working on your PC** → Use XAMPP setup. Ignore cPanel.
- **Deploying to live site** → Use cPanel setup. Ignore XAMPP.

They are separate. Changes for one do not affect the other.
