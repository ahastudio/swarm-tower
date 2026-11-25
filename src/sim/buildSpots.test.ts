import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import game from '../game';
import { randomState } from '../randomNumbers';
import { makeSpot, makeTower } from '../testing/factories';
import { prepareFreshGame, resetHouse } from '../testing/freshGame';
import house from '../world/house';
import buildSpots from './buildSpots';

beforeEach(() => {
  prepareFreshGame();
  game.worker.x = 500;
  game.worker.y = 500;
  game.coins = 100;
});

afterEach(resetHouse);

describe('buildSpots 타워 짓기', () => {
  it('판 위에 서서 동전을 내면 한 번에 acc가 쌓인 만큼 낸다', () => {
    const spot = makeSpot({ cost: 10 });
    game.spots.push(spot);
    buildSpots(0.1);
    expect(spot.paid).toBe(4);
    expect(game.coins).toBe(96);
    expect(spot.coinCharge).toBeCloseTo(0);
  });

  it('동전이 날아가는 연출이 하나씩 생기고 시간이 조금씩 어긋난다', () => {
    game.spots.push(makeSpot({ cost: 10 }));
    buildSpots(0.1);
    expect(game.flies).toHaveLength(4);
    expect(game.flies.map((fly) => fly.elapsed)).toEqual([
      -0, -0.02, -0.04, -0.06,
    ]);
    expect(game.flies[0]).toMatchObject({ x: 500, y: 500, duration: 0.34 });
  });

  it('날아가는 동전은 50개까지만 둔다', () => {
    game.coins = 1000;
    game.spots.push(makeSpot({ cost: 500 }));
    buildSpots(2);
    expect(game.flies).toHaveLength(50);
  });

  it('다 내면 타워가 지어지고 고리 연출이 생긴다', () => {
    const spot = makeSpot({ cost: 4 });
    game.spots.push(spot);
    buildSpots(0.1);
    expect(spot.isBuilt).toBe(true);
    expect(game.towers).toHaveLength(1);
    expect(spot.tower).toBe(game.towers[0]);
    expect(game.towers[0]).toMatchObject({ x: 500, y: 500, level: 1 });
    expect(game.effects).toEqual([
      { x: 500, y: 500, age: 0, radius: 50, isBuildEffect: true },
    ]);
  });

  it('열린 판을 다 지으면 본부를 키우는 판이 나타난다', () => {
    game.spots.push(makeSpot({ cost: 4 }));
    buildSpots(0.1);
    expect(game.spots.filter((spot) => spot.isUpgrade)).toHaveLength(1);
  });

  it('동전이 모자라면 있는 만큼만 낸다', () => {
    game.coins = 2;
    const spot = makeSpot({ cost: 10 });
    game.spots.push(spot);
    buildSpots(0.1);
    expect(spot.paid).toBe(2);
    expect(game.coins).toBe(0);
  });

  it('동전이 없으면 아무것도 하지 않는다', () => {
    game.coins = 0;
    const spot = makeSpot();
    game.spots.push(spot);
    buildSpots(0.1);
    expect(spot.coinCharge).toBe(0);
  });

  it('판에서 44 이상 떨어지면 내지 않는다', () => {
    game.worker.x = 544;
    const spot = makeSpot();
    game.spots.push(spot);
    buildSpots(0.1);
    expect(spot.paid).toBe(0);
    game.worker.x = 500;
    game.worker.y = 456;
    buildSpots(0.1);
    expect(spot.paid).toBe(0);
  });

  it('난수는 날아가는 동전이 생길 때만 쓴다', () => {
    game.spots.push(makeSpot({ cost: 10 }));
    randomState.seed = 7;
    buildSpots(0.01);
    expect(randomState.seed).toBe(7);
  });
});

describe('buildSpots 파워업', () => {
  const builtSpot = (tower = makeTower({ level: 1 })) => {
    const spot = makeSpot({ isBuilt: true, tower });
    game.spots.push(spot);
    return spot;
  };

  it('본부 레벨 안에서 타워 위에 서서 동전을 내면 파워업한다', () => {
    house.level = 2;
    const spot = builtSpot();
    buildSpots(0.5);
    expect(spot.tower?.level).toBe(2);
    expect(spot.tower?.powerUpPaid).toBe(0);
    expect(game.coins).toBe(80);
  });

  it('값을 다 내기 전에는 낸 만큼 쌓인다', () => {
    house.level = 2;
    const spot = builtSpot();
    buildSpots(0.1);
    expect(spot.tower?.powerUpPaid).toBe(4);
    expect(spot.tower?.level).toBe(1);
  });

  it('타워 레벨은 본부 레벨을 넘지 못한다', () => {
    house.level = 1;
    const spot = builtSpot();
    buildSpots(0.5);
    expect(spot.tower?.level).toBe(1);
    expect(spot.coinCharge).toBe(0);
    expect(game.coins).toBe(100);
  });

  it('최고 레벨 타워는 더 올리지 못한다', () => {
    house.level = 5;
    const spot = builtSpot(makeTower({ level: 5 }));
    buildSpots(0.5);
    expect(spot.tower?.level).toBe(5);
  });

  it('타워가 없는 다 지은 판은 건너뛴다', () => {
    const spot = makeSpot({ isBuilt: true });
    game.spots.push(spot);
    buildSpots(0.5);
    expect(spot.coinCharge).toBe(0);
  });
});

describe('buildSpots 본부 판', () => {
  it('값을 다 내면 본부 레벨이 오르고 본부 판은 사라진다', () => {
    const isUpgrade = makeSpot({ cost: 4, isUpgrade: true });
    game.spots.push(isUpgrade);
    buildSpots(0.1);
    expect(house.level).toBe(2);
    expect(game.spots.some((spot) => spot.isUpgrade)).toBe(false);
    expect(game.towers).toHaveLength(0);
  });

  it('새 레벨의 판 세 곳이 열린다', () => {
    game.spots.push(makeSpot({ cost: 4, isUpgrade: true, x: 500, y: 500 }));
    buildSpots(0.1);
    expect(game.spots).toHaveLength(3);
  });
});
