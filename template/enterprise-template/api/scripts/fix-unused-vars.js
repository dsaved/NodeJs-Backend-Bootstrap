#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Scanning for unused variables...\n');

try {
  // Run ESLint with no-unused-vars rule
  const output = execSync(
    'eslint "{src,apps,libs,test}/**/*.ts" --format json',
    { encoding: 'utf-8', stdio: 'pipe' }
  );

  const results = JSON.parse(output);
  let fixedCount = 0;

  results.forEach((result) => {
    const filePath = result.filePath;
    const messages = result.messages.filter(
      (msg) => msg.ruleId === 'no-unused-vars' || msg.ruleId === '@typescript-eslint/no-unused-vars'
    );

    if (messages.length === 0) return;

    let fileContent = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    messages.forEach((msg) => {
      const varName = msg.message.match(/'([^']+)'/)?.[1];
      if (!varName) return;

      // Prefix unused variables with underscore
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      const newContent = fileContent.replace(regex, `_${varName}`);

      if (newContent !== fileContent) {
        fileContent = newContent;
        modified = true;
        console.log(`  ✓ Fixed unused variable '${varName}' in ${path.relative(process.cwd(), filePath)}`);
        fixedCount++;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, fileContent, 'utf-8');
    }
  });

  if (fixedCount === 0) {
    console.log('✅ No unused variables found!');
  } else {
    console.log(`\n✅ Fixed ${fixedCount} unused variable(s)`);
  }
} catch (error) {
  if (error.status === 1) {
    // ESLint found issues, which is expected
    try {
      const results = JSON.parse(error.stdout.toString());
      console.log('⚠️  Some issues could not be automatically fixed.');
      console.log('   Run: npm run lint -- --fix');
    } catch (parseError) {
      console.error('❌ Error parsing ESLint output:', parseError.message);
    }
  } else {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
