# Findings & Decisions

> **기술적 발견, 중요한 결정이 있을 때마다 이 파일을 즉시 업데이트하세요.**

## Requirements

- MUST 적을 무찌르면 동전이 나온다. 센 적일수록 더 많이 떨어뜨린다.
- MUST 시작할 때 동전은 0이다.
- MUST 동전은 크고 제대로 만들고 튀고 돌고 반짝이는 애니메이션이 있다.
- MUST 앞뒤가 맞는다. 뒤에 있는 것이 앞의 것을 가리지 않는다.
- MUST 동전 수를 화면 오른쪽 위에 보인다.

## Research Findings

### 코드베이스 구조

- `src/sim`: 갱신(주인공, 웨이브, 적, 전투, 타워, 동전, 본부)
- `src/render`: 그리기(바닥, 서 있는 물체, 연출, 알림)
- `src/ui`: 화면 글(동전, 웨이브, 로딩, 게임 오버, fps)
- `src`: 시작과 게임 루프, 숫자 설정

### 기존 패턴

- 한 프레임은 `update`(상태 갱신) 다음 `draw`(그리기) 순서로 돈다.
- 서 있는 물체는 `add*`가 `scene`에 더하고 발 위치로 앞뒤를 정렬해 그린다.

### 동전의 움직임

- 처치한 곳에서 위로 솟고 중력으로 떨어져 한 번 튕긴다. 돌고 반짝인다.

## Resources

### 문서

- 같은 폴더의 spec.md와 plan.md

### 코드 참조

- `src/sim/coins.ts`: `dropCoins`, `updatePellets`
- `src/render/addCoins.ts`: `addCoins`
- `src/ui/updateStatusDisplay.ts`: 동전 수 표시
- `src/constants.ts`: `MAX_PELLETS`

## Technical Decisions

| Decision                             | Rationale                                             |
| ------------------------------------ | ----------------------------------------------------- |
| 시작할 때 동전은 0이다               | 시작부터 돈이 있으면 첫 타워까지의 긴장이 없다.       |
| 동전은 크고 튀고 돌고 반짝인다       | 작게 흩어진 동전은 눈에 띄지 않고 줍는 보상이 약하다. |
| 센 적의 동전은 3개, 아주 센 적은 8개 | 센 적을 잡는 보상을 크게 한다.                        |

## Issues Encountered

기록할 오류가 없습니다.

## Learnings

### 동전의 앞뒤 (2026-11-25)

동전도 서 있는 물체처럼 발 위치로 정렬해야 뒤의 것이 앞의 것을 가리지 않는다.
