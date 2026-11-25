# Implementation Plan: 본부와 본부 레벨 업

## Summary

본부 집이 레벨 5까지 커지고, 레벨이 오를 때마다 타워를 지을 곳이 세 곳씩 늘어나며, 레벨이 집 위에 보입니다.

## Requirements

1. 본부는 성이 아니라 집이고 레벨이 오르면 커진다.
2. 본부는 섬 가운데에 있다.
3. 처음에는 타워 곳 3곳만 열려 있고 모두 지으면 본부를 레벨 업할 수 있으며 레벨 업하면 타워 곳이 늘어난다.
4. 본부 위에 레벨을 「레벨 N」으로 보인다.
5. 레벨 업하면 울타리 마당이 넓어진다(yard-fence 문서).

## Critical Files

### New Files

- 없음

### Modified Files

- `src/sim/headquarters.ts`: `syncUpPad`, `levelUp`
- `src/constants.ts`: `HOUSE_X`, `HOUSE_Y`, `UPGRADE_COST`, `UPGRADE_PAD`, `SPOT_GROUPS`
- `src/render/addHouse.ts`: `addHouse`
- `src/sim/openGroup.ts`: `openGroup`

### Reference Files

- 없음

## Architecture

### User Flow

```text
타워 3곳을 짓는다
            ↓
   마당 안에 「본부」 판이 나타난다
            ↓
   동전을 채운다 → 본부 레벨 업
```

### Event Flow

```text
1. 열린 판이 모두 isBuilt이면 syncUpPad가 본부 판(isUpgrade)을 만든다
       ↓
2. 본부 판에 UPGRADE_COST[level]만큼 채우면 levelUp
       ↓
3. house.level++, 마당 확장, 흐름장 다시 계산, 새 판 3곳
```

### Domain Model

```text
house (x, y, hp, level)
SPOT_GROUPS[레벨] = 타워 곳 3곳 (x, y, 가격)
```

## Implementation Steps

### Step 1: Render Layer - 본부 집

**Red:** `src/render/addHouse.test.ts`

```ts
it('레벨에 맞는 집과 그림자를 그린다', () => { /* 실패하는 테스트 */ });
it('키운 직후에는 출렁이며 커졌다 작아진다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/render/addHouse.ts`

```ts
export default function addHouse(environment: RenderEnvironment) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 2: Simulation Layer - 타워 곳 확장

**Red:** `src/sim/headquarters.test.ts`

```ts
it('다 지으면 본부를 키우는 판이 나타난다', () => { /* 실패하는 테스트 */ });
it('본부 레벨이 오르고 출렁이는 연출이 다시 시작된다', () => { /* 실패하는 테스트 */ });
it('마당이 넓어진다', () => { /* 실패하는 테스트 */ });
it('새 레벨의 타워 판 세 곳이 열린다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/headquarters.ts`

```ts
export function levelUp() { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 3: Render Layer - 레벨 표시

**Red:** `src/render/addHouse.test.ts`

```ts
it('집 위에 레벨을 윤곽 글자로 보인다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/render/addHouse.ts`

```ts
export default function addHouse(environment: RenderEnvironment) { /* 테스트를 통과하는 최소 구현 */ }
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

1. 타워 3곳을 지어 본부 판이 나타나는지 본다.
2. 본부 판을 채워 집이 커지고 레벨이 오르는지 본다.
3. 새 타워 곳 3곳이 열리는지 본다.

## Considerations

### 기존 코드 재사용

타워 판의 동전 넣기(`buildSpots`)를 본부 판에도 그대로 씁니다.

### 호환성

마당 확장은 yard-fence, 주인공 강화는 hero-auto-attack 문서와 이어집니다.

### 균형

레벨 업 비용은 60, 120, 200, 300이고 집 크기는 2x1, 2x2, 3x2, 3x3, 4x3칸입니다.
