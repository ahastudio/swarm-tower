# Feature Specification: 본부와 본부 레벨 업

## Overview

본부 집이 레벨 5까지 커지고, 레벨이 오를 때마다 타워를 지을 곳이 세 곳씩 늘어나며, 레벨이 집 위에 보입니다.

## User Scenarios & Testing (mandatory)

### User Story 1: 본부 키우기

- As: 플레이어는
- I: 타워 곳을 모두 지은 뒤 본부를 레벨 업해 새 타워 곳을 열 수 있다
- So: 레벨 업을 계속해야 타워를 많이 만드는 구조를 즐기기 위해

#### Acceptance Scenarios

Scenario 1: **본부 판**

- Given: 열린 타워 곳 세 곳을 모두 지었을 때
- When: 마당 안을 보면
- Then: 파란 「본부」 판이 나타난다

Scenario 2: **레벨 업**

- Given: 본부 판에 동전을 채웠을 때
- When: 본부를 보면
- Then: 집이 커지고 레벨 표시가 오르며 새 타워 곳 세 곳이 열린다

## Functional Requirements (mandatory)

- FR-1: MUST 본부는 성이 아니라 집이고 레벨이 오르면 커진다.
- FR-2: MUST 본부는 섬 가운데에 있다.
- FR-3: MUST 처음에는 타워 곳 3곳만 열려 있고 모두 지으면 본부를 레벨 업할 수 있으며 레벨 업하면 타워 곳이 늘어난다.
- FR-4: MUST 본부 위에 레벨을 「레벨 N」으로 보인다.
- FR-5: MUST 레벨 업하면 울타리 마당이 넓어진다(yard-fence 문서).

## Constraints (mandatory)

- CON-1: MUST 본부 레벨은 5까지이다.
- CON-2: MUST 본부 레벨 올리는 동전은 60, 120, 200, 300이다.
- CON-3: MUST 집 크기는 레벨 순서대로 2x1, 2x2, 3x2, 3x3, 4x3칸이다.

## Success Criteria (mandatory)

- SC-1: 타워 3개를 짓고 본부 판이 나타나 레벨 2가 되고 새 타워 곳 3곳이 열린다(테스트).
- SC-2: 본부 위에 「레벨 N」이 보인다(화면).
