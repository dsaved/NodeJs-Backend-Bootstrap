#!/bin/bash

# Quick start script for the CLI tool

echo "🚀 Setting up CLI tool for development..."

# Make scripts executable
chmod +x src/init.js

echo "✅ Scripts made executable"

# Verify CLI is ready
echo "🧪 Verifying CLI setup..."
if [ -f "src/init.js" ]; then
    echo "✅ init.js found and ready"
    echo ""
    echo "🎉 Setup complete! Ready to use."
    echo ""
    echo "To use the CLI tool:"
    echo "1. Run: npm link (to link globally)"
    echo "2. Run: init-project (to create a new project)"
    echo ""
    echo "Or run directly with:"
    echo "node src/init.js"
    echo ""
    echo "Note: The project will be created in the current directory"
else
    echo "❌ init.js not found"
    exit 1
fi
