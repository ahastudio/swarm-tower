# Progress Log

> **각 단계를 완료하거나 문제가 발생하면 업데이트하세요.**

## Session 2026-11-25

### Phase 1: Requirements & Discovery ✅

**작업 내역**:

1. 요구와 규칙 정리
2. 이 기능의 README와 spec 작성

**생성/수정 파일**:

- `specs/camera-controls/README.md` (새로 생성)
- `specs/camera-controls/spec.md` (새로 생성)

### Phase 2: Planning & Structure ✅

**작업 내역**:

1. 구조 정하기
2. 구현 계획과 작업 목록 작성

**생성/수정 파일**:

- `specs/camera-controls/plan.md` (새로 생성)
- `specs/camera-controls/tasks.md` (새로 생성)

### Phase 3: Implementation ✅

**작업 내역**:

1. 조작
2. 낮은 카메라
3. 카메라 중심과 그림자
4. 두 손가락 터치

**생성/수정 파일**:

- `src/input/installInput.ts` (수정)
- `src/camera/camera.ts` (수정)
- `src/sprites/drawLayers.ts` (수정)

### Phase 4: Testing ✅

**작업 내역**:

1. 낮은 카메라: 화면에서 봄
2. 회전과 줌: 화면에서 봄
3. 시작 화면 확인: 타워 판 5px 안, 집과 울타리 10px 안
4. 터치: 벌리기(거리 40에서 120): 3
5. 터치: 오므리기(120에서 40): 1
6. 터치: 비틀기(0.7라디안): 0.7, 1
7. 터치: 함께 위로 100px: 0.73
8. 터치: 두 번째 손가락: 0
9. 터치: 손가락 하나만 남음: 그대로
10. 실제 터치 기기: 두 손가락 조작을 써 봄

**생성/수정 파일**:

- `src/input/pointerHandlers.test.ts` (수정)
- `src/sprites/drawLayers.test.ts` (수정)
- `src/camera/projection.test.ts` (수정)
- `src/input/gesture.test.ts` (수정)

## Test Results

| Test                          | Input                            | Expected            | Actual                              | Status |
| ----------------------------- | -------------------------------- | ------------------- | ----------------------------------- | ------ |
| 낮은 카메라                   | tilt 0.35                        | 층 사이가 비지 않음 | 화면에서 봄                         | ✅     |
| 회전과 줌                     | 입력                             | 자연스러움          | 화면에서 봄                         | ✅     |
| 시작 화면 확인                | 기준 화면과 새 시작 화면 나란히  | 같은 정도           | 타워 판 5px 안, 집과 울타리 10px 안 | ✅     |
| 터치: 벌리기(거리 40에서 120) | 테스트(Chrome DevTools Protocol) | 줌 3배              | 3                                   | ✅     |
| 터치: 오므리기(120에서 40)    | 테스트(Chrome DevTools Protocol) | 줌 1                | 1                                   | ✅     |
| 터치: 비틀기(0.7라디안)       | 테스트(Chrome DevTools Protocol) | 회전 0.7, 줌 그대로 | 0.7, 1                              | ✅     |
| 터치: 함께 위로 100px         | 테스트(Chrome DevTools Protocol) | 높낮이 0.7쯤        | 0.73                                | ✅     |
| 터치: 두 번째 손가락          | 이동 목표 261px 앞               | 목표가 지워짐       | 0                                   | ✅     |
| 터치: 손가락 하나만 남음      | 움직임                           | 카메라 그대로       | 그대로                              | ✅     |
| 실제 터치 기기                | 직접 사용                        | 손에 익음           | 써 봄                               | ✅     |

## Error Log

| Timestamp  | Error                              | Attempt | Resolution                                   |
| ---------- | ---------------------------------- | ------- | -------------------------------------------- |
| 2026-11-25 | 낮은 카메라에서 층이 세로로 늘어남 | 1       | 층 한 장은 tilt배로 좁히고 층 간격은 늘린다. |

## 5-Question Reboot Check

작업 재개 시 이 질문들로 컨텍스트 복구:

| Question               | Answer                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1. 현재 어느 단계인가? | Phase 4 (모두 끝남)                                                                                                |
| 2. 다음에 할 일은?     | 없음(모두 끝남).                                                                                                   |
| 3. 목표는?             | 휠 줌, 오른쪽 버튼 회전과 높낮이, 가운데 버튼 옮기기, 두 손가락 터치가 되고, 카메라를 낮춰도 층이 끊기지 않습니다. |
| 4. 지금까지 배운 것?   | findings.md 참고                                                                                                   |
| 5. 완료한 작업은?      | progress.md 참고                                                                                                   |
