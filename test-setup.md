# Testing the AI-Powered PR Workflow

## Test Scenario Setup

### Step 1: Create competing feature branches

```bash
# Create first feature branch
git checkout -b feature/auth-login
echo "# User Authentication\nBasic login functionality" > auth.md
git add auth.md
git commit -m "feat: add basic login functionality"
git push -u origin feature/auth-login

# Create second competing feature branch  
git checkout main
git checkout -b feature/auth-system
echo "# Authentication System\nComprehensive auth with tests" > auth.md
echo "# Tests\nUnit tests for auth" > auth.test.js
git add .
git commit -m "feat: comprehensive authentication system with tests"
git push -u origin feature/auth-system

# Create third competing branch
git checkout main
git checkout -b feature/auth-module  
echo "# Auth Module\nModular authentication" > auth.md
echo "# Documentation\nAuth module docs" > AUTH_README.md
git add .
git commit -m "feat(auth): modular authentication implementation"
git push -u origin feature/auth-module
```

### Step 2: Create Pull Requests

1. Go to GitHub and create PRs for each branch
2. **PR 1**: `feature/auth-login` → `main`
   - Title: "Add user login functionality"
   - Description: "Basic login"

3. **PR 2**: `feature/auth-system` → `main` 
   - Title: "Comprehensive authentication system"
   - Description: "## Overview\nThis PR adds a **comprehensive authentication system** with:\n- Login functionality\n- Unit tests\n- Error handling\n\n## Testing\nAll tests pass successfully."

4. **PR 3**: `feature/auth-module` → `main`
   - Title: "Modular auth implementation"  
   - Description: "### Features\nModular authentication with documentation"

### Expected Results

The workflow should:
1. ✅ Detect 3 competing PRs (all have "auth" keyword)
2. ✅ Evaluate each PR and assign scores
3. ✅ PR 2 should win (has tests + better description)
4. ✅ Post detailed comments on all PRs
5. ✅ Attempt to auto-merge the winner

## Scoring Prediction

**PR 2 should win with highest score:**
- Code Quality: ~65/100 (2 files)
- Git Quality: 100/100 (conventional commit)
- Description: 100/100 (detailed, formatted)
- File Analysis: 75/100 (has tests)
- Timing: 50/100 (baseline)
- **Total: ~74/100**

**PR 3 should be second:**
- Code Quality: ~65/100 (2 files) 
- Git Quality: 100/100 (conventional commit)
- Description: ~65/100 (formatted but shorter)
- File Analysis: 65/100 (has docs)
- Timing: 50/100
- **Total: ~69/100**

**PR 1 should be last:**
- Code Quality: ~65/100 (1 file)
- Git Quality: 100/100 (conventional commit)
- Description: ~30/100 (too short)
- File Analysis: 50/100 (no tests/docs)
- Timing: 50/100
- **Total: ~59/100**
