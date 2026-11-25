# Findings & Decisions

> **기술적 발견, 중요한 결정이 있을 때마다 이 파일을 즉시 업데이트하세요.**

## Requirements

- MUST 다 지은 타워를 파워업할 수 있다.
- MUST 타워 레벨은 본부 레벨을 넘지 못한다.
- MUST 모자라면 「본부 레벨 N 필요」를 보인다. 「단계」가 아니라 「레벨」이라고 쓴다.
- MUST 파워업하면 폭발 범위, 쏘는 속도, 사거리, 피해가 늘어난다.
- SHOULD 타워 위의 노란 점으로 레벨을 보인다.

## Research Findings

### 코드베이스 구조

- `src/sim`: 갱신(주인공, 웨이브, 적, 전투, 타워, 동전, 본부)
- `src`: 시작과 게임 루프, 숫자 설정
- `src/render`: 그리기(바닥, 서 있는 물체, 연출, 알림)

### 기존 패턴

- 한 프레임은 `update`(상태 갱신) 다음 `draw`(그리기) 순서로 돈다.
- 서 있는 물체는 `add*`가 `scene`에 더하고 발 위치로 앞뒤를 정렬해 그린다.

### 파워업

- 레벨마다 폭발 범위, 쏘는 속도, 사거리, 피해가 늘고 타워 위의 노란 점으로 레벨을 보인다.

## Resources

### 문서

- 같은 폴더의 spec.md와 plan.md

### 코드 참조

- `src/sim/towers.ts`: `powerUp`
- `src/sim/buildSpots.ts`: `buildSpots`의 파워업 갈래
- `src/constants.ts`: `TOWER_MAX_LEVEL`, `TOWER_UPGRADE_COST`
- `src/sim/calculateTowerStats.ts`: `calculateTowerStats`
- `src/render/addTowers.ts`: `addTowers`의 레벨 점과 안내

## Technical Decisions

| Decision                                  | Rationale                                    |
| ----------------------------------------- | -------------------------------------------- |
| 타워를 파워업한다                         | 더 많이 짓는 것 말고도 성장 방법이 필요하다. |
| 타워 레벨은 본부 레벨을 넘지 못한다       | 본부 레벨 업이 성장의 중심이 된다.           |
| 본부 레벨과 같은 「레벨」이라는 말만 쓴다 | 같은 말로 읽혀 혼동이 없다.                  |

## Issues Encountered

기록할 오류가 없습니다.

## Learnings

### 파워업 돈 내기 (2026-11-25)

파워업도 판과 같은 방식(날아드는 동전)으로 돈을 내게 하면 새 조작을 배울 필요가 없다.
