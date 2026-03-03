#!/bin/bash
# Local check for naming conventions (mirrors .github/workflows/naming-conventions.yml)

echo "🔍 Checking file naming conventions..."

# Check for kebab-case file naming
echo "  → Checking for kebab-case file naming..."
if find src -name "*.ts" -not -path "*/node_modules/*" | grep -E '[A-Z]|_' | grep -v '\.spec\.ts$' | grep -v '\.test\.ts$'; then
  echo "❌ Found files that don't follow kebab-case naming convention"
  exit 1
fi
echo "  ✅ All files follow kebab-case naming convention"

# Check for console.log statements
echo "  → Checking for console.log statements..."
if grep -r "console\.log" src --include="*.ts" --include="*.js" 2>/dev/null; then
  echo "❌ Found console.log statements in source code"
  exit 1
fi
echo "  ✅ No console.log statements found"

# Check for hardcoded secrets
echo "  → Checking for hardcoded secrets..."
if grep -r -E "(password|secret|key|token)\s*=\s*['\"][^'\"]{8,}" src --include="*.ts" --include="*.js" 2>/dev/null; then
  echo "❌ Found potential hardcoded secrets"
  exit 1
fi
echo "  ✅ No hardcoded secrets detected"

echo "✅ All naming convention checks passed!"
