import { beforeEach, describe, expect, it, vi } from 'vitest';
import camera from '../camera/camera';
import view from '../camera/view';
import game from '../game';
import { prepareFreshGame } from '../testing/freshGame';
import {
  onPointerDown,
  onPointerLift,
  onPointerMove,
  onWheel,
} from './pointerHandlers';
import pointerState from './pointerState';

type Initialize = Partial<{
  pointerId: number;
  pointerType: string;
  button: number;
  clientX: number;
  clientY: number;
}>;

const createPointer = (initialize: Initialize = {}) =>
  ({
    pointerId: 1,
    pointerType: 'mouse',
    button: 0,
    clientX: 500,
    clientY: 300,
    ...initialize,
  }) as PointerEvent;

beforeEach(() => {
  prepareFreshGame();
  view.canvas.setPointerCapture = vi.fn();
  pointerState.mode = 'none';
  Object.assign(pointerState, { lastX: 500, lastY: 300 });
  pointerState.touches.clear();
  Object.assign(camera, {
    zoom: 1,
    rotation: 0,
    tilt: 0.8,
    panX: 0,
    panY: 0,
    rotationCos: 1,
    rotationSin: 0,
  });
  Object.assign(game.worker, {
    x: 2000,
    y: 1500,
    targetX: 2000,
    targetY: 1500,
  });
});

describe('onPointerDown', () => {
  it('포인터를 붙잡고 위치를 기억한다', () => {
    onPointerDown(createPointer({ clientX: 120, clientY: 80 }));
    expect(view.canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect([pointerState.lastX, pointerState.lastY]).toEqual([120, 80]);
  });

  it('왼쪽 버튼은 이동이라 누른 곳으로 목표를 옮긴다', () => {
    onPointerDown(createPointer({ clientX: 500, clientY: 300 }));
    expect(pointerState.mode).toBe('move');
    expect(game.worker.targetX).not.toBe(2000);
  });

  it('오른쪽 버튼은 회전, 가운데 버튼은 이동(pan)이다', () => {
    onPointerDown(createPointer({ button: 2 }));
    expect(pointerState.mode).toBe('rotate');
    onPointerDown(createPointer({ button: 1 }));
    expect(pointerState.mode).toBe('pan');
    expect(game.worker.targetX).toBe(2000);
  });

  it('터치 한 손가락은 이동이다', () => {
    onPointerDown(createPointer({ pointerType: 'touch' }));
    expect(pointerState.mode).toBe('move');
    expect(pointerState.touches.size).toBe(1);
  });

  it('두 번째 손가락이 닿으면 두 손가락 조작이 시작된다', () => {
    onPointerDown(
      createPointer({ pointerType: 'touch', pointerId: 1, clientX: 400 }),
    );
    onPointerDown(
      createPointer({ pointerType: 'touch', pointerId: 2, clientX: 600 }),
    );
    expect(pointerState.mode).toBe('gesture');
    expect(game.worker.targetX).toBe(2000);
  });

  it('세 번째 손가락은 아무것도 바꾸지 않는다', () => {
    onPointerDown(
      createPointer({ pointerType: 'touch', pointerId: 1, clientX: 400 }),
    );
    onPointerDown(
      createPointer({ pointerType: 'touch', pointerId: 2, clientX: 600 }),
    );
    onPointerDown(
      createPointer({
        pointerType: 'touch',
        pointerId: 3,
        clientX: 800,
        button: 2,
      }),
    );
    expect(pointerState.mode).toBe('gesture');
  });
});

describe('onPointerMove 마우스', () => {
  it('오른쪽 드래그는 카메라를 돌리고 높낮이를 바꾼다', () => {
    onPointerDown(createPointer({ button: 2, clientX: 500, clientY: 300 }));
    onPointerMove(createPointer({ clientX: 600, clientY: 310 }));
    expect(camera.rotation).toBeCloseTo(-0.6);
    expect(camera.tilt).toBeCloseTo(0.83);
  });

  it('높낮이는 0.35에서 1 사이로 맞춘다', () => {
    onPointerDown(createPointer({ button: 2 }));
    onPointerMove(createPointer({ clientY: 3000 }));
    expect(camera.tilt).toBe(1);
    onPointerMove(createPointer({ clientY: -9000 }));
    expect(camera.tilt).toBe(0.35);
  });

  it('가운데 드래그는 화면 위의 움직임만큼 카메라를 밀고 줌이 클수록 덜 민다', () => {
    camera.zoom = 2;
    onPointerDown(createPointer({ button: 1, clientX: 500, clientY: 300 }));
    onPointerMove(createPointer({ clientX: 540, clientY: 320 }));
    expect(camera.panX).toBeCloseTo(-20);
    expect(camera.panY).toBeCloseTo(-10);
  });

  it('카메라가 돌아 있으면 밀리는 방향도 돈다', () => {
    Object.assign(camera, { rotationCos: 0, rotationSin: 1 });
    onPointerDown(createPointer({ button: 1 }));
    onPointerMove(createPointer({ clientX: 510, clientY: 300 }));
    expect(camera.panX).toBeCloseTo(0);
    expect(camera.panY).toBeCloseTo(10);
  });

  it('왼쪽 드래그는 목표를 계속 따라 옮긴다', () => {
    onPointerDown(createPointer());
    const first = game.worker.targetX;
    onPointerMove(createPointer({ clientX: 700 }));
    expect(game.worker.targetX).not.toBe(first);
  });

  it('두 손가락 조작 중의 마우스 움직임은 무시한다', () => {
    pointerState.mode = 'gesture';
    onPointerMove(createPointer({ clientX: 900 }));
    expect([camera.rotation, camera.panX, game.worker.targetX]).toEqual([
      0, 0, 2000,
    ]);
  });

  it('누르지 않은 채 움직이면 아무 일이 없다', () => {
    onPointerMove(createPointer({ clientX: 900 }));
    expect([camera.rotation, camera.panX, game.worker.targetX]).toEqual([
      0, 0, 2000,
    ]);
  });
});

describe('onPointerMove 터치', () => {
  const placeTwoFingers = () => {
    onPointerDown(
      createPointer({
        pointerType: 'touch',
        pointerId: 1,
        clientX: 400,
        clientY: 300,
      }),
    );
    onPointerDown(
      createPointer({
        pointerType: 'touch',
        pointerId: 2,
        clientX: 600,
        clientY: 300,
      }),
    );
  };

  it('두 손가락이 움직이면 두 손가락 조작을 한다', () => {
    placeTwoFingers();
    onPointerMove(
      createPointer({
        pointerType: 'touch',
        pointerId: 2,
        clientX: 700,
        clientY: 300,
      }),
    );
    expect(pointerState.gesture.kind).toBe('view');
    expect(camera.zoom).toBeGreaterThan(1);
  });

  it('손가락이 둘이어도 두 손가락 조작 중이 아니면 카메라를 건드리지 않는다', () => {
    placeTwoFingers();
    pointerState.mode = 'none';
    onPointerMove(
      createPointer({
        pointerType: 'touch',
        pointerId: 2,
        clientX: 700,
        clientY: 300,
      }),
    );
    expect(camera.zoom).toBe(1);
  });

  it('손가락 하나로 끌면 이동 목표를 옮긴다', () => {
    onPointerDown(createPointer({ pointerType: 'touch', clientX: 500 }));
    const first = game.worker.targetX;
    onPointerMove(createPointer({ pointerType: 'touch', clientX: 800 }));
    expect(game.worker.targetX).not.toBe(first);
  });

  it('기록하지 않은 터치의 움직임은 마우스처럼 다룬다', () => {
    pointerState.mode = 'rotate';
    onPointerMove(
      createPointer({ pointerType: 'touch', pointerId: 9, clientX: 600 }),
    );
    expect(pointerState.touches.size).toBe(0);
    expect(camera.rotation).toBeCloseTo(-0.6);
  });
});

describe('onPointerLift', () => {
  it('마우스를 떼면 조작이 끝난다', () => {
    onPointerDown(createPointer());
    onPointerLift(createPointer());
    expect(pointerState.mode).toBe('none');
  });

  it('손가락이 둘 남아 있는 동안은 조작이 이어진다', () => {
    for (const id of [1, 2, 3]) {
      onPointerDown(
        createPointer({
          pointerType: 'touch',
          pointerId: id,
          clientX: id * 100,
        }),
      );
    }
    onPointerLift(createPointer({ pointerType: 'touch', pointerId: 3 }));
    expect(pointerState.mode).toBe('gesture');
  });

  it('손가락이 하나만 남으면 조작이 끝난다', () => {
    onPointerDown(
      createPointer({ pointerType: 'touch', pointerId: 1, clientX: 400 }),
    );
    onPointerDown(
      createPointer({ pointerType: 'touch', pointerId: 2, clientX: 600 }),
    );
    onPointerLift(createPointer({ pointerType: 'touch', pointerId: 2 }));
    expect(pointerState.mode).toBe('none');
    expect(pointerState.touches.size).toBe(1);
  });
});

describe('onWheel', () => {
  it('휠을 위로 돌리면 줌이 커지고 기본 동작은 막는다', () => {
    const preventDefault = vi.fn();
    onWheel({ deltaY: -100, preventDefault } as unknown as WheelEvent);
    expect(preventDefault).toHaveBeenCalled();
    expect(camera.zoom).toBeCloseTo(Math.exp(0.12));
  });

  it('줌은 0.35에서 3 사이로 맞춘다', () => {
    const dispatchWheel = (deltaY: number) =>
      onWheel({
        deltaY,
        preventDefault: () => undefined,
      } as unknown as WheelEvent);
    dispatchWheel(-100000);
    expect(camera.zoom).toBe(3);
    dispatchWheel(100000);
    expect(camera.zoom).toBe(0.35);
  });
});
