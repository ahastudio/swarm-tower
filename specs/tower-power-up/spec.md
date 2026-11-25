# Feature Specification: 타워 파워업

## Overview

다 지은 타워 위에 서서 동전을 내면 타워가 강해지고, 타워 레벨은 본부 레벨을 넘지 못합니다.

## User Scenarios & Testing (mandatory)

### User Story 1: 타워 파워업

- As: 플레이어는
- I: 다 지은 타워 위에서 동전을 내 타워를 강하게 만들 수 있다
- So: 센 적에 대응하기 위해

#### Acceptance Scenarios

Scenario 1: **파워업**

- Given: 본부 레벨이 충분할 때
- When: 타워 위에서 동전을 내면
- Then: 타워 레벨이 오르고 노란 점이 늘어난다

Scenario 2: **본부 레벨이 모자람**

- Given: 본부 레벨 1에서 동전이 충분할 때
- When: 타워 위에 서면
- Then: 타워가 오르지 않고 「본부 레벨 2 필요」가 보인다

## Functional Requirements (mandatory)

- FR-1: MUST 다 지은 타워를 파워업할 수 있다.
- FR-2: MUST 타워 레벨은 본부 레벨을 넘지 못한다.
- FR-3: MUST 모자라면 「본부 레벨 N 필요」를 보인다. 「단계」가 아니라 「레벨」이라고 쓴다.
- FR-4: MUST 파워업하면 폭발 범위, 쏘는 속도, 사거리, 피해가 늘어난다.
- FR-5: SHOULD 타워 위의 노란 점으로 레벨을 보인다.

## Constraints (mandatory)

- CON-1: MUST 최고 레벨은 5이고 드는 동전은 20, 40, 80, 160이다.

## Success Criteria (mandatory)

- SC-1: 본부 레벨 1에서는 동전이 충분해도 타워가 오르지 않고 「본부 레벨 2 필요」가 보인다(테스트).
- SC-2: 본부 레벨 3에서 타워 레벨 3, 레벨 5에서 레벨 5까지 오른다(테스트).
