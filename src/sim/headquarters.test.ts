import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MAX_LEVEL, UPGRADE_COST, UPGRADE_PAD } from '../constants';
import game from '../game';
import { makeSpot } from '../testing/factories';
import { prepareFreshGame, resetHouse } from '../testing/freshGame';
import house from '../world/house';
import { calculateYard, YARD } from '../world/yard';
import { levelUp, syncUpPad } from './headquarters';

beforeEach(prepareFreshGame);
afterEach(resetHouse);

describe('syncUpPad', () => {
  it('열린 타워 판이 없으면 본부 판을 만들지 않는다', () => {
    syncUpPad();
    expect(game.spots).toHaveLength(0);
  });

  it('열린 타워 판을 다 짓기 전에는 본부 판을 만들지 않는다', () => {
    game.spots.push(makeSpot({ isBuilt: true }), makeSpot({ isBuilt: false }));
    syncUpPad();
    expect(game.spots).toHaveLength(2);
  });

  it('다 지으면 본부를 키우는 판이 나타난다', () => {
    game.spots.push(makeSpot({ isBuilt: true }), makeSpot({ isBuilt: true }));
    syncUpPad();
    expect(game.spots).toHaveLength(3);
    expect(game.spots[2]).toMatchObject({
      x: UPGRADE_PAD.x,
      y: UPGRADE_PAD.y,
      cost: UPGRADE_COST[1],
      isUpgrade: true,
      isBuilt: false,
    });
  });

  it('본부 판이 이미 있으면 또 만들지 않는다', () => {
    game.spots.push(makeSpot({ isBuilt: true }), makeSpot({ isUpgrade: true }));
    syncUpPad();
    expect(game.spots).toHaveLength(2);
  });

  it('이미 지은 본부 판은 있는 것으로 치지 않는다', () => {
    game.spots.push(
      makeSpot({ isBuilt: true }),
      makeSpot({ isUpgrade: true, isBuilt: true }),
    );
    syncUpPad();
    expect(game.spots).toHaveLength(3);
  });

  it('최고 레벨이면 만들지 않는다', () => {
    house.level = MAX_LEVEL;
    game.spots.push(makeSpot({ isBuilt: true }));
    syncUpPad();
    expect(game.spots).toHaveLength(1);
  });

  it('판의 값은 지금 본부 레벨에 맞는다', () => {
    house.level = 3;
    game.spots.push(makeSpot({ isBuilt: true }));
    syncUpPad();
    expect(game.spots[1].cost).toBe(UPGRADE_COST[3]);
  });
});

describe('levelUp', () => {
  it('본부 레벨이 오르고 출렁이는 연출이 다시 시작된다', () => {
    levelUp();
    expect(house.level).toBe(2);
    expect(game.houseBorn).toBe(0);
  });

  it('마당이 넓어진다', () => {
    levelUp();
    expect(YARD).toEqual(calculateYard(2));
  });

  it('알림이 뜨고 고리 연출이 생긴다', () => {
    levelUp();
    expect(game.bannerText).toBe('본부 레벨 2');
    expect(game.effects).toEqual([
      { x: house.x, y: house.y, age: 0, radius: 120, isBuildEffect: true },
    ]);
  });

  it('새 레벨의 타워 판 세 곳이 열린다', () => {
    levelUp();
    expect(game.spots).toHaveLength(3);
  });
});
