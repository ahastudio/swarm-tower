import { beforeEach, describe, expect, it } from 'vitest';
import camera from '../camera/camera';
import game from '../game';
import { spriteAssets } from '../sprites/assets';
import { makeEnemy } from '../testing/factories';
import { installFakeAssets } from '../testing/fakeAssets';
import { makeRenderEnvironment, projectFoot } from '../testing/fakeEnv';
import { prepareFreshGame } from '../testing/freshGame';
import addEnemies from './addEnemies';

beforeEach(() => {
  prepareFreshGame();
  installFakeAssets();
  camera.tilt = 1;
  game.time = 0;
});

const draw = (enemy = makeEnemy({ x: 100, y: 200 })) => {
  game.enemies = [enemy];
  const fake = makeRenderEnvironment(2);
  addEnemies(fake.environment);
  return fake;
};

const collectFills = (fake: ReturnType<typeof draw>) =>
  fake.calls
    .filter((call) => call.name === 'fillRect')
    .map((call) => call.callArguments);

describe('addEnemies 기본', () => {
  it('적마다 화면 안에서만 놓는다', () => {
    const fake = draw();
    expect(fake.placed).toEqual([{ point: game.enemies[0], margin: 80 }]);
  });

  it('종류에 맞는 동물 그림을 향한 쪽으로 돌려 크기를 키워 놓는다', () => {
    const fake = draw(
      makeEnemy({ x: 100, y: 200, spriteIndex: 3, heading: 0.4, scale: 1.35 }),
    );
    const foot = projectFoot({ x: 100, y: 200 });
    expect(fake.stacks[0].stack).toBe(spriteAssets.enemies[3]);
    expect(fake.stacks[0].placement).toMatchObject({
      angle: 0.4,
      x: foot.x,
      scale: 1.35,
    });
    expect(fake.stacks[0].placement.y).toBe(foot.y);
  });

  it('통통 뛰며 위로 올라간다', () => {
    game.time = Math.PI / 18;
    const fake = draw(makeEnemy({ x: 100, y: 200, phase: 0 }));
    const foot = projectFoot({ x: 100, y: 200 });
    expect(fake.stacks[0].placement.y).toBeCloseTo(foot.y - 6 * 2);
  });

  it('약한 적은 고리도 체력 막대도 없다', () => {
    const fake = draw(makeEnemy({ tier: 0, hp: 1, maxHp: 5 }));
    expect(fake.calls.filter((call) => call.name === 'ellipse')).toHaveLength(
      0,
    );
    expect(collectFills(fake)).toHaveLength(0);
  });
});

describe('addEnemies 센 적', () => {
  it('센 적은 주황 고리, 아주 센 적은 빨간 고리를 발밑에 깐다', () => {
    const strong = draw(makeEnemy({ x: 100, y: 200, tier: 1, scale: 1.35 }));
    const foot = projectFoot({ x: 100, y: 200 });
    expect(
      strong.calls.find((call) => call.name === 'set:strokeStyle')
        ?.callArguments,
    ).toEqual(['#ffa53a']);
    expect(
      strong.calls.find((call) => call.name === 'ellipse')?.callArguments,
    ).toEqual([foot.x, foot.y + 4, 22 * 1.35 * 2, 22 * 1.35 * 1 * 2, 0, 0, 7]);
    const elite = draw(makeEnemy({ x: 100, y: 200, tier: 2 }));
    expect(
      elite.calls.find((call) => call.name === 'set:strokeStyle')
        ?.callArguments,
    ).toEqual(['#ff4d4d']);
  });

  it('체력이 다 찼으면 막대를 그리지 않는다', () => {
    expect(
      collectFills(draw(makeEnemy({ tier: 1, hp: 4, maxHp: 4 }))),
    ).toHaveLength(0);
  });

  it('맞아서 체력이 줄었으면 머리 위에 막대가 뜨고 남은 만큼 색으로 채운다', () => {
    const fake = draw(
      makeEnemy({
        x: 100,
        y: 200,
        tier: 2,
        hp: 3,
        maxHp: 12,
        scale: 1.8,
        spriteIndex: 0,
      }),
    );
    const foot = projectFoot({ x: 100, y: 200 });
    const width = 36 * 1.8 * 2;
    const top =
      foot.y -
      spriteAssets.enemies[0].layerCount *
        spriteAssets.enemies[0].lift *
        1 *
        2 *
        1.8 -
      16;
    expect(collectFills(fake)).toEqual([
      [foot.x - width / 2, top, width, 10],
      [foot.x - width / 2, top, (width * 3) / 12, 10],
    ]);
    expect(
      fake.calls
        .filter((call) => call.name === 'set:fillStyle')
        .map((call) => call.callArguments[0]),
    ).toEqual(['#0008', '#ff4d4d']);
  });
});
