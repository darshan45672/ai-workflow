#!/bin/bash

# Quick test setup script
echo "🚀 Setting up AI Workflow test..."

# Create test branches
git checkout -b feature/auth-basic
echo "# Basic Auth" > auth.js
git add auth.js
git commit -m "feat: basic authentication"
git push -u origin feature/auth-basic

git checkout main
git checkout -b feature/auth-advanced  
echo "# Advanced Auth System" > auth.js
echo "describe('auth', () => { test('login', () => {}) })" > auth.test.js
git add .
git commit -m "feat: advanced authentication with tests"
git push -u origin feature/auth-advanced

echo "✅ Test branches created!"
echo "Now create PRs manually on GitHub for both branches"
echo "The workflow should trigger and evaluate them!"
