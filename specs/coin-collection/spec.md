# Feature Specification: 동전 떨어뜨리기와 줍기

## Overview

적을 처치한 곳에 동전이 튀어 오르고, 주인공이 가까이 가면 빨려 들어와 오른쪽 위 동전 수가 오릅니다.

## User Scenarios & Testing (mandatory)

### User Story 1: 동전 모으기

- As: 플레이어는
- I: 적을 처치한 곳에 떨어진 동전을 걸어가서 주울 수 있다
- So: 타워를 지을 돈을 얻기 위해

#### Acceptance Scenarios

Scenario 1: **동전이 떨어짐**

- Given: 적을 처치했을 때
- When: 그 위치를 보면
- Then: 동전이 튀어 오르고 돌고 반짝인다

Scenario 2: **줍기**

- Given: 주인공이 동전 가까이 갔을 때
- When: 150 이내에 들어가면
- Then: 동전이 빨려 들어오고 동전 수가 오른다

## Functional Requirements (mandatory)

- FR-1: MUST 적을 무찌르면 동전이 나온다. 센 적일수록 더 많이 떨어뜨린다.
- FR-2: MUST 시작할 때 동전은 0이다.
- FR-3: MUST 동전은 크고 제대로 만들고 튀고 돌고 반짝이는 애니메이션이 있다.
- FR-4: MUST 앞뒤가 맞는다. 뒤에 있는 것이 앞의 것을 가리지 않는다.
- FR-5: MUST 동전 수를 화면 오른쪽 위에 보인다.

## Constraints (mandatory)

- CON-1: MUST 동전 개수 한도는 2500이다.
- CON-2: MUST 줍는 거리는 150과 30이다.

## Success Criteria (mandatory)

- SC-1: 시작 직후 동전이 0이다.
- SC-2: 동전이 튀고 돌고 반짝이는 것을 화면으로 확인한다.
- SC-3: 주워서 동전 수가 오른다(테스트).
