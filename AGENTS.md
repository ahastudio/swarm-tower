# AGENTS.md

- 항상 한국어 존댓말(해요체·합쇼체)로 답한다. 코드 주석과 커밋 메시지도 한국어로 쓴다.
- 작업을 시작하기 전에 `_agent/rules/`의 규칙을 읽고 따른다.
  - TypeScript 코드를 쓰거나 고치기 전: `_agent/rules/code-style.md`(형식, 이름, 주석, 줄임말 금지, 파일명과 export)
  - 테스트를 쓰거나 고치기 전: `_agent/rules/testing.md`(TDD, 커버리지 100%)
  - 코드와 설계를 고친 뒤 품질을 보고하기 전: `_agent/rules/quality-score.md`(점수 계산과 쓰레기 코드 금지)
  - 규칙을 바꾸면 같은 턴에 린터 설정과 어긋난 코드도 맞춘다.
- 코드를 바꾼 뒤에는 `/check`(또는 `pnpm run check`)를 통과시킨다. 기준: 커버리지 100%, 타입·린트 오류 0, 품질 점수 95 이상.
- 기준을 낮추거나 `ignore`·`@ts-ignore`로 덮지 않는다.
- 코드에 줄임말을 만들어 쓰지 않는다. 이름은 풀어서 쓴다(`dt` → `deltaSeconds`, `i` → `index`). 한 글자 이름은 좌표 `x`, `y`, `z`만 쓰고, 도메인 용어로 굳은 `hp`만 예외다. `scripts/checks/no_abbreviations.mjs`(ESLint)가 검사한다. 자세한 기준은 `code-style.md`의 「이름 — 줄임말 금지」를 따른다.
- `public/sprites/manifest.json`의 키는 `SheetEntry`(`src/types.ts`)의 속성 이름과 같아야 한다. 속성 이름을 바꾸면 이 파일도 같이 고친다.
