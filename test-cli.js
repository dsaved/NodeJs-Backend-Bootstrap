#!/usr/bin/env node

// Test script to verify the CLI tool functionality
const path = require('path');
const fs = require('fs-extra');

console.log('🧪 Testing CLI Tool...\n');

// Test 1: Check if init.js exists and is executable
const initPath = path.join(__dirname, 'init.js');
if (!fs.existsSync(initPath)) {
  console.error('❌ init.js not found');
  process.exit(1);
}

const stats = fs.statSync(initPath);
if (!(stats.mode & parseInt('111', 8))) {
  console.error('❌ init.js is not executable');
  process.exit(1);
}

console.log('✅ init.js exists and is executable');

// Test 2: Check if template directory exists
const templatePath = path.join(__dirname, 'template');
if (!fs.existsSync(templatePath)) {
  console.error('❌ template directory not found');
  process.exit(1);
}

console.log('✅ template directory exists');

// Test 3: Check template structure
const requiredFiles = [
  'template/package.json',
  'template/src/index.js',
  'template/README.md',
  'template/.env.example',
  'template/.gitignore',
  'template/src/utils/logger.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.error(`❌ Required template file missing: ${file}`);
    process.exit(1);
  }
}

console.log('✅ All required template files exist');

// Test 4: Check package.json structure
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
if (!packageJson.bin || !packageJson.bin['init-project']) {
  console.error('❌ package.json missing bin configuration');
  process.exit(1);
}

console.log('✅ package.json properly configured');

// Test 5: Check utils.js
const utilsPath = path.join(__dirname, 'utils.js');
if (!fs.existsSync(utilsPath)) {
  console.error('❌ utils.js not found');
  process.exit(1);
}

console.log('✅ utils.js exists');

console.log('\n🎉 All tests passed! CLI tool is ready to use.');
console.log('\nTo test the CLI tool:');
console.log('1. Run: npm link');
console.log('2. Run: init-project');
console.log('3. Follow the prompts to create a test project');
