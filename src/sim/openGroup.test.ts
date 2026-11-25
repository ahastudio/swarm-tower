import { beforeEach, describe, expect, it } from 'vitest';
import { SPOT_GROUPS } from '../constants';
import game from '../game';
import { prepareFreshGame } from '../testing/freshGame';
import openGroup from './openGroup';

beforeEach(prepareFreshGame);

describe('openGroup', () => {
  it('그 레벨의 타워 판 세 곳을 연다', () => {
    openGroup(1);
    expect(game.spots).toHaveLength(3);
    const [x, y, cost] = SPOT_GROUPS[1][0];
    expect(game.spots[0]).toMatchObject({
      x,
      y,
      cost,
      isBuilt: false,
      paid: 0,
    });
  });

  it('이미 열린 판 뒤에 이어 붙인다', () => {
    openGroup(0);
    openGroup(1);
    expect(game.spots).toHaveLength(6);
  });
});
