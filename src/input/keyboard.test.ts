import { afterEach, describe, expect, it } from 'vitest';
import { installKeyboard, keys } from './keyboard';

afterEach(() => {
  for (const name of Object.keys(keys)) {
    delete keys[name];
  }
});

describe('installKeyboard', () => {
  it('누른 키는 소문자 이름으로 true가 되고 떼면 false가 된다', () => {
    installKeyboard();
    dispatchEvent(new KeyboardEvent('keydown', { key: 'W' }));
    expect(keys.w).toBe(true);
    dispatchEvent(new KeyboardEvent('keyup', { key: 'W' }));
    expect(keys.w).toBe(false);
  });

  it('화살표 키도 이름으로 기록한다', () => {
    installKeyboard();
    dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(keys.arrowleft).toBe(true);
  });
});
