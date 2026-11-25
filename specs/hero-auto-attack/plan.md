# Implementation Plan: 주인공 이동과 자동 공격

## Summary

주인공이 조작에 따라 걷고, 멈추지 않고 가장 가까운 적을 포물선 탄으로 자동으로 쏩니다. 본부 레벨이 오를수록 세집니다.

## Requirements

1. 주인공은 멈추지 않고 자동으로 계속 공격한다.
2. 공격은 원거리 포물선 탄이다.
3. 사거리 안에서 무조건 가장 가까운 적부터 공격한다.
4. 본부 레벨이 오르면 피해, 폭발 범위, 쏘는 속도, 사거리가 늘어난다.
5. 적의 속도로 앞을 겨눈다.

## Critical Files

### New Files

- 없음

### Modified Files

- `src/sim/moveWorker.ts`: `moveWorker`
- `src/sim/attackWithWorker.ts`: `attackWithWorker`
- `src/sim/combat.ts`: `shoot`, `updateShots`
- `src/constants.ts`: `WORKER_*`
- `src/sim/calculateWorkerStats.ts`: `calculateWorkerStats`
- `src/render/addWorker.ts`: `addWorker`

### Reference Files

- 없음

## Architecture

### User Flow

```text
플레이어 → 이동 입력
            ↓
   주인공이 걷는다
            ↓
   사거리 안 가장 가까운 적에게 탄
```

### Event Flow

```text
1. update: 쏘는 간격 wRate가 지나면
       ↓
2. 사거리(`calculateWorkerStats`의 값) 안의 모든 적을 훑어 가장 가까운 것을 고른다
       ↓
3. 적의 속도로 앞을 겨눈 탄을 만든다
       ↓
4. 날아가는 시간 뒤 폭발해 폭발 안 적의 체력을 깎는다
```

### Domain Model

```text
Worker (x, y, 목표 targetX, targetY, 쏘는 간격 cooldown, 걷기 walk, 치기 swing)
Shot (출발, 목표, 시간, 폭발 반지름, 피해)
calculateWorkerStats(house.level)
```

## Implementation Steps

### Step 1: Simulation Layer - 이동과 동작

**Red:** `src/sim/moveWorker.test.ts`

```ts
it('위쪽 키는 화면 위쪽으로 40 앞을 목표로 삼는다', () => { /* 실패하는 테스트 */ });
it('목표 쪽으로 속도 190으로 걷고 걷는 동작이 넘어간다', () => { /* 실패하는 테스트 */ });
it('막히면 가로로만 간다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/moveWorker.ts`

```ts
export default function moveWorker(deltaSeconds: Seconds) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 2: Simulation Layer - 자동 공격

**Red:** `src/sim/attackWithWorker.test.ts`

```ts
it('아직 식지 않았으면 쏘지 않는다', () => { /* 실패하는 테스트 */ });
it('닿는 거리 320 밖의 적은 쏘지 않는다', () => { /* 실패하는 테스트 */ });
it('가장 가까운 적에게 작은 탄을 쏜다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/attackWithWorker.ts`

```ts
export default function attackWithWorker(deltaSeconds: Seconds) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 3: Simulation Layer - 폭발과 피해

**Red:** `src/sim/combat.test.ts`

```ts
it('닿으면 폭발 연출을 남기고 탄이 사라진다', () => { /* 실패하는 테스트 */ });
it('폭발 안의 적만 체력이 깎인다', () => { /* 실패하는 테스트 */ });
it('체력이 다한 적은 죽어서 사라지고 동전을 떨군다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/combat.ts`

```ts
export function updateShots(deltaSeconds: Seconds) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 4: Simulation Layer - 본부 레벨 강화

**Red:** `src/sim/calculateWorkerStats.test.ts`

```ts
it('본부 레벨 1은 기본 값이다', () => { /* 실패하는 테스트 */ });
it('본부 레벨이 오르면 공격이 세진다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/calculateWorkerStats.ts`

```ts
export default function calculateWorkerStats() { /* 테스트를 통과하는 최소 구현 */ }
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

1. 게임을 열어 시작 위치(마당 문 앞)를 본다.
2. WASD와 탭으로 걸어 본다.
3. 적이 여럿일 때 가장 가까운 적부터 맞는지 본다.
4. 본부 레벨 1, 3, 5에서 처치 속도를 비교한다.

## Considerations

### 기존 코드 재사용

탄과 폭발(`combat`)은 타워와 같은 것을 씁니다.

### 호환성

본부 레벨에 따른 강화 값은 `src/sim/calculateWorkerStats.ts`의 `calculateWorkerStats`에 있고 본부 레벨 올리기(headquarters-level-up)와 이어집니다.

### 균형

본부 레벨 1에서 사거리는 320, 쏘는 간격은 0.35초, 폭발 반지름은 40, 피해는 1입니다.
