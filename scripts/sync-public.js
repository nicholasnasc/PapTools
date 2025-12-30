const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(buildDir)) {
  console.error('Build folder not found. Run `npm run build` first.');
  process.exit(1);
}

fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });
fs.cpSync(buildDir, publicDir, { recursive: true });

console.log('Copied build -> public');
