# Implementation Plan: 마당 울타리

## Summary

본부 마당 둘레에만 울타리가 있고 문은 아래쪽 하나이며, 적도 주인공도 울타리를 넘지 못하고, 본부 레벨이 오르면 마당이 넓어집니다.

## Requirements

1. 울타리는 본부 마당에만 있고 맵 중간에 미리 치지 않는다.
2. 울타리를 깔대기로 보강하지 않는다.
3. 처음 울타리 입구는 아래쪽이다.
4. 레벨 업하면 울타리가 조금씩 넓어진다.
5. 적과 주인공 모두 울타리를 넘지 못한다.

## Critical Files

### New Files

- 없음

### Modified Files

- `src/world/yard.ts`: `calculateYard`, `FENCES`, `fencePieces`
- `src/sim/moveWorker.ts`: 울타리에서 한 축만 미끄러짐
- `src/world/flow.ts`: 울타리 칸 막기
- `src/render/addFences.ts`: `addFences`

### Reference Files

- 없음

## Architecture

### User Flow

```text
본부 레벨 업 → 마당이 넓어짐
            ↓
   울타리 선분 다시 계산
            ↓
   흐름장 다시 계산
```

### Event Flow

```text
1. rebuildFences: 마당과 선분 5개를 만든다
       ↓
2. buildFencePieces: 조각을 놓는다
       ↓
3. buildFlow: 울타리 칸을 막는다
```

### Domain Model

```text
YARD = calculateYard(level), 문 = 본부 중심에서 좌우 50
FENCES = 마당 선분 5개, fencePieces = 조각 위치와 방향
```

## Implementation Steps

### Step 1: World Layer - 마당과 문

**Red:** `src/world/yard.test.ts`

```ts
it('레벨 1 마당은 본부 둘레의 정해진 크기다', () => { /* 실패하는 테스트 */ });
it('레벨이 오를 때마다 사방으로 넓어진다', () => { /* 실패하는 테스트 */ });
it('울타리는 위, 왼쪽, 오른쪽, 문 양옆 아래 다섯 선분이다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/world/yard.ts`

```ts
export const calculateYard = (level: number) => /* 테스트를 통과하는 최소 구현 */;
```

**Refactoring:** 필요시 리팩토링

### Step 2: World Layer - 조각 놓기

**Red:** `src/world/yard.test.ts`

```ts
it('선분마다 간격에 맞는 개수의 조각을 놓는다', () => { /* 실패하는 테스트 */ });
it('위쪽 선분의 첫 조각은 구간 시작에서 반 칸 들어간 곳이고 방향은 -90도다', () => { /* 실패하는 테스트 */ });
it('다시 만들면 이전 조각을 지운다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/world/yard.ts`

```ts
export function buildFencePieces() { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 3: Simulation Layer - 마당 확장

**Red:** `src/world/yard.test.ts`

```ts
it('본부 레벨에 맞춰 마당을 다시 만든다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sim/headquarters.ts`

```ts
export function rebuildYard() { /* 테스트를 통과하는 최소 구현 */ }
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

1. 적이 문으로만 들어오는지 본다.
2. 주인공이 울타리를 못 넘는지 본다.
3. 위쪽과 아래쪽 가로 울타리의 폭이 같은지 본다.
4. 본부 레벨마다 마당이 넓어지는지 본다.

## Considerations

### 기존 코드 재사용

조각 그리기는 서 있는 물체 정렬(`scene`)을 그대로 씁니다.

### 호환성

마당이 바뀌면 흐름장을 다시 계산합니다(enemy-swarm 문서).
