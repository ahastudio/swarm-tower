import { beforeEach, describe, expect, it } from 'vitest';
import camera from '../camera/camera';
import game from '../game';
import { spriteAssets } from '../sprites/assets';
import { makeTower } from '../testing/factories';
import { installFakeAssets } from '../testing/fakeAssets';
import { makeRenderEnvironment, projectFoot } from '../testing/fakeEnv';
import { prepareFreshGame } from '../testing/freshGame';
import house from '../world/house';
import addTowers from './addTowers';

beforeEach(() => {
  prepareFreshGame();
  installFakeAssets();
  camera.tilt = 1;
  house.level = 1;
  Object.assign(game.worker, { x: 9000, y: 9000 });
});

const draw = (tower = makeTower({ x: 100, y: 200, born: 5 }), z = 2) => {
  game.towers = [tower];
  const fake = makeRenderEnvironment(z);
  addTowers(fake.environment);
  return fake;
};

const collectTexts = (fake: ReturnType<typeof draw>) =>
  fake.calls
    .filter((call) => call.name === 'fillText')
    .map((call) => call.callArguments[0]);

describe('addTowers 몸통', () => {
  it('타워마다 화면 안에서만 놓는다', () => {
    const fake = draw();
    expect(fake.placed).toEqual([{ point: game.towers[0], margin: 150 }]);
  });

  it('받침 위에 대포를 얹는다', () => {
    const fake = draw();
    const foot = projectFoot({ x: 100, y: 200 });
    expect(fake.shadows[0]).toEqual([foot.x, foot.y, 34]);
    expect(fake.stacks[0]).toEqual({
      stack: spriteAssets.base,
      placement: { angle: 0, x: foot.x, y: foot.y, scale: 1 },
    });
    const baseHeight = 3 * 5 * 2 * 1 * 0.9 * 1;
    expect(fake.stacks[1]).toEqual({
      stack: spriteAssets.cannon,
      placement: { angle: 0, x: foot.x, y: foot.y - baseHeight, scale: 1 },
    });
  });

  it('대포는 타워가 향한 쪽으로 돌아 있다', () => {
    const fake = draw(makeTower({ x: 100, y: 200, born: 5, heading: 1.2 }));
    expect(fake.stacks[1].placement.angle).toBe(1.2);
  });

  it('쏜 직후(반동)에는 대포가 조금 내려앉는다', () => {
    const still = draw(makeTower({ x: 100, y: 200, born: 5 }));
    const recoil = draw(makeTower({ x: 100, y: 200, born: 5, recoil: 0.1 }));
    expect(recoil.stacks[1].placement.y - still.stacks[1].placement.y).toBe(
      3 * 2,
    );
  });

  it('지은 직후에는 아주 작게 시작해 튕기며 커진다', () => {
    const start = draw(makeTower({ born: 0 }));
    expect(start.stacks[0].placement.scale).toBeCloseTo(0.05);
    const overshoot = draw(makeTower({ born: 0.3 }));
    expect(overshoot.stacks[0].placement.scale).toBeGreaterThan(1);
    const done = draw(makeTower({ born: 0.6 }));
    expect(done.stacks[0].placement.scale).toBe(1);
  });

  it('레벨이 오르면 6%씩 커진다', () => {
    const fake = draw(makeTower({ born: 5, level: 3 }));
    expect(fake.stacks[0].placement.scale).toBeCloseTo(1.12);
  });
});

describe('addTowers 레벨 점', () => {
  const collectCircles = (fake: ReturnType<typeof draw>) =>
    fake.calls
      .filter((call) => call.name === 'arc')
      .map((call) => call.callArguments);

  it('레벨 1에는 점이 없다', () => {
    house.level = 5;
    expect(collectCircles(draw())).toHaveLength(0);
  });

  it('레벨이 오를 때마다 점이 하나씩 늘어 가운데를 맞춰 늘어선다', () => {
    house.level = 5;
    const fake = draw(makeTower({ x: 100, y: 200, born: 5, level: 3 }));
    const foot = projectFoot({ x: 100, y: 200 });
    const xValues = collectCircles(fake).map(
      (callArguments) => callArguments[0],
    );
    expect(xValues.filter((_, index) => index % 2 === 0)).toEqual([
      foot.x - 14,
      foot.x + 14,
    ]);
  });
});

describe('addTowers 안내', () => {
  const moveWorkerNearTower = () =>
    Object.assign(game.worker, { x: 100, y: 200 });

  it('멀리서는 안내가 보이지 않는다', () => {
    expect(collectTexts(draw())).toEqual([]);
  });

  it('본부 레벨이 모자라면 가까이 갔을 때 먼저 본부를 올리라고 알린다', () => {
    moveWorkerNearTower();
    house.level = 1;
    const fake = draw(makeTower({ x: 100, y: 200, born: 5, level: 1 }));
    expect(collectTexts(fake)).toEqual(['본부 레벨 2 필요']);
  });

  it('본부 레벨이 넉넉하면 파워업에 드는 동전을 보인다', () => {
    moveWorkerNearTower();
    house.level = 3;
    const fake = draw(
      makeTower({ x: 100, y: 200, born: 5, level: 2, powerUpPaid: 15 }),
    );
    expect(collectTexts(fake)).toEqual(['▲ 25']);
    const bar = fake.calls
      .filter((call) => call.name === 'fillRect')
      .map((call) => call.callArguments);
    expect(bar[1][2]).toBe((70 * 2 * 15) / 40);
  });

  it('최고 레벨 타워는 아무 안내도 하지 않는다', () => {
    moveWorkerNearTower();
    house.level = 5;
    expect(
      collectTexts(draw(makeTower({ x: 100, y: 200, born: 5, level: 5 }))),
    ).toEqual([]);
  });

  it('170 이상 떨어지면 안내하지 않는다', () => {
    Object.assign(game.worker, { x: 100 + 170, y: 200 });
    house.level = 1;
    expect(collectTexts(draw(makeTower({ x: 100, y: 200, born: 5 })))).toEqual(
      [],
    );
  });
});
