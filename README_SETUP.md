# US-NEPAL LEGAL SOLUTIONS - Setup Guide

## Database Setup (MySQL)

1. **Start XAMPP** and make sure MySQL is running

2. **Open phpMyAdmin** (http://localhost/phpmyadmin)

3. **Import the database:**
   - Click on "Import" tab
   - Choose file: `database/schema.sql`
   - Click "Go" to import

   OR manually run the SQL:
   ```sql
   -- Open MySQL command line or phpMyAdmin SQL tab
   -- Copy and paste contents of database/schema.sql
   ```

4. **Default Admin Credentials:**
   - Username: `admin`
   - Password: `admin123`
   - **⚠️ IMPORTANT: Change this password after first login!**

## PHP Backend Setup

1. **Copy backend folder to XAMPP htdocs:**
   ```
   Copy: c:\Users\Ghost\Downloads\New folder\backend\
   To: C:\xampp\htdocs\backend\
   ```

2. **Update database credentials** in `C:\xampp\htdocs\backend\config.php` if needed:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root');
   define('DB_PASS', ''); // Your MySQL password if set
   define('DB_NAME', 'us_nepal_legal_db');
   ```

3. **Test the API:**
   - Open: http://localhost/backend/login.php
   - You should see a JSON response (even if it's an error, that means PHP is working)

## React Frontend Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5175 (or the port shown in terminal)
   - Click "Admin Login" button (bottom left) to access admin panel

## File Structure

```
New folder/
├── backend/              # PHP API files
│   ├── config.php        # Database configuration
│   ├── login.php         # Login endpoint
│   ├── verify_session.php # Session verification
│   └── logout.php        # Logout endpoint
├── database/
│   └── schema.sql        # Database schema
├── src/
│   ├── App.jsx           # Main homepage
│   ├── AppWrapper.jsx    # Authentication wrapper
│   ├── Login.jsx         # Login component
│   ├── AdminDashboard.jsx # Admin dashboard
│   └── ...
└── package.json
```

## Troubleshooting

### Database Connection Error
- Make sure MySQL is running in XAMPP
- Check database credentials in `config.php`
- Verify database `us_nepal_legal_db` exists

### CORS Error
- Make sure PHP backend is in `C:\xampp\htdocs\backend\`
- Check CORS headers in `config.php` match your React port
- Update `API_URL` in `Login.jsx` and `AdminDashboard.jsx` if needed

### Login Not Working
- Check browser console for errors
- Verify PHP files are accessible at http://localhost/backend/
- Check MySQL is running and database is imported
- Verify admin user exists in database

## Security Notes

1. **Change default password** immediately after first login
2. **Update CORS origins** in `config.php` for production
3. **Use HTTPS** in production
4. **Set strong MySQL password** in production
5. **Keep PHP files outside public directory** in production (use proper server structure)

## Next Steps

- Add password change functionality
- Add admin user management
- Add content management features
- Implement proper session management
- Add CSRF protection
