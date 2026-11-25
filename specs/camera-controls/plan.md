# Implementation Plan: 카메라 조작

## Summary

휠 줌, 오른쪽 버튼 회전과 높낮이, 가운데 버튼 옮기기, 두 손가락 터치가 되고, 카메라를 낮춰도 층이 끊기지 않습니다.

## Requirements

1. 휠로 줌 인, 줌 아웃을 한다.
2. 오른쪽 버튼 끌기 좌우로 회전하고 위아래로 높낮이를 바꾼다.
3. 카메라를 낮추면 층 한 장은 위아래로 좁아지고 층 간격은 늘어난다.
4. 카메라 중심은 주인공 머리다.
5. 바닥에 놓인 그림자와 링의 세로 비율은 카메라 높낮이를 따른다.

## Critical Files

### New Files

- 없음

### Modified Files

- `src/input/installInput.ts`: 휠, 포인터, 키
- `src/input/gesture.ts`: 두 손가락 터치(`startGesture`, `moveGesture`)
- `src/camera/camera.ts`: `camera`
- `src/camera/projection.ts`: `calculateLift`, `calculateHeadLift`
- `src/sprites/drawLayers.ts`: `drawLayers`(층 좁힘과 간격)

### Reference Files

- 없음

## Architecture

### User Flow

```text
플레이어 → 휠 / 오른쪽 버튼 끌기 / 두 손가락 / WASD
            ↓
     camera (rotation, zoom, tilt)
            ↓
   화면 좌표
```

### Event Flow

```text
1. pointermove: 오른쪽 버튼이면 rotation, tilt 갱신
       ↓
2. wheel: zoom 갱신
       ↓
3. 두 손가락이면 거리, 각도, 세로 위치의 변화로 zoom, rotation, tilt 갱신
       ↓
4. drawSprite: tilt에 따라 층을 좁히고 간격을 벌림
```

### Domain Model

```text
camera (x, y, rotation, zoom, tilt, panX, panY, rotationCos, rotationSin)
```

## Implementation Steps

### Step 1: Input Layer - 포인터와 휠

**Red:** `src/input/pointerHandlers.test.ts`

```ts
it('오른쪽 드래그는 카메라를 돌리고 높낮이를 바꾼다', () => { /* 실패하는 테스트 */ });
it('높낮이는 0.35에서 1 사이로 맞춘다', () => { /* 실패하는 테스트 */ });
it('휠을 위로 돌리면 줌이 커지고 기본 동작은 막는다', () => { /* 실패하는 테스트 */ });
it('줌은 0.35에서 3 사이로 맞춘다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/input/pointerHandlers.ts`

```ts
export function onWheel(wheelEvent: WheelEvent) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 2: Sprite Layer - 층 간격

**Red:** `src/sprites/drawLayers.test.ts`

```ts
it('위 층일수록 층 높이 x 간격 x 배율만큼 위로 올린다', () => { /* 실패하는 테스트 */ });
it('배율과 위아래 누름을 적용한다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/sprites/drawLayers.ts`

```ts
export default function drawLayers(context: CanvasRenderingContext2D, stack: Stack, pose: LayerPose) { /* 테스트를 통과하는 최소 구현 */ }
```

**Refactoring:** 필요시 리팩토링

### Step 3: Camera Layer - 카메라 중심과 그림자

**Red:** `src/camera/projection.test.ts`

```ts
it('주인공 그림이 없으면 0이다', () => { /* 실패하는 테스트 */ });
it('주인공의 키 높이만큼이다', () => { /* 실패하는 테스트 */ });
it('카메라 중심은 화면 가운데에 온다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/camera/projection.ts`

```ts
export const calculateHeadLift = () => /* 테스트를 통과하는 최소 구현 */;
```

**Refactoring:** 필요시 리팩토링

### Step 4: Input Layer - 두 손가락 터치

**Red:** `src/input/gesture.test.ts`

```ts
it('12px 미만으로 움직이면 아직 정하지 않고 아무것도 바꾸지 않는다', () => { /* 실패하는 테스트 */ });
it('손가락 사이가 가장 크게 바뀌면 줌과 회전 조작이 된다', () => { /* 실패하는 테스트 */ });
it('손가락을 비틀면 그만큼 카메라가 돈다', () => { /* 실패하는 테스트 */ });
it('함께 위아래로 밀면 높낮이 조작이 되어 tilt가 바뀐다', () => { /* 실패하는 테스트 */ });
```

**Green:** `src/input/gesture.ts`

```ts
export function moveGesture() { /* 테스트를 통과하는 최소 구현 */ }
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

1. 휠로 줌하고 오른쪽 버튼으로 회전과 높낮이를 바꿔 본다.
2. 카메라를 tilt 0.35까지 낮춰 층 사이가 비는지 본다.
3. 두 손가락 터치를 흉내 낸 테스트로 줌, 회전, 높낮이를 확인하고, 실제 터치 기기에서도 써 본다.

## Considerations

### 기존 코드 재사용

층 그림 그리기(`drawLayers`)와 투영(`projection`)을 그대로 쓰고 카메라 값만 더 조작합니다.

### 호환성

시작 카메라 값은 `src/constants.ts`의 `CAMERA_START`에 있고 다시 시작할 때도 적용됩니다.

### 터치

두 손가락 조작의 느낌은 실제 터치 기기에서 써 보고 확인했습니다.
