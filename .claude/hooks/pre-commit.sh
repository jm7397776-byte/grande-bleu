#!/bin/bash
set -euo pipefail

# Pre-commit: run lint and tests before allowing commit
cd "$CLAUDE_PROJECT_DIR"

echo "Running linter..."
npx eslint src/ || {
  echo "Lint failed. Fix errors before committing."
  exit 1
}

echo "Running tests..."
npx jest --coverage --passWithNoTests || {
  echo "Tests failed. Fix errors before committing."
  exit 1
}

echo "All checks passed."
