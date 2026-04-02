#!/bin/bash
set -euo pipefail

# Read tool use input from stdin
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Auto-lint after file edits
if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]]; then
  if [ -n "$FILE_PATH" ] && [[ "$FILE_PATH" == *.js ]]; then
    cd "$CLAUDE_PROJECT_DIR"
    npx eslint --fix "$FILE_PATH" 2>/dev/null || true
    npx prettier --write "$FILE_PATH" 2>/dev/null || true
  fi
fi
