import { beforeEach, describe, expect, it } from 'vitest';
import camera from '../camera/camera';
import game from '../game';
import { makePellet } from '../testing/factories';
import { makeRenderEnvironment, projectFoot } from '../testing/fakeEnv';
import { prepareFreshGame } from '../testing/freshGame';
import addCoins from './addCoins';

beforeEach(() => {
  prepareFreshGame();
  camera.tilt = 1;
  game.time = 0;
});

const draw = (pellet = makePellet({ x: 100, y: 200 })) => {
  game.pellets = [pellet];
  const fake = makeRenderEnvironment(2);
  addCoins(fake.environment);
  return fake;
};

const collectNames = (fake: ReturnType<typeof draw>) =>
  fake.calls.map((call) => call.name);
const collectEllipses = (fake: ReturnType<typeof draw>) =>
  fake.calls
    .filter((call) => call.name === 'ellipse')
    .map((call) => call.callArguments);

describe('addCoins 위치', () => {
  it('동전마다 화면 안에서만 놓는다', () => {
    expect(draw().placed).toEqual([{ point: game.pellets[0], margin: 30 }]);
  });

  it('바닥 그림자를 먼저 깔고 그 다음 중심을 기준으로 키운 동전을 그린다', () => {
    const fake = draw();
    const foot = projectFoot({ x: 100, y: 200 });
    expect(collectEllipses(fake)[0]).toEqual([foot.x, foot.y, 18, 18, 0, 0, 7]);
    const centerY = foot.y - (16 + 6 + 0) * 2;
    const middle = collectNames(fake).slice(4, 8);
    expect(middle).toEqual(['save', 'translate', 'scale', 'translate']);
    expect(fake.calls[5].callArguments).toEqual([foot.x, centerY]);
    expect(collectNames(fake).at(-1)).toBe('restore');
  });

  it('나타난 지 0.15초가 안 되면 작게 시작해 커진다', () => {
    const fake = draw(makePellet({ x: 100, y: 200, age: 0.075 }));
    expect(
      fake.calls.find((call) => call.name === 'scale')?.callArguments,
    ).toEqual([0.5, 0.5]);
    expect(collectEllipses(fake)[0][2]).toBe(18 * 0.5);
  });
});

describe('addCoins 도는 동전', () => {
  it('앞면이 보이면 가장자리, 테두리, 앞면, 무늬를 차례로 그린다', () => {
    const fake = draw();
    const fillStyles = fake.calls
      .filter((call) => call.name === 'set:fillStyle')
      .map((call) => call.callArguments[0]);
    expect(fillStyles).toEqual([
      'rgba(50,70,40,.28)',
      '#9a6414',
      '#8a5a12',
      '#ffc531',
      '#ffe680',
      '#e7a62a',
      '#fffbe0',
    ]);
  });

  it('앞쪽으로 돌 때는 옆면이 왼쪽에 비껴 보인다', () => {
    const fake = draw();
    const foot = projectFoot({ x: 100, y: 200 });
    expect(collectEllipses(fake)[1][0]).toBe(foot.x - 6);
  });

  it('뒤쪽으로 돌 때는 옆면이 오른쪽에 비껴 보인다', () => {
    const fake = draw(makePellet({ x: 100, y: 200, phase: Math.PI }));
    const foot = projectFoot({ x: 100, y: 200 });
    expect(collectEllipses(fake)[1][0]).toBe(foot.x + 6);
  });

  it('거의 옆으로 서면 앞면 무늬를 그리지 않는다', () => {
    const fake = draw(makePellet({ x: 100, y: 200, phase: Math.PI / 2 }));
    const fillStyles = fake.calls
      .filter((call) => call.name === 'set:fillStyle')
      .map((call) => call.callArguments[0]);
    expect(fillStyles).toEqual([
      'rgba(50,70,40,.28)',
      '#9a6414',
      '#8a5a12',
      '#ffc531',
    ]);
  });

  it('가로 폭은 돌아서 변하지만 2.5z보다 좁아지지는 않는다', () => {
    const fake = draw(makePellet({ x: 100, y: 200, phase: Math.PI / 2 }));
    expect(collectEllipses(fake)[3][2]).toBeGreaterThanOrEqual(5);
  });
});

describe('addCoins 반짝임', () => {
  it('가끔 십자 모양으로 반짝인다', () => {
    const fake = draw(makePellet({ x: 100, y: 200, phase: Math.PI / 6 }));
    const foot = projectFoot({ x: 100, y: 200 });
    const lines = fake.calls.filter(
      (call) => call.name === 'moveTo' || call.name === 'lineTo',
    );
    expect(lines).toHaveLength(4);
    expect(lines[0].callArguments[0]).toBe(foot.x + 26);
    expect(
      fake.calls.find((call) => call.name === 'set:strokeStyle')?.callArguments,
    ).toEqual(['#fff']);
  });

  it('보통은 반짝이지 않는다', () => {
    expect(collectNames(draw())).not.toContain('stroke');
  });
});
