# Implementation Plan: 타워 짓기

## Summary

땅에 깔린 정사각형 판 위에 서서 동전을 넣으면 타워(대포)가 솟아오르고, 타워는 가까운 적 무리를 자동으로 쏩니다.

## Requirements

1. 타워를 짓는 곳은 바닥에 깔린 정사각형 판이다.
2. 돈을 넣을 때 동전이 날아들고 판이 차오르는 연출이 있다.
3. 같은 레벨의 타워 가격은 항상 같다.
4. 타워를 짓는 판은 물 위에 놓이지 않는다.
5. 타워는 사거리 안의 적 무리를 자동으로 쏜다.

## Critical Files

### New Files

- 없음

### Modified Files

- `src/sim/buildSpots.ts`: `buildSpots`
- `src/sim/towers.ts`: `attackWithTowers`, `createTower`
- `src/world/spots.ts`: `createSpot`
- `src/constants.ts`: `SPOT_GROUPS`, `SPOT_HALF`
- `src/render/drawSpotPads.ts`: 판 그리기
- `src/render/addTowers.ts`: `addTowers`
- `src/render/addSpotPrices.ts`: `addSpotPrices`
- `src/render/drawEffects.ts`: 날아드는 동전

### Reference Files

- 없음

## Architecture

### User Flow

```text
적 처치 → 동전 → 판 위에 선다
            ↓
   동전이 날아들어 판이 차오른다
            ↓
   타워가 솟고 적을 쏜다
```

### Event Flow

```text
1. 주인공이 판 위에 서면 flies(날아드는 동전)가 판으로 간다
       ↓
2. paid가 cost에 이르면 createTower로 타워를 만들고 솟는 연출
       ↓
3. attackWithTowers가 가까운 적 무리를 골라 쏜다
```

### Domain Model

```text
Spot (x, y, cost, paid, isBuilt, tower?, isUpgrade?)
Tower (level, damage, blast, rate, range, powerUpPaid)
```

## Implementation Steps

### Step 1: Render Layer - 판

**Red:** `src/render/drawSpotPads.test.ts`

```ts
it('아직 안 지은 판만 그리고 다 지은 판은 건너뛴다', () => { /* 실패하는 테스트 */ });
it('그림자, 판 바닥, 낸 동전만큼 차오른 칸을 차례로 채운다', () => { /* 실패하는 테스트 */ });
it('나타난 직후에는 작게 시작해 0.35초 동안 커진다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/render/drawSpotPads.ts`

```ts
export default function drawSpotPads(context: CanvasRenderingContext2D) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 2: Simulation Layer - 돈 넣기

**Red:** `src/sim/buildSpots.test.ts`

```ts
it('동전이 날아가는 연출이 하나씩 생기고 시간이 조금씩 어긋난다', () => { /* 실패하는 테스트 */ });
it('다 내면 타워가 지어지고 고리 연출이 생긴다', () => { /* 실패하는 테스트 */ });
it('동전이 모자라면 있는 만큼만 낸다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/buildSpots.ts`

```ts
export default function buildSpots(deltaSeconds: Seconds) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 3: World Layer - 가격

**Red:** `src/world/spots.test.ts`

```ts
it('아직 아무것도 내지 않은 타워 판을 만든다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/world/spots.ts`

```ts
export const createSpot = (point: Point, cost: number): Spot => /* 테스트를 통과하는 최소 구현 */;
```

**Refactoring:** 필요시 리팩토링

### Step 4: Simulation Layer - 타워의 공격

**Red:** `src/sim/towers.test.ts`

```ts
it('적을 향해 큰 탄을 쏘고 다시 식는다', () => { /* 실패하는 테스트 */ });
it('폭발이 가장 많이 닿는 무리 쪽을 고른다', () => { /* 실패하는 테스트 */ });
it('타워 여럿이 각자 쏜다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/towers.ts`

```ts
export function attackWithTowers(deltaSeconds: Seconds) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 5: World Layer - 판 위치

**Red:** 판 중심과 연못 가장자리 사이 거리를 숫자로 재어 겹침이 없는지 확인한다.

**Green:** `src/constants.ts`

```ts
export const PONDS = POND_OFFSETS.map(/* 테스트를 통과하는 최소 구현 */);
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

1. 판 위에 서서 동전이 날아들고 판이 차오르는지 본다.
2. 타워가 솟는 연출을 본다.
3. 레벨마다 세 곳의 가격이 같은지 본다.
4. 타워가 적 무리를 쏘는지 본다.

## Considerations

### 기존 코드 재사용

탄과 폭발(`combat`)과 서 있는 물체 정렬(`scene`)을 주인공 공격과 같이 씁니다.

### 호환성

타워를 지을 수 있는 곳이 늘어나는 규칙은 headquarters-level-up, 파워업은 tower-power-up 문서에 있습니다.

### 균형

가격은 15, 30, 50, 80, 110이고 타워는 사거리 420, 1.0초마다 쏩니다.
