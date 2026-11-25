import { beforeEach, describe, expect, it } from 'vitest';
import camera from '../camera/camera';
import game from '../game';
import { spriteAssets } from '../sprites/assets';
import { installFakeAssets } from '../testing/fakeAssets';
import { makeRenderEnvironment, projectFoot } from '../testing/fakeEnv';
import { prepareFreshGame } from '../testing/freshGame';
import house from '../world/house';
import addHouse from './addHouse';

beforeEach(() => {
  prepareFreshGame();
  installFakeAssets();
  camera.tilt = 1;
  house.level = 1;
  game.hp = 100;
  game.houseBorn = 9;
});

describe('addHouse', () => {
  it('본부는 화면 밖에서도 항상 놓는다', () => {
    const fake = makeRenderEnvironment();
    addHouse(fake.environment);
    expect(fake.placed[0].margin).toBe(Number.POSITIVE_INFINITY);
    expect(fake.placed[0].point).toBe(house);
  });

  it('레벨에 맞는 집과 그림자를 그린다', () => {
    house.level = 3;
    const fake = makeRenderEnvironment();
    addHouse(fake.environment);
    const foot = projectFoot(house);
    expect(fake.shadows[0]).toEqual([foot.x, foot.y, 60 + 3 * 16]);
    expect(fake.stacks[0]).toEqual({
      stack: spriteAssets.houses[2],
      placement: { angle: 0, x: foot.x, y: foot.y, scale: 1 },
    });
  });

  it('키운 직후에는 출렁이며 커졌다 작아진다', () => {
    game.houseBorn = 0.3;
    const fake = makeRenderEnvironment();
    addHouse(fake.environment);
    const bounce = 1 + 0.18 * 0.5 * Math.sin(0.3 * 18);
    expect(fake.stacks[0].placement.scale).toBeCloseTo(bounce);
  });

  it('0.6초가 지나면 출렁임이 멈춘다', () => {
    game.houseBorn = 0.7;
    const fake = makeRenderEnvironment();
    addHouse(fake.environment);
    expect(fake.stacks[0].placement.scale).toBe(1);
  });

  it('집 위에 레벨을 윤곽 글자로 보인다', () => {
    const fake = makeRenderEnvironment(2);
    addHouse(fake.environment);
    const foot = projectFoot(house);
    const height =
      spriteAssets.houses[0].layerCount *
      spriteAssets.houses[0].lift *
      1 *
      2 *
      1;
    const text = fake.calls.find((call) => call.name === 'fillText');
    expect(text?.callArguments).toEqual([
      '레벨 1',
      foot.x,
      foot.y - height * 0.78 - 4 * 2,
    ]);
    expect(
      fake.calls.find((call) => call.name === 'set:font')?.callArguments,
    ).toEqual(['bold 44px sans-serif']);
  });

  it('체력 막대는 어두운 바탕 위에 남은 체력만큼 초록으로 채운다', () => {
    game.hp = 40;
    const fake = makeRenderEnvironment(2);
    addHouse(fake.environment);
    const foot = projectFoot(house);
    const rects = fake.calls
      .filter((call) => call.name === 'fillRect')
      .map((call) => call.callArguments);
    expect(rects).toEqual([
      [foot.x - 100, foot.y + 92, 200, 16],
      [foot.x - 100, foot.y + 92, 200 * 0.4, 16],
    ]);
  });

  it('체력이 음수여도 막대 너비는 0이다', () => {
    game.hp = -5;
    const fake = makeRenderEnvironment(2);
    addHouse(fake.environment);
    const rects = fake.calls.filter((call) => call.name === 'fillRect');
    expect(rects[1].callArguments[2]).toBe(0);
  });
});
