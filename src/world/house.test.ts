import { describe, expect, it } from 'vitest';
import { HOUSE_MAX_HP, HOUSE_X, HOUSE_Y } from '../constants';
import house from './house';

describe('house', () => {
  it('섬 한가운데에서 레벨 1로 시작한다', () => {
    expect(house).toEqual({
      x: HOUSE_X,
      y: HOUSE_Y,
      hp: HOUSE_MAX_HP,
      level: 1,
    });
  });
});
