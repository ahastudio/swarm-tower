# Progress Log

> **각 단계를 완료하거나 문제가 발생하면 업데이트하세요.**

## Session 2026-11-25

### Phase 1: Requirements & Discovery ✅

**작업 내역**:

1. 요구와 규칙 정리
2. 이 기능의 README와 spec 작성

**생성/수정 파일**:

- `specs/developer-information/README.md` (새로 생성)
- `specs/developer-information/spec.md` (새로 생성)

### Phase 2: Planning & Structure ✅

**작업 내역**:

1. 구조 정하기
2. 구현 계획과 작업 목록 작성

**생성/수정 파일**:

- `specs/developer-information/plan.md` (새로 생성)
- `specs/developer-information/tasks.md` (새로 생성)

### Phase 3: Implementation ✅

**작업 내역**:

1. fps 세기와 표시
2. 개발 서버에서만 보이기

**생성/수정 파일**:

- `src/ui/tickFps.ts` (수정)
- `src/ui/developerInformation.ts` (새로 생성)
- `src/main.ts` (수정)
- `index.html` (수정)
- `public/styles/hud.css` (수정)

### Phase 4: Testing ✅

**작업 내역**:

1. 표시: 개발 서버에서 시작 뒤에 보임, 타이틀 중에는 숨김
2. 배포판: 번들에 개발자 정보 글자 0건
3. 60fps: 웨이브 1~20(적 52~884마리) 59~61fps, 동전 약 2000개와 적 약 720마리 57~60fps

**생성/수정 파일**:

- `src/ui/tickFps.test.ts` (수정)
- `src/ui/developerInformation.test.ts` (새로 생성)

## Test Results

| Test                                 | Input                      | Expected        | Actual       | Status |
| ------------------------------------ | -------------------------- | --------------- | ------------ | ------ |
| 개발 서버 표시                       | 시작 누른 뒤               | 왼쪽 아래에 fps | 보임         | ✅     |
| 타이틀 중                            | 시작 누르기 전             | 숨김            | 숨김         | ✅     |
| 배포 번들                            | `dist` 검색                | 글자 없음       | 0건          | ✅     |
| 60fps(큰 웨이브, GPU 창)             | 웨이브 1~20, 적 52~884마리 | 60fps           | 59~61fps     | ✅     |
| 60fps(동전 약 2000개, 적 약 720마리) | 폭 1280px, 390px           | 60fps           | 57fps, 60fps | ✅     |

## Error Log

| Timestamp  | Error            | Attempt | Resolution |
| ---------- | ---------------- | ------- | ---------- |
| 2026-11-25 | 기록할 오류 없음 | 0       | -          |

## 5-Question Reboot Check

작업 재개 시 이 질문들로 컨텍스트 복구:

| Question               | Answer                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1. 현재 어느 단계인가? | Phase 4 (모두 끝남)                                                                                                                 |
| 2. 다음에 할 일은?     | 없음(모두 끝남).                                                                                                                    |
| 3. 목표는?             | 개발 서버에서만 화면 왼쪽 아래에 개발자 정보(fps)가 0.5초마다 갱신되어 보이고, 배포판에는 나오지 않습니다. 성능 목표는 60fps입니다. |
| 4. 지금까지 배운 것?   | findings.md 참고                                                                                                                    |
| 5. 완료한 작업은?      | progress.md 참고                                                                                                                    |
