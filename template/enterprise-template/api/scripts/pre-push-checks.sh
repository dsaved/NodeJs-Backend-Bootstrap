#!/bin/bash
# Master pre-push script that runs all local checks

set -e  # Exit on first failure

echo "🚀 Running pre-push checks...\n"

# 1. Naming conventions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash scripts/check-naming-conventions.sh
echo ""

# 2. Spell check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash scripts/check-spelling.sh
echo ""

# 3. Linting
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Running linter..."
npm run lint
echo "✅ Linting passed!"
echo ""

# 4. Security/SAST check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash scripts/check-security.sh
echo ""

# 5. OpenAPI validation (optional, uncomment if needed)
# echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# echo "🔍 Validating OpenAPI spec..."
# npm run openapi:check
# echo "✅ OpenAPI validation passed!"
# echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All pre-push checks passed! Safe to push.\n"
