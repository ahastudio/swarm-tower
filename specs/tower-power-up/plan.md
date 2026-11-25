# Implementation Plan: 타워 파워업

## Summary

다 지은 타워 위에 서서 동전을 내면 타워가 강해지고, 타워 레벨은 본부 레벨을 넘지 못합니다.

## Requirements

1. 다 지은 타워를 파워업할 수 있다.
2. 타워 레벨은 본부 레벨을 넘지 못한다.
3. 모자라면 「본부 레벨 N 필요」를 보인다. 「단계」가 아니라 「레벨」이라고 쓴다.
4. 파워업하면 폭발 범위, 쏘는 속도, 사거리, 피해가 늘어난다.
5. 타워 위의 노란 점으로 레벨을 보인다.

## Critical Files

### New Files

- 없음

### Modified Files

- `src/sim/towers.ts`: `powerUp`
- `src/sim/buildSpots.ts`: `buildSpots`의 파워업 갈래
- `src/constants.ts`: `TOWER_MAX_LEVEL`, `TOWER_UPGRADE_COST`
- `src/sim/calculateTowerStats.ts`: `calculateTowerStats`
- `src/render/addTowers.ts`: `addTowers`의 레벨 점과 안내

### Reference Files

- 없음

## Architecture

### User Flow

```text
다 지은 타워 위에 선다
            ↓
   동전을 낸다 → 타워 레벨 +1
            ↓
   본부 레벨보다 높으면 막힘
```

### Event Flow

```text
1. 타워 레벨 < min(TOWER_MAX_LEVEL, 본부 레벨)이면 동전이 날아든다
       ↓
2. powerUpPaid가 TOWER_UPGRADE_COST[level - 1]에 이르면 powerUp
       ↓
3. 폭발, 간격, 사거리, 피해 갱신
```

### Domain Model

```text
Tower (level, damage, blast, rate, range, powerUpPaid)
TOWER_UPGRADE_COST = [20, 40, 80, 160]
```

## Implementation Steps

### Step 1: Simulation Layer - 파워업

**Red:** `src/sim/towers.test.ts`

```ts
it('레벨이 오르고 낸 동전이 0이 되고 능력이 세진다', () => { /* 실패하는 테스트 */ });
it('고리 연출이 생긴다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/towers.ts`

```ts
export function powerUp(tower: Tower) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 2: Simulation Layer - 본부 레벨 제한

**Red:** `src/sim/buildSpots.test.ts`

```ts
it('본부 레벨 안에서 타워 위에 서서 동전을 내면 파워업한다', () => { /* 실패하는 테스트 */ });
it('타워 레벨은 본부 레벨을 넘지 못한다', () => { /* 실패하는 테스트 */ });
it('최고 레벨 타워는 더 올리지 못한다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/buildSpots.ts`

```ts
export default function buildSpots(deltaSeconds: Seconds) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 3: Render Layer - 표시

**Red:** `src/render/addTowers.test.ts`

```ts
it('레벨 1에는 점이 없다', () => { /* 실패하는 테스트 */ });
it('레벨이 오를 때마다 점이 하나씩 늘어 가운데를 맞춰 늘어선다', () => { /* 실패하는 테스트 */ });
it('본부 레벨이 모자라면 가까이 갔을 때 먼저 본부를 올리라고 알린다', () => { /* 실패하는 테스트 */ });
it('본부 레벨이 넉넉하면 파워업에 드는 동전을 보인다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/render/addTowers.ts`

```ts
export default function addTowers(environment: RenderEnvironment) { /* 테스트를 통과하는 최소 구현 */ }
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

1. 다 지은 타워 위에서 동전을 내 레벨이 오르는지 본다.
2. 본부 레벨 1에서 「본부 레벨 2 필요」가 보이는지 본다.
3. 타워 위의 노란 점이 레벨만큼 늘어나는지 본다.

## Considerations

### 기존 코드 재사용

판의 동전 넣기(`buildSpots`)를 그대로 써서 새 조작이 없습니다.

### 호환성

파워업 값은 `src/sim/towers.ts`의 `powerUp`과 `src/sim/calculateTowerStats.ts`의 `calculateTowerStats`에 있습니다.
