# Progress Log

> **각 단계를 완료하거나 문제가 발생하면 업데이트하세요.**

## Session 2026-11-25

### Phase 1: Requirements & Discovery ✅

**작업 내역**:

1. 요구와 규칙 정리
2. 이 기능의 README와 spec 작성

**생성/수정 파일**:

- `specs/hero-auto-attack/README.md` (새로 생성)
- `specs/hero-auto-attack/spec.md` (새로 생성)

### Phase 2: Planning & Structure ✅

**작업 내역**:

1. 구조 정하기
2. 구현 계획과 작업 목록 작성

**생성/수정 파일**:

- `specs/hero-auto-attack/plan.md` (새로 생성)
- `specs/hero-auto-attack/tasks.md` (새로 생성)

### Phase 3: Implementation ✅

**작업 내역**:

1. 이동과 동작
2. 자동 공격
3. 폭발과 피해
4. 본부 레벨 강화

**생성/수정 파일**:

- `src/sim/moveWorker.ts` (수정)
- `src/sim/combat.ts` (수정)
- `src/constants.ts` (수정)
- `src/render/addWorker.ts` (수정)

### Phase 4: Testing ✅

**작업 내역**:

1. 가장 가까운 적: 맞음
2. 본부 레벨 3, 5: 훨씬 빨리 처치

**생성/수정 파일**:

- `src/sim/moveWorker.test.ts` (수정)
- `src/sim/attackWithWorker.test.ts` (수정)
- `src/sim/combat.test.ts` (수정)
- `src/sim/calculateWorkerStats.test.ts` (수정)

## Test Results

| Test           | Input               | Expected                  | Actual         | Status |
| -------------- | ------------------- | ------------------------- | -------------- | ------ |
| 가장 가까운 적 | 사거리 안에 적 여럿 | 가까운 적부터 맞음        | 맞음           | ✅     |
| 본부 레벨 3, 5 | 같은 적 무리        | 레벨 1보다 훨씬 빨리 처치 | 훨씬 빨리 처치 | ✅     |

## Error Log

| Timestamp  | Error            | Attempt | Resolution |
| ---------- | ---------------- | ------- | ---------- |
| 2026-11-25 | 기록할 오류 없음 | 0       | -          |

## 5-Question Reboot Check

작업 재개 시 이 질문들로 컨텍스트 복구:

| Question               | Answer                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1. 현재 어느 단계인가? | Phase 4 (모두 끝남)                                                                                                   |
| 2. 다음에 할 일은?     | 없음(모두 끝남).                                                                                                      |
| 3. 목표는?             | 주인공이 조작에 따라 걷고, 멈추지 않고 가장 가까운 적을 포물선 탄으로 자동으로 쏩니다. 본부 레벨이 오를수록 세집니다. |
| 4. 지금까지 배운 것?   | findings.md 참고                                                                                                      |
| 5. 완료한 작업은?      | progress.md 참고                                                                                                      |
