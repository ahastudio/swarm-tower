---
name: check
description: 테스트 커버리지 100%와 정적 분석(타입, 린트, 품질 점수)을 통과하는지 검사하고, 실패하면 원인을 고쳐 모두 통과시킨다. 코드 변경을 마무리하거나 커밋하기 전에, 또는 "check", "검사", "커버리지 확인"을 요청받았을 때 쓴다.
---

# check

`pnpm run check` 하나로 전체 검사를 돌린다. 순서와 내용은 다음과 같다.

1. `guard` — TypeScript 7 금지, 커버리지 임계값이 줄·분기·문장·함수 모두 100인지 확인(`scripts/checks/`)
2. `typecheck` — `tsc --noEmit`
3. `lint` — `biome check --error-on-warnings .` + `eslint src`
4. `test:coverage` — vitest 커버리지 100%
5. `score` — `quality_score.cjs src --min 95`

## 절차

1. 프로젝트 루트에서 `pnpm run check`를 실행한다. 첫 실패에서 멈추므로, 전체 상황이 필요하면 단계별(`pnpm typecheck`, `pnpm lint`, `pnpm test:coverage`, `pnpm run score`)로 따로 돌린다.
2. 실패하면 출력의 원인을 읽고 **코드나 테스트를 고친다**.
   - 커버리지 부족: 커버되지 않은 줄/분기(리포트의 Uncovered Line #s)를 실행하는 테스트를 추가한다. 도달할 수 없는 코드라면 코드를 지운다.
   - 타입/린트 오류: 해당 코드를 고친다. 자동 수정이 가능한 포맷 문제는 `pnpm exec biome check --write .`를 쓴다.
   - 품질 점수 미달: `node scripts/checks/quality_score.cjs src --verbose`로 감점 항목을 보고 구조를 개선한다.
3. 고친 뒤 `pnpm run check`를 처음부터 다시 실행해, 끝까지 통과할 때까지 반복한다.
4. 통과하면 각 단계 결과(커버리지 수치, 점수)를 짧게 보고한다. 실패가 남았으면 단계, 파일, 이유를 그대로 알린다.

## 금지 사항

기준을 낮춰서 통과시키지 않는다. 아래는 모두 하지 않는다.

- `vite.config.ts`의 커버리지 임계값을 100 밖으로 내리거나, 테스트·`src/testing/` 외 파일을 `exclude`에 넣기
- `/* v8 ignore */`, `// eslint-disable`, `// biome-ignore`, `@ts-ignore`, `@ts-expect-error`로 문제를 덮기
- `--min 95` 기준을 낮추거나 `scripts/checks/`의 검사 스크립트·린트 설정을 완화하기
- 단언 없는 테스트로 줄만 실행하기: 테스트는 동작을 실제로 검증해야 한다.

기준 자체를 바꿔야 한다면 먼저 사용자에게 묻는다.
