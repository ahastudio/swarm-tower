# Feature Specification: 적과 이동

## Overview

적이 섬 둘레 사방에서 나타나 흩어지며 본부로 몰려오고, 적마다 체력이 다르며 센 적은 크기와 고리로 구분됩니다.

## User Scenarios & Testing (mandatory)

### User Story 1: 사방에서 몰려오는 적

- As: 플레이어는
- I: 섬 둘레 사방에서 본부로 몰려오는 적을 막을 수 있다
- So: 울타리와 타워로 대응하는 재미를 느끼기 위해

#### Acceptance Scenarios

Scenario 1: **사방에서 옴**

- Given: 적이 나타날 때
- When: 화면을 보면
- Then: 섬 둘레의 여러 방향에서 나타나 본부로 간다

Scenario 2: **울타리 때문에 제한**

- Given: 적이 본부로 갈 때
- When: 마당 울타리가 있으면
- Then: 문으로만 들어오고 울타리를 넘지 못한다

### User Story 2: 센 적

- As: 플레이어는
- I: 웨이브가 갈수록 센 적이 늘고 겉모습으로 알아볼 수 있다
- So: 센 적을 알아보고 대비하기 위해

#### Acceptance Scenarios

Scenario 1: **겉모습**

- Given: 센 적이 나타났을 때
- When: 화면을 보면
- Then: 크기가 크고 발밑에 주황이나 빨강 고리가 있으며 맞으면 체력 막대가 보인다

## Functional Requirements (mandatory)

- FR-1: MUST 적은 길을 따라 오지 않고 섬 둘레 사방에서 본부로 몰려온다.
- FR-2: MUST 적은 울타리, 바다, 연못 때문에 들어오는 것이 제한된다.
- FR-3: MUST 적의 체력은 웨이브가 갈수록 늘고 적마다 다르다.
- FR-4: MUST 센 적은 크기와 고리, 체력 막대로 겉보기에도 세 보인다.
- FR-5: MUST 적은 본부에 닿으면 본부 체력을 1 줄인다.
- FR-6: SHOULD 울타리를 깔대기로 보강하지 않는다.

## Constraints (mandatory)

- CON-1: MUST 칸 크기는 30이고 울타리에서 21 이내는 막힌 칸이다.
- CON-2: MUST 보통, 센 적, 아주 센 적의 비율은 약 73%, 20%, 7%이고 동물은 일곱 종이다.

## Success Criteria (mandatory)

- SC-1: 울타리를 넘어 마당 안으로 들어온 적이 0마리이다(시뮬레이션).
- SC-2: 기본 체력이 웨이브 1은 1, 웨이브 4는 2, 웨이브 6은 3으로 늘어난다(단계 배수는 따로).
- SC-3: 센 적에 고리와 체력 막대가 보인다(화면).
