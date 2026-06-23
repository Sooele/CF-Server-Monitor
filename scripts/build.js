#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');

console.log('Cleaning dist directory...');
if (fs.existsSync(distDir)) {
  fs.removeSync(distDir);
}

console.log('Building frontend...');
execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });

console.log('Generating config.json from .env...');
const envConfig = {};
if (fs.existsSync(path.join(rootDir, '.env'))) {
  const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*API_BASE_URL\s*=\s*["']?(.+?)["']?\s*$/);
    if (match) {
      envConfig.apiBase = match[1];
      break;
    }
  }
}
const configJsonPath = path.join(distDir, 'config.json');
fs.writeFileSync(configJsonPath, JSON.stringify({ apiBase: envConfig.apiBase || '' }, null, 2), 'utf8');
console.log(`Generated config.json with apiBase: ${envConfig.apiBase || '(empty)'}`);

console.log('Copying static assets...');
if (fs.existsSync(publicDir)) {
  fs.copySync(publicDir, distDir, { overwrite: false });
  console.log('Copied all static assets');
}

// 替换时间戳
console.log('Replacing timestamp in index.html...');
const indexHtmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  const timestamp = Date.now();
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  // 替换所有 ?t= 后面的数字为新的时间戳
  html = html.replace(/(\?t=)\d+/g, `$1${timestamp}`);
  fs.writeFileSync(indexHtmlPath, html, 'utf8');
  console.log(`Updated timestamp to ${timestamp}`);
}

// 重命名为 dashboard.html，避免 ASSETS 直接拦截首页
const dashboardHtmlPath = path.join(distDir, 'dashboard.html');
if (fs.existsSync(indexHtmlPath)) {
  fs.renameSync(indexHtmlPath, dashboardHtmlPath);
  console.log('Renamed index.html → dashboard.html');
}

console.log('Build complete!');
