# Progress Log

> **각 단계를 완료하거나 문제가 발생하면 업데이트하세요.**

## Session 2026-11-25

### Phase 1: Requirements & Discovery ✅

**작업 내역**:

1. 요구와 규칙 정리
2. 이 기능의 README와 spec 작성

**생성/수정 파일**:

- `specs/tower-building/README.md` (새로 생성)
- `specs/tower-building/spec.md` (새로 생성)

### Phase 2: Planning & Structure ✅

**작업 내역**:

1. 구조 정하기
2. 구현 계획과 작업 목록 작성

**생성/수정 파일**:

- `specs/tower-building/plan.md` (새로 생성)
- `specs/tower-building/tasks.md` (새로 생성)

### Phase 3: Implementation ✅

**작업 내역**:

1. 판
2. 돈 넣기
3. 가격
4. 타워의 공격
5. 판 위치

**생성/수정 파일**:

- `src/sim/towers.ts` (수정)
- `src/world/spots.ts` (수정)
- `src/constants.ts` (수정)
- `src/render/drawSpotPads.ts` (수정)

### Phase 4: Testing ✅

**작업 내역**:

1. 돈 넣기: 그렇게 됨
2. 타워 공격: 쏨
3. 레벨별 가격: 본부 레벨 1~5에서 15, 30, 50, 80, 110이고 열린 판 세 곳이 모두 같음

**생성/수정 파일**:

- `src/render/drawSpotPads.test.ts` (수정)
- `src/sim/buildSpots.test.ts` (수정)
- `src/world/spots.test.ts` (수정)
- `src/sim/towers.test.ts` (수정)

## Test Results

| Test        | Input                   | Expected                  | Actual    | Status |
| ----------- | ----------------------- | ------------------------- | --------- | ------ |
| 돈 넣기     | 판에 서서 동전 지급     | 판이 차오르고 타워가 솟음 | 그렇게 됨 | ✅     |
| 타워 공격   | 타워를 지은 뒤 적 접근  | 타워가 쏨                 | 쏨        | ✅     |
| 레벨별 가격 | 본부 레벨 1~5의 열린 판 | 15, 30, 50, 80, 110       | 같음      | ✅     |

## Error Log

| Timestamp  | Error                   | Attempt | Resolution                                                 |
| ---------- | ----------------------- | ------- | ---------------------------------------------------------- |
| 2026-11-25 | 판이 연못과 겹치는 배치 | 1       | 연못 위치를 판과 떨어지게 옮기고 간격을 계산으로 확인한다. |

## 5-Question Reboot Check

작업 재개 시 이 질문들로 컨텍스트 복구:

| Question               | Answer                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1. 현재 어느 단계인가? | Phase 4 (모두 끝남)                                                                                             |
| 2. 다음에 할 일은?     | 없음(모두 끝남).                                                                                                |
| 3. 목표는?             | 땅에 깔린 정사각형 판 위에 서서 동전을 넣으면 타워(대포)가 솟아오르고, 타워는 가까운 적 무리를 자동으로 쏩니다. |
| 4. 지금까지 배운 것?   | findings.md 참고                                                                                                |
| 5. 완료한 작업은?      | progress.md 참고                                                                                                |
