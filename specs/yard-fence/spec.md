# Feature Specification: 마당 울타리

## Overview

본부 마당 둘레에만 울타리가 있고 문은 아래쪽 하나이며, 적도 주인공도 울타리를 넘지 못하고, 본부 레벨이 오르면 마당이 넓어집니다.

## User Scenarios & Testing (mandatory)

### User Story 1: 울타리로 들어오는 길 제한

- As: 플레이어는
- I: 적이 마당의 문으로만 들어오는 것을 볼 수 있다
- So: 울타리로 적을 유도하는 재미를 느끼기 위해

#### Acceptance Scenarios

Scenario 1: **울타리**

- Given: 적이 본부로 올 때
- When: 울타리 쪽으로 오면
- Then: 넘지 못하고 문으로 돌아 들어온다

Scenario 2: **주인공도 못 넘음**

- Given: 주인공이 울타리 쪽으로 걸을 때
- When: 울타리에 닿으면
- Then: 넘지 못하고 미끄러진다

### User Story 2: 마당이 넓어짐

- As: 플레이어는
- I: 본부 레벨이 오르면 마당이 넓어지는 것을 볼 수 있다
- So: 본부가 커지는 느낌을 위해

#### Acceptance Scenarios

Scenario 1: **확장**

- Given: 본부 레벨이 올랐을 때
- When: 마당을 보면
- Then: 울타리가 넓어지고 흐름장이 다시 계산된다

## Functional Requirements (mandatory)

- FR-1: MUST 울타리는 본부 마당에만 있고 맵 중간에 미리 치지 않는다.
- FR-2: MUST 울타리를 깔대기로 보강하지 않는다.
- FR-3: MUST 처음 울타리 입구는 아래쪽이다.
- FR-4: MUST 레벨 업하면 울타리가 조금씩 넓어진다.
- FR-5: MUST 적과 주인공 모두 울타리를 넘지 못한다.
- FR-6: MUST 위쪽과 아래쪽 울타리의 모양과 폭이 같게 보인다.

## Constraints (mandatory)

- CON-1: MUST 울타리 조각 간격은 37.4이다.
- CON-2: MUST 마당은 본부 레벨 n에서 본부 중심으로부터 좌우 165 + 60(n-1), 위 180 + 40(n-1), 아래 195 + 20(n-1)이다.

## Success Criteria (mandatory)

- SC-1: 울타리를 넘어 마당 안으로 들어온 적이 0마리이다(시뮬레이션).
- SC-2: 위쪽 가로 울타리와 아래쪽 가로 울타리의 가로 범위가 같다(화면).
- SC-3: 레벨마다 울타리가 넓어지는 것을 화면으로 확인한다.
