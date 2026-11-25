# Implementation Plan: 생존 시간과 게임 오버

## Summary

게임은 생존 시간을 보는 게임입니다. 시간은 화면 왼쪽 위에 가장 먼저 보이고, 본부 체력이 0이 되면 게임이 멈추고 「게임 오버」와 생존 시간, 버틴 웨이브가 보이며, 다시 시작을 누를 때까지 그대로 남습니다.

## Requirements

1. 게임이 시작된 뒤 흐른 시간을 「생존 시간 분:초」로 왼쪽 위에 가장 먼저 보인다.
2. 웨이브 표시는 생존 시간 아래에 둔다.
3. 본부 체력이 0이 되면 게임이 멈추고 게임 오버를 띄운다.
4. 게임 오버 화면에 생존 시간(가장 크게), 버틴 웨이브 수, 다시 시작 버튼이 보이고 생존 시간은 다시 시작할 때까지 그대로다.
5. 버튼, Enter, 스페이스로 다시 시작한다.
6. 본부 체력 막대가 보인다.

## Critical Files

### New Files

- `src/ui/formatSurvivalTime.ts`: `formatSurvivalTime`

### Modified Files

- `src/ui/updateStatusDisplay.ts`: 생존 시간 표시
- `src/ui/showGameOver.ts`: `showGameOver`
- `src/ui/installRestart.ts`: `installRestart`
- `src/sim/update.ts`: 체력 0이면 `showGameOver()`, `game.time` 증가
- `src/resetGame.ts`: `resetGame`
- `index.html`: `#survival`, `#over`, `#survival-result`
- `public/styles/hud.css`, `public/styles/game-over.css`: 생존 시간 모양
- `src/render/addHouse.ts`: `addHouse`의 체력 막대

### Reference Files

- `src/game.ts`: `game.time`

## Architecture

### User Flow

```text
게임 시작 → 생존 시간이 오름(왼쪽 위, 가장 먼저)
            ↓
   적이 본부에 닿음 → 체력 감소
            ↓
   체력 0 → 게임 오버(생존 시간, 버틴 웨이브)
            ↓
   다시 시작 → 생존 시간 0:00
```

### Event Flow

```text
1. update: game.time += deltaSeconds (게임 오버 전까지)
       ↓
2. moveEnemies: 본부에 닿으면 hp -= 1
       ↓
3. update: hp <= 0이면 showGameOver()가 생존 시간을 쓰고 갱신을 멈춘다
       ↓
4. restart: resetGame()으로 처음 상태(time 0)
```

### Domain Model

```text
game.time(생존 시간, 초), game.hp, game.over
```

## Implementation Steps

### Step 1: Render Layer - 본부 체력 막대

**Red:** `src/render/addHouse.test.ts`

```ts
it('체력 막대는 어두운 바탕 위에 남은 체력만큼 초록으로 채운다', () => { /* 실패하는 테스트 */ });
it('체력이 음수여도 막대 너비는 0이다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/render/addHouse.ts`

```ts
export default function addHouse(environment: RenderEnvironment) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 2: UI Layer - 생존 시간 표기

**Red:** `src/ui/formatSurvivalTime.test.ts`

```ts
it('처음에는 0:00이다', () => { /* 실패하는 테스트 */ });
it('초는 두 자리로 맞추고 소수는 버린다', () => { /* 실패하는 테스트 */ });
it('60초가 되면 분이 오른다', () => { /* 실패하는 테스트 */ });
it('한 시간이 넘어도 분으로 센다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/ui/formatSurvivalTime.ts`

```ts
export default function formatSurvivalTime(seconds: Seconds) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 3: UI Layer - 생존 시간 표시

**Red:** `src/ui/updateStatusDisplay.test.ts`

```ts
it('게임이 시작된 뒤 흐른 시간을 분:초로 보인다', () => { /* 실패하는 테스트 */ });
it('시작 직후에는 0:00이다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/ui/updateStatusDisplay.ts`

```ts
export default function updateStatusDisplay() { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 4: UI Layer - 게임 오버 화면

**Red:** `src/ui/showGameOver.test.ts`

```ts
it('게임을 멈추고 생존 시간과 몇 웨이브까지 버텼는지 보인다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/ui/showGameOver.ts`

```ts
export default function showGameOver() { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 5: UI Layer - 다시 시작

**Red:** `src/ui/installRestart.test.ts`

```ts
it('다시 시작 버튼을 누르면 새 게임이 시작된다', () => { /* 실패하는 테스트 */ });
it('Enter와 스페이스로도 다시 시작한다', () => { /* 실패하는 테스트 */ });
it('게임이 끝나지 않았으면 눌러도 아무 일이 없다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/ui/installRestart.ts`

```ts
export default function installRestart() { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

## Verification

### Build

```bash
pnpm typecheck
pnpm build
```

### Test

`pnpm test`로 단위 테스트를 돌리고, 개발 서버의 `window.__game`으로 시간을 보내 생존 시간과 게임 오버를 화면으로 확인합니다.

### Manual Test

1. 시작하면 왼쪽 위 첫 줄에 「생존 시간 0:00」이 보이고 오르는지 본다.
2. 콘솔에서 `window.__game.damage(100)`으로 체력을 0으로 만들어 게임 오버와 생존 시간을 본다.
3. 다시 시작을 누르지 않고 기다려도 생존 시간이 그대로인지 본다.
4. 버튼, Enter, 스페이스로 다시 시작하면 0:00으로 돌아가는지 본다.

## Considerations

### 기존 코드 재사용

게임 시간(`game.time`)과 처음 상태로 되돌리는 `resetGame`을 그대로 씁니다.

### 호환성

웨이브 표시의 위치가 생존 시간 아래로 내려갑니다(wave-system 문서). 다시 시작하면 카메라도 시작 모습으로 돌아갑니다(camera-controls 문서).
