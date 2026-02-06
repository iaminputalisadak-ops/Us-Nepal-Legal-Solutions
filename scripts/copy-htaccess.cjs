const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '../public/.htaccess');
const distDir = path.join(__dirname, '../dist');
const dest = path.join(distDir, '.htaccess');
const destTxt = path.join(distDir, 'htaccess.txt');
if (fs.existsSync(src)) {
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  fs.copyFileSync(src, dest);
  fs.copyFileSync(src, destTxt);
  console.log('[build] Copied .htaccess to dist/ (also as htaccess.txt - rename to .htaccess if needed)');
} else {
  console.warn('[build] public/.htaccess not found');
}
