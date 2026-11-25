# Progress Log

> **각 단계를 완료하거나 문제가 발생하면 업데이트하세요.**

## Session 2026-11-25

### Phase 1: Requirements & Discovery ✅

**작업 내역**:

1. 요구와 규칙 정리
2. 이 기능의 README와 spec 작성

**생성/수정 파일**:

- `specs/wave-system/README.md` (새로 생성)
- `specs/wave-system/spec.md` (새로 생성)

### Phase 2: Planning & Structure ✅

**작업 내역**:

1. 구조 정하기
2. 구현 계획과 작업 목록 작성

**생성/수정 파일**:

- `specs/wave-system/plan.md` (새로 생성)
- `specs/wave-system/tasks.md` (새로 생성)

### Phase 3: Implementation ✅

**작업 내역**:

1. 웨이브 흐름
2. 알림
3. 쉬는 시간

**생성/수정 파일**:

- `src/sim/updateWaves.ts` (수정)
- `src/constants.ts` (수정)
- `src/render/drawOverlay.ts` (수정)
- `src/ui/updateStatusDisplay.ts` (수정)

### Phase 4: Testing ✅

**작업 내역**:

1. 웨이브가 이어짐: 이어짐
2. 쉬는 동안 새 적: 나오지 않음

**생성/수정 파일**:

- `src/sim/updateWaves.test.ts` (수정)
- `src/render/drawOverlay.test.ts` (수정)

## Test Results

| Test            | Input               | Expected       | Actual      | Status |
| --------------- | ------------------- | -------------- | ----------- | ------ |
| 웨이브가 이어짐 | 적이 남은 채 테스트 | 웨이브 2, 3, 4 | 이어짐      | ✅     |
| 쉬는 동안 새 적 | 테스트              | 나오지 않음    | 나오지 않음 | ✅     |

## Error Log

| Timestamp  | Error            | Attempt | Resolution |
| ---------- | ---------------- | ------- | ---------- |
| 2026-11-25 | 기록할 오류 없음 | 0       | -          |

## 5-Question Reboot Check

작업 재개 시 이 질문들로 컨텍스트 복구:

| Question               | Answer                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| 1. 현재 어느 단계인가? | Phase 4 (모두 끝남)                                                                           |
| 2. 다음에 할 일은?     | 없음(모두 끝남).                                                                              |
| 3. 목표는?             | 웨이브가 시간으로 이어지고, 시작과 남은 시간, 남은 적, 화면 밖 적의 방향이 분명하게 보입니다. |
| 4. 지금까지 배운 것?   | findings.md 참고                                                                              |
| 5. 완료한 작업은?      | progress.md 참고                                                                              |
