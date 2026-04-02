# Grande Bleu

## Project Overview

Node.js project.

## Commands

- **Install**: `npm install`
- **Test**: `npm test`
- **Test with coverage**: `npm test -- --coverage`
- **Lint**: `npm run lint`
- **Format**: `npm run format`
- **Lint + Fix**: `npm run lint:fix`

## Directory Structure

```
src/              # Source code
src/__tests__/    # Test files (*.test.js)
.claude/          # Claude Code configuration
.claude/hooks/    # Hook scripts (DO NOT modify without permission)
```

## Code Style

- Use ESLint for linting (flat config in `eslint.config.js`)
- Use Prettier for formatting (config in `.prettierrc`)
- Use Jest for testing
- Tests live in `src/__tests__/`, named `*.test.js`

## Coding Conventions

- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Functions**: Keep functions small (< 30 lines). Single responsibility.
- **Modules**: One module per file. Use `module.exports` for exports.
- **Error handling**: Only add error handling at system boundaries (user input, external APIs). Don't over-defensively code internal functions.
- **Comments**: Only when logic isn't self-evident. No obvious comments.

## Prohibited

- Do NOT use `console.log` for debugging (ESLint will warn)
- Do NOT modify files in `.claude/hooks/` or `.claude/settings.json` without explicit user permission
- Do NOT commit `.env` or credential files
- Do NOT install new dependencies without asking the user first
- Do NOT use `var` — use `const` by default, `let` when reassignment is needed

## Commit Message Rules

- Use imperative mood: "Add feature" not "Added feature"
- Keep first line under 72 characters
- Include a blank line before description body if needed

## Testing Rules

- Every new function must have a corresponding test
- Tests should be independent (no shared mutable state)
- Use descriptive test names: `it("should return sum of two positive numbers")`
- Coverage threshold: 80% (branches, functions, lines, statements)
