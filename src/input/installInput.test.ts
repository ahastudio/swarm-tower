import { beforeEach, describe, expect, it, vi } from 'vitest';
import camera from '../camera/camera';
import view from '../camera/view';
import { prepareFreshGame } from '../testing/freshGame';
import installInput from './installInput';
import { keys } from './keyboard';
import pointerState from './pointerState';

beforeEach(() => {
  prepareFreshGame();
  view.canvas.setPointerCapture = vi.fn();
  pointerState.mode = 'none';
  Object.assign(pointerState, { lastX: 0, lastY: 0 });
  installInput();
});

describe('installInput', () => {
  it('캔버스에서 누르면 이동 조작이 시작된다', () => {
    view.canvas.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    expect(pointerState.mode).toBe('move');
  });

  it('창에서 떼면 조작이 끝난다', () => {
    pointerState.mode = 'rotate';
    dispatchEvent(new MouseEvent('pointerup'));
    expect(pointerState.mode).toBe('none');
    pointerState.mode = 'rotate';
    dispatchEvent(new MouseEvent('pointercancel'));
    expect(pointerState.mode).toBe('none');
  });

  it('캔버스에서 움직이면 드래그를 처리한다', () => {
    pointerState.mode = 'rotate';
    camera.rotation = 0;
    view.canvas.dispatchEvent(new MouseEvent('pointermove', { clientX: 100 }));
    expect(camera.rotation).toBeCloseTo(-0.6);
  });

  it('휠은 줌이고 스크롤은 막는다', () => {
    camera.zoom = 1;
    const event = new WheelEvent('wheel', { deltaY: -100, cancelable: true });
    view.canvas.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(camera.zoom).toBeGreaterThan(1);
  });

  it('오른쪽 클릭 메뉴는 막는다', () => {
    const event = new MouseEvent('contextmenu', { cancelable: true });
    view.canvas.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('키보드 입력도 받는다', () => {
    dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
    expect(keys.d).toBe(true);
  });
});
