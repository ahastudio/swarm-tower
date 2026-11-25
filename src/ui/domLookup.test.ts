import { describe, expect, it } from 'vitest';
import { mountGameDom } from '../testing/mountDom';
import { findById, select } from './domLookup';

describe('byId', () => {
  it('id로 요소를 찾는다', () => {
    mountGameDom();
    expect(findById('game-over-message').id).toBe('game-over-message');
  });

  it('없으면 어느 요소인지 알리며 오류를 던진다', () => {
    expect(() => findById('nothing')).toThrow('#nothing 요소가 없습니다');
  });
});

describe('select', () => {
  it('선택자로 요소를 찾는다', () => {
    mountGameDom();
    expect(select('#loading-bar i').tagName).toBe('I');
  });

  it('없으면 오류를 던진다', () => {
    expect(() => select('#loading-bar i')).toThrow(
      '#loading-bar i 요소가 없습니다',
    );
  });
});
