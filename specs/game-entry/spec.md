# Feature Specification: 게임 진입

## Overview

게임을 열면 타이틀 화면이 보이고, 시작 버튼을 누르면 로딩 화면을 거쳐 게임이 시작됩니다.

## User Scenarios & Testing (mandatory)

### User Story 1: 타이틀 화면

- As: 플레이어는
- I: 게임을 열면 게임 이름과 시작 버튼과 커뮤니티 링크를 볼 수 있다
- So: 준비가 되면 시작하고 커뮤니티에 들르기 위해

#### Acceptance Scenarios

Scenario 1: **타이틀 보기**

- Given: 게임 주소를 열었을 때
- When: 화면이 나오면
- Then: 「Swarm Tower」 제목, 「시작」 버튼, 「디스코드」와 「GitHub」 링크가 보인다

Scenario 2: **링크 열기**

- Given: 타이틀 화면에서
- When: 「디스코드」나 「GitHub」를 누르면
- Then: 새 탭에서 열리고 게임은 그대로 타이틀에 있다

Scenario 3: **화면 크기**

- Given: 폭 360px 세로 화면, 폭 740px 가로 화면, 폭 1280px 데스크탑 화면에서
- When: 타이틀을 보면
- Then: 잘리거나 겹치는 것이 없다

### User Story 2: 로딩 화면

- As: 플레이어는
- I: 시작을 누른 뒤 불러오는 중인 것을 볼 수 있다
- So: 빈 화면에서 기다리지 않기 위해

#### Acceptance Scenarios

Scenario 1: **로딩 보이기**

- Given: 타이틀 화면에서
- When: 「시작」을 누르면
- Then: 타이틀이 사라지고 진행 막대와 「불러오는 중」이 보인다

Scenario 2: **로딩 끝**

- Given: 로딩 화면이 보일 때
- When: 불러오기가 끝나면
- Then: 로딩 화면이 사라진다

### User Story 3: 게임 시작

- As: 플레이어는
- I: 로딩이 끝나면 바로 게임을 할 수 있다
- So: 내가 정한 때에 게임에 들어가기 위해

#### Acceptance Scenarios

Scenario 1: **게임 시작**

- Given: 로딩 화면이 사라졌을 때
- When: 화면을 보면
- Then: 게임이 돌고 입력이 된다

## Functional Requirements (mandatory)

- FR-1: MUST 게임을 열면 타이틀 화면이 먼저 보인다.
- FR-2: MUST 타이틀 화면에는 「Swarm Tower」 제목, 「시작」 버튼, 「디스코드」 링크, 「GitHub」 링크만 있다.
- FR-3: MUST 두 링크는 새 탭에서 열린다.
- FR-4: MUST 「시작」을 누르면 타이틀이 사라지고 로딩 화면이 나온 뒤 게임이 시작된다.
- FR-5: MUST 타이틀이 떠 있는 동안에는 층 그림을 읽지 않고 게임 루프, 입력, 개발용 훅을 시작하지 않는다.
- FR-6: MUST 개발용 훅은 개발 서버에서만 켜고, 배포판에는 넣지 않는다.
- FR-7: MUST 로딩 화면에는 제목, 진행 막대, 「불러오는 중」이 보이고, 문구는 읽는 대상을 가리키는 말 없이 「불러오는 중」 하나다.
- FR-8: MUST 읽기와 첫 화면 그리기가 끝나면 로딩 화면이 사라지고 게임이 시작된다.
- FR-9: SHOULD 타이틀의 제목 글자와 시작 버튼, 로딩 화면의 제목 글자와 「불러오는 중」에 부드러운 움직임을 준다. 움직임 줄이기 설정에서는 멈춘다.

## Constraints (mandatory)

- CON-1: MUST 타이틀은 모바일 세로 화면과 데스크탑 가로 화면 모두에서 쓸 수 있다. 버튼과 링크의 터치 영역은 48px 이상이다.
- CON-2: MUST 진행 막대는 읽은 층 수에 비례해 5%에서 90%까지 조금씩 오르고, 첫 화면을 그리면 100%가 된다.
- CON-3: MUST 키보드 단축키는 만들지 않는다. 버튼은 기본 버튼이라 Tab과 Enter는 브라우저가 처리한다.

## Success Criteria (mandatory)

- SC-1: 폭 360px, 740px, 1280px 화면에서 타이틀이 잘리거나 겹치지 않는다(화면).
- SC-2: 시작을 누르기 전에는 `window.__game`이 없고, 누른 뒤 게임이 시작된다(테스트).
- SC-3: 시작을 누르면 로딩 막대가 읽은 층 수에 맞춰 오르다 100%가 되고 사라진다(테스트, 화면).
- SC-4: 로딩 문구는 「불러오는 중」 하나이다.
