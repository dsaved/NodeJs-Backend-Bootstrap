#!/bin/bash
# Local spell check (mirrors .github/workflows/spell-check.yml)

echo "🔍 Running spell check..."

# Check if cspell is installed
if ! command -v cspell &> /dev/null; then
  echo "⚠️  CSpell not found. Installing globally..."
  npm install -g cspell
fi

# Run spell check
cspell "src/**/*.{ts,js}" "src/**/*.md" "src/**/*.json" \
  --config .cspell.json \
  --exclude "src/config/**" \
  --exclude "src/seeders/**"

if [ $? -eq 0 ]; then
  echo "✅ Spell check passed!"
else
  echo "❌ Spell check failed!"
  exit 1
fi
