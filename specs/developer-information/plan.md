# Implementation Plan: 개발자 정보 표시

## Summary

개발 서버에서만 화면 왼쪽 아래에 개발자 정보(fps)가 0.5초마다 갱신되어 보이고, 배포판에는 나오지 않습니다. 성능 목표는 60fps입니다.

## Requirements

1. 개발 서버에서 게임이 시작되면 왼쪽 아래에 fps를 0.5초마다 보인다.
2. 타이틀과 로딩 중에는 보이지 않는다.
3. 배포판에는 요소를 숨기고 fps도 세지 않는다.
4. 성능은 60fps를 목표로 한다.

## Critical Files

### New Files

- `src/ui/developerInformation.ts`: `startDeveloperInformation`, `tickDeveloperInformation`

### Modified Files

- `src/ui/tickFps.ts`: `tickFps`
- `src/main.ts`: 루프에서 `tickDeveloperInformation` 호출
- `index.html`: `#developer-information`
- `public/styles/hud.css`: `#developer-information`

### Reference Files

- `src/ui/domLookup.ts`: `findById`

## Architecture

### User Flow

```text
개발 서버에서 시작 → 개발자 정보가 보임
        ↓
   0.5초마다 fps 갱신
```

### Event Flow

```text
1. main: startLoop가 startDeveloperInformation를 부른다
       ↓
2. developerInformation: 개발 서버면 요소를 보이고 fps 세기를 시작한다
       ↓
3. main: 프레임마다 tickDeveloperInformation를 부른다
       ↓
4. tickFps: 0.5초가 지나면 「N fps」를 쓴다
```

### Domain Model

```text
counter (frames, since)
```

## Implementation Steps

### Step 1: UI Layer - fps 세기

**Red:** `src/ui/tickFps.test.ts`

```ts
it('0.5초가 지나기 전에는 표시를 바꾸지 않는다', () => { /* 실패하는 테스트 */ });
it('0.5초마다 그동안의 프레임 수로 fps를 표시한다', () => { /* 실패하는 테스트 */ });
it('표시한 뒤에는 처음부터 다시 센다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/ui/tickFps.ts`

```ts
export default function tickFps(now: number) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 2: UI Layer - 개발 서버에서만 보이기

**Red:** `src/ui/developerInformation.test.ts`

```ts
it('시작하면 개발자 정보가 보이고 fps를 센다', () => { /* 실패하는 테스트 */ });
it('개발자 정보를 보이지 않고 fps도 세지 않는다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/ui/developerInformation.ts`

```ts
export function startDeveloperInformation(now: number) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

## Verification

### Build

```bash
pnpm typecheck
pnpm build
```

### Test

`pnpm test`로 단위 테스트를 돌리고, 개발 서버와 배포 번들을 열어 개발자 정보가 보이는지 확인합니다.

### Manual Test

1. `pnpm dev`로 열어 시작을 누르고 왼쪽 아래 fps가 0.5초마다 바뀌는지 본다.
2. 웨이브를 올려 가며(적 800마리 이상, 동전 약 2000개) 화면 갱신이 60fps 안팎인지 본다.
3. 배포 번들(`dist`)에 개발자 정보가 없는지 본다.

## Considerations

### 기존 코드 재사용

게임 루프(`main.ts`)에서 프레임마다 한 번 부르기만 합니다.

### 성능

GPU를 쓰는 Chromium 창에서 웨이브 1~20(적 52~884마리)을 돌린 화면 갱신은 폭 1280px와 390px 모두 59~61fps였고, 한 프레임의 JavaScript 시간은 0.6~3.8ms였습니다. 동전 약 2000개와 적 약 720마리가 함께 있는 가장 무거운 장면은 폭 1280px에서 57fps(JavaScript 18ms), 폭 390px에서 60fps(JavaScript 10ms)였습니다. 타워 없이 웨이브를 올린 가장 나쁜 경우이고, 소프트웨어 렌더링(헤드리스)은 폭 1280px에서 15~28fps로 느립니다.

### 호환성

개발용 훅(`window.__game`)과 같이 개발 서버에서만 켜집니다.
