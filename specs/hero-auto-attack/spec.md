# Feature Specification: 주인공 이동과 자동 공격

## Overview

주인공이 조작에 따라 걷고, 멈추지 않고 가장 가까운 적을 포물선 탄으로 자동으로 쏩니다. 본부 레벨이 오를수록 세집니다.

## User Scenarios & Testing (mandatory)

### User Story 1: 자동으로 계속 공격

- As: 플레이어는
- I: 주인공이 걷는 동안에도 가장 가까운 적을 자동으로 공격하는 것을 볼 수 있다
- So: 조작을 이동에만 집중하기 위해

#### Acceptance Scenarios

Scenario 1: **가장 가까운 적**

- Given: 사거리 안에 적이 여럿 있을 때
- When: 주인공이 쏘면
- Then: 가장 가까운 적을 겨눈다

Scenario 2: **이동 중 공격**

- Given: 주인공이 걷는 중일 때
- When: 적이 사거리에 들어오면
- Then: 멈추지 않고 쏜다

### User Story 2: 본부 레벨에 따른 강화

- As: 플레이어는
- I: 본부 레벨을 올려 주인공의 공격력을 키울 수 있다
- So: 더 많은 적에 대응하기 위해

#### Acceptance Scenarios

Scenario 1: **레벨 3과 5**

- Given: 같은 적을 상대할 때
- When: 본부 레벨 1, 3, 5를 비교하면
- Then: 레벨이 높을수록 훨씬 빨리 처치한다

## Functional Requirements (mandatory)

- FR-1: MUST 주인공은 멈추지 않고 자동으로 계속 공격한다.
- FR-2: MUST 공격은 원거리 포물선 탄이다.
- FR-3: MUST 사거리 안에서 무조건 가장 가까운 적부터 공격한다.
- FR-4: MUST 본부 레벨이 오르면 피해, 폭발 범위, 쏘는 속도, 사거리가 늘어난다.
- FR-5: MUST 적의 속도로 앞을 겨눈다.
- FR-6: MUST 주인공을 왕으로 만들지 않고 이름과 설정을 만들지 않는다.
- FR-7: MUST 시작할 때 주인공은 본부 마당 문 바로 앞(2220, 1670)에 선다.

## Constraints (mandatory)

- CON-1: MUST 본부 레벨 1에서 사거리는 320, 쏘는 간격은 0.35초, 폭발 반지름은 40, 피해는 1이다.
- CON-2: MUST 막히면 한 축만 움직여 미끄러진다(지형과 울타리의 이동 제한은 yard-fence 문서와 지형 규칙을 따른다).

## Success Criteria (mandatory)

- SC-1: 본부 레벨 3과 5에서 같은 적을 레벨 1보다 훨씬 빨리 처치한다(테스트).
- SC-2: 적이 여럿일 때 가장 가까운 적부터 맞는다.
- SC-3: `pnpm typecheck` 오류 0건.
