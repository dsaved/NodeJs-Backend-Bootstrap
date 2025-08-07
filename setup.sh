#!/bin/bash

# Quick start script for the CLI tool

echo "🚀 Setting up CLI tool for development..."

# Make scripts executable
chmod +x init.js
chmod +x test-cli.js

echo "✅ Scripts made executable"

# Run tests
echo "🧪 Running tests..."
node test-cli.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup complete! Ready to use."
    echo ""
    echo "To use the CLI tool:"
    echo "1. Run: npm link (to link globally)"
    echo "2. Run: init-project (to create a new project)"
    echo ""
    echo "Or test directly with:"
    echo "node init.js"
else
    echo "❌ Tests failed. Please check the setup."
    exit 1
fi
