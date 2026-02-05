# 🔧 Troubleshooting Guide - Network Error Fix

## ❌ Error: "Network error. Please check if PHP backend is running."

This error means your React app cannot connect to the PHP backend. Follow these steps:

---

## ✅ STEP-BY-STEP FIX:

### 1. **Check XAMPP is Running**
   - Open **XAMPP Control Panel**
   - Make sure **Apache** is running (green)
   - Make sure **MySQL** is running (green)
   - If not running, click **Start** for both

### 2. **Verify Backend Folder Location**
   The backend folder MUST be in:
   ```
   C:\xampp\htdocs\backend\
   ```

   **To fix:**
   - Copy the entire `backend` folder from your project
   - Paste it to: `C:\xampp\htdocs\backend\`
   - Make sure these files exist:
     - `C:\xampp\htdocs\backend\config.php`
     - `C:\xampp\htdocs\backend\login.php`
     - `C:\xampp\htdocs\backend\content_api.php`
     - etc.

### 3. **Test Backend is Working**
   Open in browser:
   ```
   http://localhost/backend/login.php
   ```
   
   **Expected result:**
   - Should show JSON response (even if it's an error, that's OK - means PHP is working)
   - If you see "404 Not Found" → Backend folder is in wrong location
   - If page doesn't load → Apache is not running

### 4. **Check Database Connection**
   - Open: `C:\xampp\htdocs\backend\config.php`
   - Verify these settings:
     ```php
     define('DB_HOST', 'localhost');
     define('DB_USER', 'root');
     define('DB_PASS', '');  // Your MySQL password if you set one
     define('DB_NAME', 'usnepallegalsolu_db');
     ```
   - If MySQL has a password, update `DB_PASS`

### 5. **Verify Database Exists**
   - Open: http://localhost/phpmyadmin
   - Check if database `usnepallegalsolu_db` exists
   - If not, import `database/schema.sql`

### 6. **Check CORS Settings**
   - Open: `C:\xampp\htdocs\backend\config.php`
   - Make sure CORS headers include your React port:
     ```php
     header('Access-Control-Allow-Origin: http://localhost:5175');
     header('Access-Control-Allow-Origin: http://localhost:5176');
     ```
   - Add your port if different (check terminal for actual port)

### 7. **Restart Services**
   - In XAMPP: Stop Apache, then Start again
   - Restart React dev server: Press `Ctrl+C`, then `npm run dev`

---

## 🧪 QUICK TEST:

1. **Test Backend:**
   ```
   http://localhost/backend/login.php
   ```
   Should return JSON (even if error)

2. **Test Database:**
   ```
   http://localhost/phpmyadmin
   ```
   Should open phpMyAdmin

3. **Test React:**
   ```
   http://localhost:5175
   ```
   Should show homepage

---

## 📋 CHECKLIST:

- [ ] XAMPP Apache is running (green)
- [ ] XAMPP MySQL is running (green)
- [ ] Backend folder is in `C:\xampp\htdocs\backend\`
- [ ] `http://localhost/backend/login.php` returns JSON
- [ ] Database `usnepallegalsolu_db` exists in phpMyAdmin
- [ ] React dev server is running (`npm run dev`)
- [ ] CORS headers match your React port

---

## 🆘 STILL NOT WORKING?

**Check Browser Console:**
- Press `F12` → Console tab
- Look for specific error messages
- Common errors:
  - `CORS policy` → Update CORS in config.php
  - `Failed to fetch` → Backend not accessible
  - `404` → Wrong backend URL

**Check Terminal:**
- React dev server should show: `Local: http://localhost:XXXX`
- Note the port number and update CORS if needed

**Check XAMPP Logs:**
- Click "Logs" button next to Apache in XAMPP
- Look for error messages

---

## 💡 COMMON SOLUTIONS:

### Port Mismatch
If React is on port 5176 but CORS allows 5175:
- Update `config.php` CORS headers
- Or restart React to get port 5175

### Apache Port Conflict
If Apache won't start:
- Port 80 might be in use
- Change Apache port in XAMPP config
- Update backend URL in React `config.js`

### Permission Issues
- Run XAMPP as Administrator
- Check folder permissions for `htdocs\backend\`

---

## ✅ SUCCESS INDICATORS:

When everything works:
- ✅ `http://localhost/backend/login.php` shows JSON
- ✅ Login page doesn't show network error
- ✅ You can login with admin/admin123
- ✅ Admin dashboard loads successfully

---

Need more help? Check the error message in browser console (F12) for specific details!
