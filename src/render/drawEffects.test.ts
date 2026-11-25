import { beforeEach, describe, expect, it } from 'vitest';
import camera from '../camera/camera';
import { project } from '../camera/projection';
import view from '../camera/view';
import game from '../game';
import { makeEffect, makeFly, makeShot, makeSpot } from '../testing/factories';
import { makeRenderEnvironment } from '../testing/fakeEnv';
import { prepareFreshGame } from '../testing/freshGame';
import drawEffects from './drawEffects';

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
  });
  Object.assign(view, { width: 1000, height: 600 });
  game.time = 0;
});

const draw = () => {
  const fake = makeRenderEnvironment(2);
  drawEffects(fake.environment);
  return fake;
};

const fillStyles = (fake: ReturnType<typeof draw>) =>
  fake.calls
    .filter((call) => call.name === 'set:fillStyle')
    .map((call) => call.callArguments[0]);
const projectScreenPoint = (x: number, y: number) =>
  project(x, y, { x: 0, y: 0 });

describe('drawEffects 날아드는 동전', () => {
  it('시간이 아직 음수인 동전은 그리지 않는다', () => {
    game.flies = [makeFly(makeSpot(), { elapsed: -0.1 })];
    expect(draw().calls).toHaveLength(0);
  });

  it('그림자와 세 겹 동전(테두리, 면, 안쪽 원)을 그린다', () => {
    game.flies = [
      makeFly(makeSpot({ x: 2300, y: 1500 }), {
        x: 2200,
        y: 1400,
        elapsed: 0,
        duration: 1,
      }),
    ];
    const fake = draw();
    expect(fillStyles(fake)).toEqual([
      'rgba(50,70,40,.25)',
      '#8a5a12',
      '#ffc531',
      '#ffe680',
    ]);
    const point = projectScreenPoint(2200, 1400);
    const ellipses = fake.calls
      .filter((call) => call.name === 'ellipse')
      .map((call) => call.callArguments);
    expect(ellipses[0]).toEqual([point.x, point.y, 16, 6, 0, 0, 7]);
    expect(ellipses[1][1]).toBe(point.y - 60);
  });

  it('날아가는 동안 출발점에서 판 쪽으로 옮겨 가며 중간에 가장 높다', () => {
    game.flies = [
      makeFly(makeSpot({ x: 2300, y: 1400 }), {
        x: 2200,
        y: 1400,
        elapsed: 0.5,
        duration: 1,
      }),
    ];
    const fake = draw();
    const middle = projectScreenPoint(2250, 1400);
    const ellipses = fake.calls
      .filter((call) => call.name === 'ellipse')
      .map((call) => call.callArguments);
    expect(ellipses[0][0]).toBeCloseTo(middle.x);
    expect(ellipses[1][1]).toBeCloseTo(middle.y - (15 + 3 + 70) * 2);
  });

  it('도는 각도에 따라 동전의 가로 폭이 변한다', () => {
    game.flies = [
      makeFly(makeSpot(), { elapsed: 0, duration: 1, phase: Math.PI / 2 }),
    ];
    const ellipses = draw()
      .calls.filter((call) => call.name === 'ellipse')
      .map((call) => call.callArguments);
    expect(ellipses[2][2]).toBeCloseTo(6);
  });
});

describe('drawEffects 날아가는 탄', () => {
  it('작은 탄은 노란색이고 낮게 난다', () => {
    game.shots = [
      makeShot({
        x: 2200,
        y: 1400,
        targetX: 2300,
        targetY: 1400,
        elapsed: 0.5,
        duration: 1,
      }),
    ];
    const fake = draw();
    expect(fillStyles(fake)).toEqual([
      'rgba(50,70,40,.3)',
      '#ffd23f',
      '#fff6c2',
    ]);
    const point = projectScreenPoint(2250, 1400);
    const arcs = fake.calls
      .filter((call) => call.name === 'arc')
      .map((call) => call.callArguments);
    expect(arcs[0][0]).toBeCloseTo(point.x);
    expect(arcs[0][1]).toBeCloseTo(point.y - 60 - 60 * 2);
    expect(arcs[0][2]).toBe(16);
    expect(arcs[1][2]).toBe(6);
  });

  it('큰 탄은 어두운 색이고 더 높고 크게 난다', () => {
    game.shots = [
      makeShot({
        x: 2200,
        y: 1400,
        targetX: 2300,
        targetY: 1400,
        elapsed: 0.5,
        duration: 1,
        isBig: true,
      }),
    ];
    const fake = draw();
    expect(fillStyles(fake)).toEqual([
      'rgba(50,70,40,.3)',
      '#3b3350',
      '#7a6fa0',
    ]);
    const arcs = fake.calls
      .filter((call) => call.name === 'arc')
      .map((call) => call.callArguments);
    expect(arcs[0][2]).toBe(22);
    expect(arcs[1][2]).toBe(8);
    const point = projectScreenPoint(2250, 1400);
    expect(arcs[0][1]).toBeCloseTo(point.y - 60 - 110 * 2);
  });
});

describe('drawEffects 폭발 연출', () => {
  it('짓기 연출은 흰 고리가 퍼지며 옅어진다', () => {
    game.effects = [
      makeEffect({
        x: 2200,
        y: 1400,
        age: 0.25,
        radius: 50,
        isBuildEffect: true,
      }),
    ];
    const fake = draw();
    expect(
      fake.calls.find((call) => call.name === 'set:strokeStyle')?.callArguments,
    ).toEqual(['rgba(255,255,255,0.5)']);
    expect(
      fake.calls.find((call) => call.name === 'set:lineWidth')?.callArguments,
    ).toEqual([10]);
    expect(
      fake.calls.find((call) => call.name === 'arc')?.callArguments[2],
    ).toBe(50 * 0.8 * 2);
  });

  it('폭발은 크고 옅은 원 위에 작고 주황빛 원을 겹친다', () => {
    game.effects = [makeEffect({ x: 2200, y: 1400, age: 0.25, radius: 50 })];
    const fake = draw();
    expect(fillStyles(fake)).toEqual([
      'rgba(255,240,215,0.425)',
      'rgba(255,190,90,0.35)',
    ]);
    const radii = fake.calls
      .filter((call) => call.name === 'arc')
      .map((call) => call.callArguments[2]);
    expect(radii[0]).toBeCloseTo(50 * 0.85 * 2);
    expect(radii[1]).toBeCloseTo(50 * 0.4 * 1.5 * 2);
  });

  it('연출은 하나씩 순서대로 그린다', () => {
    game.effects = [makeEffect({ isBuildEffect: true }), makeEffect()];
    const fake = draw();
    const order = fake.calls
      .filter((call) => call.name === 'stroke' || call.name === 'fill')
      .map((call) => call.name);
    expect(order).toEqual(['stroke', 'fill', 'fill']);
  });
});
