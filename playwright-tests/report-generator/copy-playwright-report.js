const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'playwright-report');
const targetDir = path.join(__dirname, '..', 'reports', 'playwright');

if (!fs.existsSync(sourceDir)) {
  console.log(`Playwright report directory not found, skipping copy: ${sourceDir}`);
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });
console.log(`Playwright report copied to ${targetDir}`);