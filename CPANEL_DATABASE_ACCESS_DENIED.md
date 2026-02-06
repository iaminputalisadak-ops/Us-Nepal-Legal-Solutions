# Fix "Access denied" Database Error on cPanel

## The Error
```
Access denied for user 'usnepallegalsolu_nepal'@'localhost' to database 'usnepallegalsolu_nepal'
```

This happens on the **live cPanel server** when the MySQL user is not properly linked to the database.

---

## Step-by-Step Fix

### 1. Create config.cpanel.php on the Server

**Use config.cpanel.php (NOT config.local.php) for cPanel.** This prevents your local config from overwriting it when you re-upload the backend.

In cPanel File Manager, go to `public_html/backend/`:

1. Find **`config.cpanel.php.example`**
2. **Copy** it and name the copy **`config.cpanel.php`** (or Rename)
3. Edit **`config.cpanel.php`** and add your credentials:

```php
<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'usnepallegalsolu_nepal');   // Your cPanel MySQL username
define('DB_PASS', 'YOUR_ACTUAL_PASSWORD');     // The password you set in cPanel
define('DB_NAME', 'usnepallegalsolu_nepal');   // Your cPanel database name
define('DB_PORT', 3306);                       // cPanel uses 3306, NOT 3308
```

**Important:** Replace `YOUR_ACTUAL_PASSWORD` with the exact password you set when creating the MySQL user in cPanel.

---

### 2. Link User to Database (Most Common Fix)

The "Access denied" error usually means the user exists and the database exists, but **the user is not linked to the database**.

1. Log in to **cPanel**
2. Open **MySQL® Databases**
3. Scroll to **Add User To Database**
4. Select user: **usnepallegalsolu_nepal**
5. Select database: **usnepallegalsolu_nepal**
6. Click **Add**
7. On the next screen, check **ALL PRIVILEGES**
8. Click **Make Changes**

---

### 3. If User or Database Doesn't Exist

**Create the database:**
- MySQL Databases → Create New Database
- Name it (e.g. `usnepallegalsolu_nepal` – cPanel adds your username prefix)

**Create the user:**
- MySQL Databases → MySQL Users → Add New User
- Username: `usnepallegalsolu_nepal` (or similar)
- Password: choose a strong password and **save it** – you need it for config.cpanel.php

**Then do Step 2** – Add User To Database and grant ALL PRIVILEGES.

---

### 4. Verify Username and Database Name

cPanel often adds a prefix. Your actual names might be:
- `cpaneluser_usnepallegalsolu` (database)
- `cpaneluser_nepal` (user)

Check **MySQL Databases** → **Current Databases** and **Current Users** for the exact names. Use those exact names in config.cpanel.php.

---

### 5. Use Port 3306

cPanel MySQL uses port **3306**. Your config.cpanel.php **must** have:

```php
define('DB_PORT', 3306);
```

---

## Quick Checklist

- [ ] `config.cpanel.php` exists in `public_html/backend/` (copy from config.cpanel.php.example)
- [ ] Password in config.cpanel.php matches the one set in cPanel
- [ ] User is linked to database (Add User To Database → ALL PRIVILEGES)
- [ ] `DB_PORT` is **3306** (not 3308)
- [ ] Username and database name match exactly what cPanel shows

---

## Test

After fixing, visit:
- **https://usnepallegalsolutions.com/backend/db-check.php** – shows config status and connection result
- **https://usnepallegalsolutions.com/backend/site_settings.php** – should return JSON if DB works
