# Feature Specification: 웨이브와 쉬는 시간

## Overview

웨이브가 시간으로 이어지고, 시작과 남은 시간, 남은 적, 화면 밖 적의 방향이 분명하게 보입니다.

## User Scenarios & Testing (mandatory)

### User Story 1: 웨이브 알아보기

- As: 플레이어는
- I: 지금 웨이브와 다음 웨이브까지 남은 시간을 볼 수 있다
- So: 준비할 시간을 가늠하기 위해

#### Acceptance Scenarios

Scenario 1: **쉬는 시간**

- Given: 웨이브 사이일 때
- When: 화면 왼쪽 위, 생존 시간 아래를 보면
- Then: 「웨이브 N까지 M초」가 보인다

Scenario 2: **시작 알림**

- Given: 웨이브가 시작될 때
- When: 화면을 보면
- Then: 큰 글자 「웨이브 N」이 보인다

Scenario 3: **화면 밖 적**

- Given: 화면 밖에 적이 있을 때
- When: 화면 끝을 보면
- Then: 그쪽에 빨간 화살표가 보인다

### User Story 2: 다음 웨이브

- As: 플레이어는
- I: 적이 남아 있어도 다음 웨이브가 오는 것을 볼 수 있다
- So: 적을 다 잡지 못해도 긴박함이 이어지게 하기 위해

#### Acceptance Scenarios

Scenario 1: **이어짐**

- Given: 한 웨이브의 적이 다 나왔을 때
- When: 쉬는 시간이 지나면
- Then: 적이 남아 있어도 다음 웨이브가 온다

## Functional Requirements (mandatory)

- FR-1: MUST 웨이브가 있고 플레이어가 알아볼 수 있다.
- FR-2: MUST 적을 다 처치하지 않아도 다음 웨이브가 온다.
- FR-3: MUST 웨이브 사이에는 새 적이 나오지 않는 쉬는 시간이 있다.
- FR-4: MUST 웨이브 시작에 큰 글자를 보인다.
- FR-5: SHOULD 화면 밖의 적이 있는 쪽을 화면 끝 화살표로 알린다.

## Constraints (mandatory)

- CON-1: MUST 시작하고 5초 뒤에 웨이브 1이 온다.
- CON-2: MUST 웨이브 n은 30 + 22n마리이다.
- CON-3: MUST 쉬는 시간은 25초이다.

## Success Criteria (mandatory)

- SC-1: 적이 남은 채로 웨이브 2, 3, 4가 이어진다(테스트).
- SC-2: 웨이브 큰 글자와 화면 밖 화살표가 보인다(화면).
- SC-3: 쉬는 동안 새 적이 나오지 않는다(테스트).
