# Progress Log

> **각 단계를 완료하거나 문제가 발생하면 업데이트하세요.**

## Session 2026-11-25

### Phase 1: Requirements & Discovery ✅

**작업 내역**:

1. 요구와 규칙 정리
2. 이 기능의 README와 spec 작성

**생성/수정 파일**:

- `specs/survival-time/README.md` (새로 생성)
- `specs/survival-time/spec.md` (새로 생성)

### Phase 2: Planning & Structure ✅

**작업 내역**:

1. 구조 정하기
2. 구현 계획과 작업 목록 작성

**생성/수정 파일**:

- `specs/survival-time/plan.md` (새로 생성)
- `specs/survival-time/tasks.md` (새로 생성)

### Phase 3: Implementation ✅

**작업 내역**:

1. 본부 체력
2. 생존 시간 표기와 표시
3. 게임 오버
4. 다시 시작

**생성/수정 파일**:

- `src/ui/formatSurvivalTime.ts` (새로 생성)
- `src/ui/updateStatusDisplay.ts` (수정)
- `src/ui/showGameOver.ts` (수정)
- `src/sim/update.ts` (수정)
- `src/resetGame.ts` (수정)
- `index.html` (수정)
- `public/styles/hud.css` (수정)
- `public/styles/game-over.css` (수정)

### Phase 4: Testing ✅

**작업 내역**:

1. 생존 시간 표기: 0:00, 0:05, 1:00, 2:05, 62:05
2. 게임 오버: 게임을 82초 돌린 뒤 체력 0, 「생존 시간 1:22」, 「웨이브 3까지 버텼습니다」
3. 게임 오버 화면에서 3초 뒤: 그대로
4. 다시 시작: 0:00

**생성/수정 파일**:

- `src/ui/formatSurvivalTime.test.ts` (새로 생성)
- `src/ui/updateStatusDisplay.test.ts` (수정)
- `src/ui/showGameOver.test.ts` (수정)
- `src/ui/installRestart.test.ts` (수정)

## Test Results

| Test           | Input                   | Expected                           | Actual             | Status |
| -------------- | ----------------------- | ---------------------------------- | ------------------ | ------ |
| 생존 시간 표기 | 0, 5.9, 60, 125, 3725초 | 0:00, 0:05, 1:00, 2:05, 62:05      | 같음               | ✅     |
| 게임 중 표시   | 약 82초 진행            | 왼쪽 위 첫 줄에 「생존 시간 1:22」 | 같음               | ✅     |
| 게임 오버      | 체력 0                  | 멈추고 게임 오버, 생존 시간        | 「생존 시간 1:22」 | ✅     |
| 누르기 전까지  | 3초 기다림              | 생존 시간 그대로                   | 그대로             | ✅     |
| 다시 시작      | 버튼                    | 0:00, 화면 사라짐                  | 같음               | ✅     |

## Error Log

| Timestamp  | Error            | Attempt | Resolution |
| ---------- | ---------------- | ------- | ---------- |
| 2026-11-25 | 기록할 오류 없음 | 0       | -          |

## 5-Question Reboot Check

작업 재개 시 이 질문들로 컨텍스트 복구:

| Question               | Answer                                                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 현재 어느 단계인가? | Phase 4 (모두 끝남)                                                                                                                                                                    |
| 2. 다음에 할 일은?     | 없음(모두 끝남).                                                                                                                                                                       |
| 3. 목표는?             | 게임은 생존 시간을 보는 게임입니다. 시간은 화면 왼쪽 위에 가장 먼저 보이고, 본부 체력이 0이 되면 게임 오버와 생존 시간, 버틴 웨이브가 보이며, 다시 시작을 누를 때까지 그대로 남습니다. |
| 4. 지금까지 배운 것?   | findings.md 참고                                                                                                                                                                       |
| 5. 완료한 작업은?      | progress.md 참고                                                                                                                                                                       |
