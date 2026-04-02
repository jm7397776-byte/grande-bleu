#!/bin/bash
set -euo pipefail

# Read tool use input from stdin
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Block modifications to protected files/directories
PROTECTED_PATTERNS=(
  ".claude/settings.json"
  ".claude/hooks/"
  ".env"
  "package-lock.json"
)

if [ -n "$FILE_PATH" ]; then
  for pattern in "${PROTECTED_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" == *"$pattern"* ]]; then
      echo '{"decision": "block", "reason": "Protected file: '"$pattern"' cannot be modified directly. Ask the user for permission first."}'
      exit 0
    fi
  done
fi

echo '{"decision": "approve"}'
