# Feature Specification: 타워 짓기

## Overview

땅에 깔린 정사각형 판 위에 서서 동전을 넣으면 타워(대포)가 솟아오르고, 타워는 가까운 적 무리를 자동으로 쏩니다.

## User Scenarios & Testing (mandatory)

### User Story 1: 타워 짓기

- As: 플레이어는
- I: 판 위에 서서 동전을 넣어 타워를 올릴 수 있다
- So: 돈을 넣는 느낌을 확실히 느끼기 위해

#### Acceptance Scenarios

Scenario 1: **돈 넣기**

- Given: 동전이 있고 주인공이 판 위에 섰을 때
- When: 가만히 서 있으면
- Then: 동전이 하나씩 날아들고 판이 아래에서 위로 차오른다

Scenario 2: **다 차면**

- Given: 낸 돈이 가격에 이르렀을 때
- When: 타워가 올라오면
- Then: 타워가 튕기며 솟아오른다

### User Story 2: 타워의 공격

- As: 플레이어는
- I: 지은 타워가 적 무리를 자동으로 쏘는 것을 볼 수 있다
- So: 타워가 방어에 도움이 되는 것을 느끼기 위해

#### Acceptance Scenarios

Scenario 1: **자동 공격**

- Given: 타워 사거리 안에 적이 있을 때
- When: 시간이 지나면
- Then: 타워가 폭발 안에 적이 많은 쪽으로 대포알을 쏜다

## Functional Requirements (mandatory)

- FR-1: MUST 타워를 짓는 곳은 바닥에 깔린 정사각형 판이다.
- FR-2: MUST 돈을 넣을 때 동전이 날아들고 판이 차오르는 연출이 있다.
- FR-3: MUST 같은 레벨의 타워 가격은 항상 같다.
- FR-4: MUST 타워를 짓는 판은 물 위에 놓이지 않는다.
- FR-5: MUST 타워는 사거리 안의 적 무리를 자동으로 쏜다.
- FR-6: MUST 서 있는 물체와 판의 앞뒤가 맞는다. 판은 항상 아래에 그린다.

## Constraints (mandatory)

- CON-1: MUST 판은 한 변 88이다.
- CON-2: MUST 판에 서면 초당 40개씩 들어간다.
- CON-3: MUST 레벨별 가격은 15, 30, 50, 80, 110이고 타워는 사거리 420, 1.0초마다, 폭발 반지름 64, 피해 1로 쏜다.

## Success Criteria (mandatory)

- SC-1: 판에 서면 동전이 날아들어 판이 차오르고 타워가 솟는 것을 화면으로 확인한다.
- SC-2: 같은 레벨의 가격이 같다(코드 확인).
- SC-3: 타워가 적을 쏘는 것을 테스트로 확인한다.
- SC-4: 판 16곳이 연못과 겹치지 않는다(지형 규칙).
