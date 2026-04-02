# Grande Bleu

## Project Overview

그랑블루요트 네이버 파워링크 광고 관리 자동화 (Node.js)

업종: 요트투어 (제주)

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
  keyword/          # 키워드/입찰 관리 (등록, 추천, 입찰가 자동 조정)
  adcopy/           # 광고문 자동 생성 (타이틀/설명문, A/B 테스트, 대량 생성)
  budget/           # 예산/성과 분석 (일별 분석, 성과 평가, 최적 예산 계산)
  report/           # 보고서 생성 (일간/주간/월간 성과 보고서)
  promotion/        # 프로모션 기획 (시즌 감지, 할인율 계산, 이벤트 캘린더, 성과 하락 감지)
  data/             # 설정 데이터 (업체 정보, 광고 설정, 성과 목표)
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
