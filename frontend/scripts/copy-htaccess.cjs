const fs = require("fs");
const path = require("path");
const src = path.join(__dirname, "../public/.htaccess");
// Vite outputs to project root dist/ when run with --config frontend/vite.config.js
const rootDist = path.join(process.cwd(), "dist");
const frontendDist = path.join(__dirname, "../dist");
const distDir = fs.existsSync(rootDist) ? rootDist : frontendDist;
const dest = path.join(distDir, ".htaccess");
const destTxt = path.join(distDir, "htaccess.txt");
const assetsHtaccess = `<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/javascript .js .mjs
</IfModule>
<IfModule mod_headers.c>
  <FilesMatch "\\.(js|mjs)$">
    Header set Content-Type "application/javascript; charset=utf-8"
  </FilesMatch>
</IfModule>
`;

if (fs.existsSync(src)) {
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  fs.copyFileSync(src, dest);
  fs.copyFileSync(src, destTxt);
  const assetsDir = path.join(distDir, "assets");
  if (fs.existsSync(assetsDir)) {
    fs.writeFileSync(path.join(assetsDir, ".htaccess"), assetsHtaccess);
    console.log("[build] Copied .htaccess to dist/ and created assets/.htaccess (MIME fix)");
  } else {
    console.log("[build] Copied .htaccess to dist/ (also as htaccess.txt)");
  }
} else {
  console.warn("[build] public/.htaccess not found");
}
