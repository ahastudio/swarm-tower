# Implementation Plan: 웨이브와 쉬는 시간

## Summary

웨이브가 시간으로 이어지고, 시작과 남은 시간, 남은 적, 화면 밖 적의 방향이 분명하게 보입니다.

## Requirements

1. 웨이브가 있고 플레이어가 알아볼 수 있다.
2. 적을 다 처치하지 않아도 다음 웨이브가 온다.
3. 웨이브 사이에는 새 적이 나오지 않는 쉬는 시간이 있다.
4. 웨이브 시작에 큰 글자를 보인다.
5. 화면 밖의 적이 있는 쪽을 화면 끝 화살표로 알린다.

## Critical Files

### New Files

- 없음

### Modified Files

- `src/sim/updateWaves.ts`: `updateWaves`
- `src/constants.ts`: `BREAK_SECONDS`, `ENEMY_SPRITES`
- `src/render/drawOverlay.ts`: 화살표와 큰 글자
- `src/ui/updateStatusDisplay.ts`: 웨이브 문구

### Reference Files

- 없음

## Architecture

### User Flow

```text
웨이브 시작(큰 글자) → 적이 나옴
            ↓
   다 나오면 쉬는 시간 → 다음 웨이브
```

### Event Flow

```text
1. phase='break' 동안 phaseTime이 줄고 0이 되면 wave를 1 올리고, phase='go'
       ↓
2. toSpawn = 30 + 22 × wave. 초당 (7 + 2 × wave)마리씩 적을 만든다
       ↓
3. 다 나오면 phase='break', phaseTime = BREAK_SECONDS(25)
```

### Domain Model

```text
game.wave, game.phase, game.phaseTime, game.toSpawn, game.spawnAccumulator, game.banner, game.bannerText
```

## Implementation Steps

### Step 1: Simulation Layer - 웨이브 흐름

**Red:** `src/sim/updateWaves.test.ts`

```ts
it('쉬는 시간이 남아 있으면 시간만 흐른다', () => { /* 실패하는 테스트 */ });
it('쉬는 시간이 끝나면 웨이브가 시작되고 알림이 뜬다', () => { /* 실패하는 테스트 */ });
it('다 나오면 쉬는 시간이 되고, 남은 적이 있어도 다음 웨이브가 온다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/updateWaves.ts`

```ts
export default function updateWaves(deltaSeconds: Seconds) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 2: Render Layer - 알림

**Red:** `src/render/drawOverlay.test.ts`

```ts
it('오른쪽 밖의 적은 오른쪽 화면 끝에서 오른쪽을 가리키는 화살표로 알린다', () => { /* 실패하는 테스트 */ });
it('같은 방향의 적이 많을수록 화살표가 진하다', () => { /* 실패하는 테스트 */ });
it('알림은 화면 위쪽 가운데에 큰 글자로 보인다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/render/drawOverlay.ts`

```ts
export default function drawOverlay(environment: RenderEnvironment) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 3: Simulation Layer - 쉬는 시간

**Red:** `src/sim/updateWaves.test.ts`

```ts
it('쉬는 시간이 남아 있으면 시간만 흐른다', () => { /* 실패하는 테스트 */ });
it('다 나오면 쉬는 시간이 되고, 남은 적이 있어도 다음 웨이브가 온다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/updateWaves.ts`

```ts
export default function updateWaves(deltaSeconds: Seconds) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

## Verification

### Build

```bash
pnpm typecheck
pnpm build
```

### Test

`pnpm test`로 단위 테스트를 돌리고, `window.__game`으로 정해진 시나리오를 돌려 상태를 읽고, 화면으로도 확인합니다.

### Manual Test

1. 시작하고 5초 뒤 웨이브 1의 큰 글자를 본다.
2. 적이 남은 채 다음 웨이브가 오는지 본다.
3. 화면 밖 적 쪽에 화살표가 보이는지 본다.

## Considerations

### 기존 코드 재사용

적을 만드는 규칙과 흐름장은 enemy-swarm 문서의 것을 그대로 씁니다.

### 균형

쉬는 시간은 25초이고 웨이브 n은 30 + 22n마리입니다.

### 호환성

기존 기능과 충돌하는 부분은 없습니다.
