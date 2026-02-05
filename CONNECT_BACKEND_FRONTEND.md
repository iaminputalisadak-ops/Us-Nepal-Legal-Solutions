# Connect Backend & Frontend

## Quick Setup (5 steps)

### 1. Start XAMPP
- Open **XAMPP Control Panel**
- Start **Apache** (port 8080)
- Start **MySQL** (port 3308)

> If Apache uses port 80 instead of 8080, edit `vite.config.js` and set `BACKEND_PORT=80` or update the proxy target.

### 2. Copy Backend to XAMPP
Run this in Command Prompt (as Administrator if needed):
```batch
xcopy /E /Y "c:\Users\Ghost\Downloads\usnepallegalsolutions\backend" "C:\xampp\htdocs\backend\"
```
Or double-click: `COPY_BACKEND_AND_SETUP.bat`

### 3. Setup Database
1. Open **phpMyAdmin**: http://localhost:8080/phpmyadmin (or http://localhost/phpmyadmin)
2. Create database **usneppal** (if it doesn't exist)
3. Import `database/schema.sql` (Import tab)
4. Import `database/data_seed.sql` (for sample data)
5. **Fix admin password** (run in SQL tab):
   ```sql
   USE usneppal;
   UPDATE admins SET password = '$2y$10$eqF05ovfu/oqXjr.Rqqi6.jHoVC90PibiLvUV/P1BKJWlL5AodB2K' WHERE username = 'admin';
   ```
   Or run `database/fix_admin_password.sql`

### 4. Start Frontend
```bash
cd c:\Users\Ghost\Downloads\usnepallegalsolutions
npm install
npm run dev
```

### 5. Open the App
| URL | Purpose |
|-----|---------|
| http://localhost:5175 | Website |
| http://localhost:5175/admin | Admin login |
| http://localhost:5175/login | Login page |
| http://localhost:8080/backend/site_settings.php | Test backend (JSON) |

**Login:** `admin` / `admin123`

---

## How It Connects

```
┌─────────────────┐      /api/*       ┌─────────────────────┐      MySQL      ┌──────────┐
│  React (Vite)   │  ───────────────►  │  PHP Backend        │  ─────────────► │  usneppal │
│  localhost:5175 │   (Vite proxy)     │  localhost:8080/    │   port 3308     │  database │
└─────────────────┘                    │  backend/           │                 └──────────┘
                                       └─────────────────────┘
```

- Frontend calls `/api/login.php`, `/api/content_api.php`, etc.
- Vite proxies `/api` → `http://localhost:8080/backend`
- Backend connects to MySQL (port 3308) and database `usneppal`

---

## If Apache Uses Port 80 (Not 8080)

Create `.env.local` in project root:
```
BACKEND_PORT=80
```

Or set `VITE_API_URL=http://localhost/backend` to bypass the proxy (may need CORS).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Backend not found (404)" | Copy backend to `C:\xampp\htdocs\backend\`, start Apache |
| "Database connection failed" | Start MySQL, check port 3308 in `backend/config.php` |
| "Invalid JSON" | Backend returning HTML error; check PHP in browser |
| "Cannot connect to backend" | Restart Vite, ensure Apache is running |
| Login fails | Run `database/fix_admin_password.sql` in phpMyAdmin |
