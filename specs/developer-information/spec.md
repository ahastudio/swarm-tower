# Feature Specification: 개발자 정보 표시

## Overview

개발 서버에서만 화면 왼쪽 아래에 개발자 정보(fps)가 0.5초마다 갱신되어 보이고, 배포판에는 나오지 않습니다. 성능 목표는 60fps입니다.

## User Scenarios & Testing (mandatory)

### User Story 1: 개발자 정보 보기

- As: 개발자는
- I: 개발 서버에서 게임을 열면 fps를 볼 수 있다
- So: 성능 목표인 60fps를 눈으로 확인하기 위해

#### Acceptance Scenarios

Scenario 1: **개발 서버**

- Given: `pnpm dev`로 연 게임에서 시작을 눌렀을 때
- When: 왼쪽 아래를 보면
- Then: 「N fps」가 보이고 0.5초마다 바뀐다

Scenario 2: **타이틀과 로딩**

- Given: 타이틀 화면이나 로딩 화면일 때
- When: 왼쪽 아래를 보면
- Then: 개발자 정보가 보이지 않는다

Scenario 3: **배포판**

- Given: `pnpm build`로 만든 게임에서
- When: 시작을 누르고 왼쪽 아래를 보면
- Then: 개발자 정보가 없다

## Functional Requirements (mandatory)

- FR-1: MUST 개발자 정보는 개발 서버에서 게임이 시작된 뒤에만 보인다.
- FR-2: MUST 왼쪽 아래에 「N fps」가 0.5초마다 갱신된다.
- FR-3: MUST 배포판에는 개발자 정보 요소를 보이지 않고 fps도 세지 않는다.

## Constraints (mandatory)

- CON-1: MUST 성능 목표는 60fps이다.
- CON-2: MUST 갱신 간격은 0.5초이고 그 사이 프레임 수의 평균을 쓴다.

## Success Criteria (mandatory)

- SC-1: 개발 서버에서 왼쪽 아래에 fps가 보이고 바뀐다(테스트, 화면).
- SC-2: 배포판 번들에 개발자 정보 글자가 없다(검색).
- SC-3: 웨이브 1~20(적 52~884마리)에서 59~61fps이다(측정).
