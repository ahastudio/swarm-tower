import { beforeEach, describe, expect, it } from 'vitest';
import resetGame from './resetGame';
import { rebuildYard } from './sim/headquarters';
import house from './world/house';
import { calculateYard, YARD } from './world/yard';

beforeEach(() => {
  house.level = 3;
  rebuildYard();
});

describe('resetGame', () => {
  it('본부 레벨을 1로 돌리고 마당도 처음 크기로 되돌린다', () => {
    resetGame();
    expect(house.level).toBe(1);
    expect(YARD).toEqual(calculateYard(1));
  });
});
