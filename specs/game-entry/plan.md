# Implementation Plan: 게임 진입

## Summary

게임을 열면 타이틀 화면이 보이고, 시작 버튼을 누르면 로딩 화면을 거쳐 게임이 시작됩니다.

## Requirements

1. 게임을 열면 타이틀 화면(제목, 시작 버튼, 디스코드와 GitHub 링크)이 보인다.
2. 로딩 화면은 제목, 진행 막대, 「불러오는 중」 하나만 보인다.
3. 시작을 누르기 전에는 읽기, 게임 루프, 입력, 개발용 훅이 시작되지 않는다.
4. 시작을 누르면 타이틀이 사라지고 로딩 화면을 거쳐 게임이 시작된다.
5. 모바일 세로와 데스크탑 가로 모두에서 쓸 수 있다.

## Critical Files

### New Files

- `src/ui/waitForStart.ts`: 시작 버튼을 기다리고 타이틀을 숨김
- `public/styles/main.css`: 화면 스타일 파일 모음(`base.css`, `hud.css`, `title.css`, `loading.css`, `game-over.css`)

### Modified Files

- `index.html`: 타이틀 마크업과 스타일 링크
- `src/main.ts`: 시작을 기다린 뒤 로딩과 게임 시작
- `src/ui/loading.ts`: `showLoading`, `setLoading`, `hideLoading`
- `src/sprites/assets.ts`: `loadAssets`(읽은 비율을 알림)
- `src/testing/mountDom.ts`: 테스트용 화면

### Reference Files

- `src/ui/domLookup.ts`: `findById`

## Architecture

### User Flow

```text
게임 열기 → 타이틀 화면
        ↓
   「시작」 누르기
        ↓
   로딩 화면 (시트를 읽은 만큼 막대가 오름)
        ↓
   게임 시작
```

### Event Flow

```text
1. main: waitForStart()가 시작 버튼의 click을 기다린다
       ↓
2. waitForStart: 타이틀을 숨기고 resolve
       ↓
3. main: showLoading() 다음 loadGame()과 prepareGame()
       ↓
4. main: hideLoading() 다음 startLoop()와 installDebugHooks()
```

### Domain Model

```text
화면 요소: #title(#start, 링크 둘), #loading(#loading-bar, #loading-message)
상태: 없음(Promise 하나로 순서만 정한다)
```

## Implementation Steps

### Step 1: UI Layer - 타이틀 화면

**Red:** `src/ui/waitForStart.test.ts`

```ts
it('시작 버튼을 누를 때까지 기다리고 타이틀을 숨긴다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/ui/waitForStart.ts`

```ts
export default function waitForStart() { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 2: UI Layer - 로딩 보이기와 진행

**Red:** `src/ui/loading.test.ts`

```ts
it('처음에는 숨겨진 로딩 화면을 표시한다', () => { /* 실패하는 테스트 */ });
it('진행 막대의 너비와 안내 글자를 바꾼다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/ui/loading.ts`

```ts
export function showLoading() { /* 테스트를 통과하는 최소 구현 */ }
export function setLoading(percent: number, message: string) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 3: Sprite Layer - 읽은 만큼 진행

**Red:** `src/sprites/assets.test.ts`

```ts
it('진행은 층이 많은 시트일수록 크게 올라 1에서 끝난다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sprites/assets.ts`

```ts
export async function loadAssets(onProgress: ProgressListener) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 4: UI Layer - 로딩 숨기기

**Red:** `src/ui/loading.test.ts`

```ts
it('서서히 사라진 뒤 로딩 화면을 지운다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/ui/loading.ts`

```ts
export function hideLoading() { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 5: Application Layer - 시작 순서

**Red:** `src/main.test.ts`

```ts
it('시작을 기다리는 동안 로딩과 게임 초기화를 하지 않는다', () => { /* 실패하는 테스트 */ });
it('화면과 입력을 준비하고 읽은 만큼 로딩 막대를 올리며 불러온다', () => { /* 실패하는 테스트 */ });
it('새 게임을 만들고 첫 화면을 그린 뒤 로딩 화면을 숨기고 게임 루프를 시작한다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/main.ts`

```ts
await waitForStart();
showLoading();
await loadGame();
```

**Refactoring:** 필요시 리팩토링

## Verification

### Build

```bash
pnpm typecheck
pnpm build
```

### Test

`pnpm test`로 단위 테스트를 돌리고, 브라우저에서 시작을 누르기 전후의 `window.__game`을 확인합니다.

### Manual Test

1. 폭 360px 세로, 740px 가로, 1280px 화면에서 타이틀을 본다.
2. 디스코드와 GitHub 링크가 새 탭에서 열리는지 본다.
3. 시작을 눌러 로딩 막대가 올라가고 게임이 시작되는지 본다.
4. 움직임 줄이기를 켜고 애니메이션이 멈추는지 본다.

## Considerations

### 기존 코드 재사용

불러오기 순서(`loadGame`)를 그대로 쓰고, 앞에 시작을 기다리는 한 단계와 로딩 화면 보이기를 더합니다.

### 성능

층 그림 시트 36개(0.5MB)를 읽는 시간은 짧아서 로딩 화면은 잠깐 보입니다.

### 호환성

개발용 훅은 시작을 누른 뒤에 생기므로, 브라우저 자동화 스크립트는 먼저 시작 버튼을 눌러야 합니다.
