# Findings & Decisions

> **기술적 발견, 중요한 결정이 있을 때마다 이 파일을 즉시 업데이트하세요.**

## Requirements

- MUST 개발자 정보는 개발 서버에서 게임이 시작된 뒤에만 보인다.
- MUST 왼쪽 아래에 「N fps」가 0.5초마다 갱신된다.
- MUST 배포판에는 개발자 정보 요소를 보이지 않고 fps도 세지 않는다.

## Research Findings

### 코드베이스 구조

- `src/ui`: 화면 글(생존 시간, 동전, 웨이브, 로딩, 게임 오버)과 개발자 정보
- `src`: 시작과 게임 루프, 숫자 설정
- `index.html`: 전체 화면 캔버스와 글 요소

### 기존 패턴

- 한 프레임은 `update`(상태 갱신) 다음 `draw`(그리기) 순서로 돈다.
- 개발용 훅(`window.__game`)은 `import.meta.env.DEV`일 때만 켠다.

### 측정

- GPU를 쓰는 Chromium 창에서 웨이브 1~20(적 52~884마리)을 돌린 화면 갱신은 폭 1280px와 390px 모두 59~61fps였고, 한 프레임의 JavaScript 시간은 0.6~3.8ms였습니다. 동전 약 2000개와 적 약 720마리가 함께 있는 가장 무거운 장면은 폭 1280px에서 57fps(JavaScript 18ms), 폭 390px에서 60fps(JavaScript 10ms)였습니다. 타워 없이 웨이브를 올린 가장 나쁜 경우이고, 소프트웨어 렌더링(헤드리스)은 폭 1280px에서 15~28fps로 느립니다.

## Resources

### 문서

- 같은 폴더의 spec.md와 plan.md

### 코드 참조

- `src/ui/tickFps.ts`: `tickFps`
- `src/ui/developerInformation.ts`: `startDeveloperInformation`, `tickDeveloperInformation`
- `src/main.ts`: 루프에서 호출
- `index.html`: `#developer-information`

## Technical Decisions

| Decision                          | Rationale                                                              |
| --------------------------------- | ---------------------------------------------------------------------- |
| fps를 개발자 정보로 둔다          | 플레이어에게 필요한 정보가 아니고 성능을 확인하는 개발자에게 필요하다. |
| 개발 서버에서만 보인다            | 배포판에 개발용 요소를 넣지 않는다. 빌드에서 코드가 빠진다.            |
| 성능 목표는 60fps이다             | 입력 반응과 부드러운 움직임을 위한 기준이다.                           |
| 정보 요소는 `hidden`으로 시작한다 | 타이틀과 로딩 중에는 보이지 않고, 시작한 뒤 켠다.                      |

## Issues Encountered

기록할 오류가 없습니다.

## Learnings

### fps는 GPU 창에서 잰다 (2026-11-25)

헤드리스 브라우저는 소프트웨어로 그려서 큰 화면에서 훨씬 느리다. 화면 갱신 속도는 GPU를 쓰는 브라우저 창에서 재고, 한 프레임의 JavaScript 시간과 화면 갱신 횟수를 함께 본다.
