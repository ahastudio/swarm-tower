import { beforeEach, describe, expect, it } from 'vitest';
import camera from '../camera/camera';
import view from '../camera/view';
import game from '../game';
import { makeEnemy } from '../testing/factories';
import { makeRenderEnvironment } from '../testing/fakeEnv';
import { prepareFreshGame } from '../testing/freshGame';
import drawOverlay from './drawOverlay';

beforeEach(() => {
  prepareFreshGame();
  Object.assign(camera, {
    x: 2200,
    y: 1400,
    zoom: 1,
    rotation: 0,
    tilt: 1,
    rotationCos: 1,
    rotationSin: 0,
    panX: 0,
    panY: 0,
  });
  Object.assign(view, { width: 1000, height: 600 });
  game.time = 0;
  game.banner = 0;
});

const draw = () => {
  const fake = makeRenderEnvironment(1);
  drawOverlay(fake.environment);
  return fake;
};

const collectArrows = (fake: ReturnType<typeof draw>) =>
  fake.calls
    .filter((call) => call.name === 'translate')
    .map((call) => call.callArguments);

// 화면 가운데(카메라 중심)에서 월드로 (dx, dy)만큼 떨어진 적
const createEnemyAt = (deltaX: number, deltaY: number) =>
  makeEnemy({ x: 2200 + deltaX, y: 1400 + deltaY });

describe('drawOverlay 화면 밖 적', () => {
  it('화면 안의 적만 있으면 화살표가 없다', () => {
    game.enemies = [createEnemyAt(100, 0)];
    expect(collectArrows(draw())).toHaveLength(0);
  });

  it('적이 없으면 아무것도 그리지 않는다', () => {
    expect(draw().calls).toHaveLength(0);
  });

  it('오른쪽 밖의 적은 오른쪽 화면 끝에서 오른쪽을 가리키는 화살표로 알린다', () => {
    game.enemies = [createEnemyAt(3000, 0)];
    const fake = draw();
    expect(collectArrows(fake)).toEqual([
      [1000 / 2 + (1000 / 2 - 50), 600 / 2],
    ]);
    expect(
      fake.calls.find((call) => call.name === 'rotate')?.callArguments,
    ).toEqual([0]);
  });

  it('아래쪽 밖의 적은 아래쪽 끝에서 아래를 가리킨다', () => {
    game.enemies = [createEnemyAt(0, 3000)];
    const fake = draw();
    expect(collectArrows(fake)[0][0]).toBeCloseTo(500);
    expect(collectArrows(fake)[0][1]).toBeCloseTo(300 + (300 - 60));
    expect(
      fake.calls.find((call) => call.name === 'rotate')?.callArguments[0],
    ).toBeCloseTo(Math.PI / 2);
  });

  it('왼쪽 밖의 적도 알린다', () => {
    game.enemies = [createEnemyAt(-3000, 0)];
    expect(collectArrows(draw())[0][0]).toBeCloseTo(50);
  });

  it('같은 방향의 적이 많을수록 화살표가 진하다', () => {
    game.enemies = [createEnemyAt(3000, 0)];
    const few = draw().calls.find((call) => call.name === 'set:fillStyle')
      ?.callArguments[0] as string;
    game.enemies = Array.from({ length: 30 }, () => createEnemyAt(3000, 0));
    const many = draw().calls.find((call) => call.name === 'set:fillStyle')
      ?.callArguments[0] as string;
    const readAlpha = (style: string) =>
      Number(style.split(',')[3].replace(')', ''));
    expect(readAlpha(many)).toBeGreaterThan(readAlpha(few));
  });

  it('세 마리에 한 마리만 센다', () => {
    game.enemies = [
      createEnemyAt(3000, 0),
      createEnemyAt(-3000, 0),
      createEnemyAt(0, 3000),
      createEnemyAt(100, 0),
      createEnemyAt(-3000, 0),
    ];
    expect(collectArrows(draw())).toEqual([
      [1000 / 2 + (1000 / 2 - 50), 600 / 2],
    ]);
  });

  it('서로 다른 방향이면 화살표도 여럿이다', () => {
    game.enemies = [
      createEnemyAt(3000, 0),
      createEnemyAt(100, 0),
      createEnemyAt(100, 0),
      createEnemyAt(-3000, 0),
    ];
    expect(collectArrows(draw())).toHaveLength(2);
  });

  it('화살표는 시간에 따라 깜박인다', () => {
    game.enemies = [createEnemyAt(3000, 0)];
    game.time = 0;
    const firstFill = draw().calls.find((call) => call.name === 'set:fillStyle')
      ?.callArguments[0];
    game.time = Math.PI / 12;
    const secondFill = draw().calls.find(
      (call) => call.name === 'set:fillStyle',
    )?.callArguments[0];
    expect(firstFill).not.toBe(secondFill);
  });

  it('화면 중심과 정확히 겹치는 방향도 계산할 수 있다', () => {
    Object.assign(camera, {
      rotationCos: 0,
      rotationSin: 1,
      rotation: Math.PI / 2,
    });
    game.enemies = [createEnemyAt(0, 3000)];
    expect(collectArrows(draw())).toHaveLength(1);
  });
});

describe('drawOverlay 알림', () => {
  it('알림이 없으면 글자를 그리지 않는다', () => {
    expect(
      draw().calls.filter((call) => call.name === 'fillText'),
    ).toHaveLength(0);
  });

  it('알림은 화면 위쪽 가운데에 큰 글자로 보인다', () => {
    game.banner = 1;
    game.bannerText = '웨이브 2';
    const fake = draw();
    expect(
      fake.calls.find((call) => call.name === 'translate')?.callArguments,
    ).toEqual([500, 180]);
    expect(
      fake.calls.find((call) => call.name === 'fillText')?.callArguments,
    ).toEqual(['웨이브 2', 0, 0]);
    expect(
      fake.calls.find((call) => call.name === 'set:globalAlpha')?.callArguments,
    ).toEqual([1]);
    expect(
      fake.calls.find((call) => call.name === 'scale')?.callArguments,
    ).toEqual([1, 1]);
  });

  it('사라질 때는 투명해진다', () => {
    game.banner = 0.3;
    const fake = draw();
    expect(
      fake.calls.find((call) => call.name === 'set:globalAlpha')?.callArguments,
    ).toEqual([0.5]);
  });

  it('나타날 때는 잠깐 커졌다가 줄어든다', () => {
    game.banner = 2.4;
    const fake = draw();
    const scale = fake.calls.find((call) => call.name === 'scale');
    expect(scale?.callArguments[0]).toBeCloseTo(1.5);
  });
});
