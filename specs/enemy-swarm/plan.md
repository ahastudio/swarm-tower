# Implementation Plan: 적과 이동

## Summary

적이 섬 둘레 사방에서 나타나 흩어지며 본부로 몰려오고, 적마다 체력이 다르며 센 적은 크기와 고리로 구분됩니다.

## Requirements

1. 적은 길을 따라 오지 않고 섬 둘레 사방에서 본부로 몰려온다.
2. 적은 울타리, 바다, 연못 때문에 들어오는 것이 제한된다.
3. 적의 체력은 웨이브가 갈수록 늘고 적마다 다르다.
4. 센 적은 크기와 고리, 체력 막대로 겉보기에도 세 보인다.
5. 적은 본부에 닿으면 본부 체력을 1 줄인다.

## Critical Files

### New Files

- 없음

### Modified Files

- `src/sim/moveEnemies.ts`: `moveEnemies`
- `src/sim/updateWaves.ts`: 적을 만들 때 단계와 체력을 정함
- `src/world/flow.ts`: 흐름장
- `src/render/addEnemies.ts`: `addEnemies`

### Reference Files

- 없음

## Architecture

### User Flow

```text
적이 섬 둘레에서 나타남
            ↓
   흐름 벡터를 따라 본부로
            ↓
   주인공과 타워가 쏨
```

### Event Flow

```text
1. 적을 만들 때 단계(roll), 체력, 속도를 정한다
       ↓
2. 매 프레임 서 있는 칸의 흐름 벡터로 이동한다
       ↓
3. 막힌 칸이면 한 축만 움직인다
       ↓
4. 본부에 닿으면 체력 -1
```

### Domain Model

```text
Enemy (hp, maxHp, tier, scale, speed, x, y, jitter)
tier 0 보통 / 1 센 적 / 2 아주 센 적
흐름장: 막힌 칸, 본부까지의 거리, 흐름 벡터
```

## Implementation Steps

### Step 1: World Layer - 흐름장

**Red:** `src/world/flow.test.ts`

```ts
it('본부 바로 옆 칸이 목표라서 거리가 0이다', () => { /* 실패하는 테스트 */ });
it('울타리는 막힌 칸이다', () => { /* 실패하는 테스트 */ });
it('문 앞은 열려 있어 마당 밖에서도 본부까지 거리가 구해진다', () => { /* 실패하는 테스트 */ });
it('열린 칸의 흐름 벡터는 단위 길이이고 거리가 줄어드는 쪽을 가리킨다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/world/flow.ts`

```ts
export function buildFlow() { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 2: Simulation Layer - 사방에서 나타남

**Red:** `src/sim/updateWaves.test.ts`

```ts
it('초당 (7 + 2 x 웨이브)마리씩 나온다', () => { /* 실패하는 테스트 */ });
it('지도 가장자리 안쪽에서 나온다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/updateWaves.ts`

```ts
export default function updateWaves(deltaSeconds: Seconds) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 3: Render Layer - 체력과 단계 표시

**Red:** `src/render/addEnemies.test.ts`

```ts
it('센 적은 주황 고리, 아주 센 적은 빨간 고리를 발밑에 깐다', () => { /* 실패하는 테스트 */ });
it('체력이 다 찼으면 막대를 그리지 않는다', () => { /* 실패하는 테스트 */ });
it('맞아서 체력이 줄었으면 머리 위에 막대가 뜨고 남은 만큼 색으로 채운다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/render/addEnemies.ts`

```ts
export default function addEnemies(environment: RenderEnvironment) { /* 테스트를 통과하는 최소 구현 */ }
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

1. 웨이브를 시작해 적이 섬 둘레 여러 방향에서 오는지 본다.
2. 울타리 앞에서 적이 문으로 도는지 본다.
3. 센 적의 고리와 체력 막대를 본다.

## Considerations

### 기존 코드 재사용

서 있는 물체를 모아 정렬하는 `scene`과 층 그림 시트를 그대로 씁니다.

### 성능

적 884마리까지의 부하는 GPU를 쓰는 Chromium 창에서 웨이브 1~20(적 52~884마리)을 돌린 화면 갱신은 폭 1280px와 390px 모두 59~61fps였고, 한 프레임의 JavaScript 시간은 0.6~3.8ms였습니다. 흐름장은 한 번 계산하고 적마다 칸을 읽기만 합니다.

### 호환성

흐름장은 울타리가 바뀔 때(본부 레벨 업) 다시 계산합니다(yard-fence 문서).
