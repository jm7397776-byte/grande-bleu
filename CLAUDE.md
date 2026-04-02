# Grande Bleu

## Project Overview

그랑블루 요트 마케팅 자동화 프로젝트 (Node.js)

서비스: 요트 투어/관광, 파티/이벤트, 대여/차터

## Commands

- **Install**: `npm install`
- **Test**: `npm test`
- **Test with coverage**: `npm test -- --coverage`
- **Lint**: `npm run lint`
- **Format**: `npm run format`
- **Lint + Fix**: `npm run lint:fix`

## Directory Structure

```
src/
  sns/              # SNS 자동 포스팅 (캡션, 해시태그, 주간 일정)
  reservation/      # 예약/문의 관리 (자동 응답, 예약 확인)
  brochure/         # 맞춤형 소개서 생성 (한국어/영어)
  data/             # 서비스 데이터 (요트 투어, 파티, 차터 정보)
  __tests__/        # Test files (*.test.js)
.claude/            # Claude Code configuration
.claude/hooks/      # Hook scripts (DO NOT modify without permission)
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
