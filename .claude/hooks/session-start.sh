#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Async mode: install in background while session starts
echo '{"async": true, "asyncTimeout": 300000}'

cd "$CLAUDE_PROJECT_DIR"

# Install Node.js dependencies
npm install

# Set environment variables for the session
echo 'export NODE_ENV="development"' >> "$CLAUDE_ENV_FILE"
