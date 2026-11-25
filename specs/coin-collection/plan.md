# Implementation Plan: 동전 떨어뜨리기와 줍기

## Summary

적을 처치한 곳에 동전이 튀어 오르고, 주인공이 가까이 가면 빨려 들어와 오른쪽 위 동전 수가 오릅니다.

## Requirements

1. 적을 무찌르면 동전이 나온다. 센 적일수록 더 많이 떨어뜨린다.
2. 시작할 때 동전은 0이다.
3. 동전은 크고 제대로 만들고 튀고 돌고 반짝이는 애니메이션이 있다.
4. 앞뒤가 맞는다. 뒤에 있는 것이 앞의 것을 가리지 않는다.
5. 동전 수를 화면 오른쪽 위에 보인다.

## Critical Files

### New Files

- 없음

### Modified Files

- `src/sim/coins.ts`: `dropCoins`, `updatePellets`
- `src/render/addCoins.ts`: `addCoins`
- `src/ui/updateStatusDisplay.ts`: 동전 수 표시
- `src/constants.ts`: `MAX_PELLETS`

### Reference Files

- 없음

## Architecture

### User Flow

```text
적 처치 → 동전이 떨어짐
            ↓
   주인공이 줍는다 → 동전 수 증가
```

### Event Flow

```text
1. 적이 죽으면 pellets에 동전을 만든다
       ↓
2. 150 이내면 빨려 들어오고 30 이내면 coins++
       ↓
3. 동전 수 표시가 커졌다 돌아온다
```

### Domain Model

```text
Pellet (x, y, velocityX, velocityY, z, velocityZ, phase, age)
game.coins, game.pulse
```

## Implementation Steps

### Step 1: Simulation Layer - 동전 입자

**Red:** `src/sim/coins.test.ts`

```ts
it('센 적일수록 동전을 더 떨군다', () => { /* 실패하는 테스트 */ });
it('난수를 정해진 순서로 써서 동전 값을 정한다', () => { /* 실패하는 테스트 */ });
it('동전이 너무 많으면 더 만들지 않고 난수도 쓰지 않는다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/coins.ts`

```ts
export function dropCoins(enemy: Enemy) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 2: Simulation Layer - 줍기

**Red:** `src/sim/coins.test.ts`

```ts
it('주인공이 150 안에 있으면 빨려 든다', () => { /* 실패하는 테스트 */ });
it('30 안에 들어오면 주인공이 동전을 얻는다', () => { /* 실패하는 테스트 */ });
it('거리는 움직이기 전 위치로 잰다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/coins.ts`

```ts
export function updatePellets(deltaSeconds: Seconds) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 3: Render Layer - 동전 그리기

**Red:** `src/render/addCoins.test.ts`

```ts
it('동전마다 화면 안에서만 놓는다', () => { /* 실패하는 테스트 */ });
it('나타난 지 0.15초가 안 되면 작게 시작해 커진다', () => { /* 실패하는 테스트 */ });
it('앞면이 보이면 가장자리, 테두리, 앞면, 무늬를 차례로 그린다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/render/addCoins.ts`

```ts
export default function addCoins(environment: RenderEnvironment) { /* 테스트를 통과하는 최소 구현 */ }
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

1. 적을 처치해 동전이 튀고 도는지 본다.
2. 주인공이 다가가면 동전이 빨려 드는지 본다.
3. 시작할 때 동전이 0인지 본다.

## Considerations

### 기존 코드 재사용

서 있는 물체를 모아 정렬하는 `scene`을 그대로 쓰고 동전도 같은 방식으로 더합니다.

### 성능

동전은 최대 2500개입니다. 동전 약 2000개와 적 약 720마리가 함께 있는 장면에서 화면 갱신은 폭 1280px에서 57fps, 폭 390px에서 60fps였습니다.

### 호환성

기존 기능과 충돌하는 부분은 없습니다.
