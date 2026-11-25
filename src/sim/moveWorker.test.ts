import { beforeEach, describe, expect, it, vi } from 'vitest';
import camera from '../camera/camera';
import game from '../game';
import { keys } from '../input/keyboard';
import { calculateHeading } from '../mathHelpers';
import { prepareFreshGame } from '../testing/freshGame';

type Spot = { x: number; y: number };
const blocking = vi.hoisted(() => ({
  default: vi.fn((_from: Spot, _to: Spot) => false),
}));
vi.mock('./isMoveBlocked', () => blocking);

const { default: moveWorker } = await import('./moveWorker');

beforeEach(() => {
  prepareFreshGame();
  blocking.default.mockReset();
  blocking.default.mockReturnValue(false);
  for (const name of Object.keys(keys)) {
    delete keys[name];
  }
  Object.assign(game.worker, {
    x: 1000,
    y: 1000,
    targetX: 1000,
    targetY: 1000,
  });
  Object.assign(camera, {
    x: 1000,
    y: 1000,
    rotation: 0,
    rotationCos: 1,
    rotationSin: 0,
  });
});

describe('moveWorker 방향키', () => {
  it('위쪽 키는 화면 위쪽으로 40 앞을 목표로 삼는다', () => {
    keys.w = true;
    moveWorker(0.001);
    expect(game.worker.targetX).toBeCloseTo(1000);
    expect(game.worker.targetY).toBeCloseTo(960);
  });

  it('화살표 키도 같다', () => {
    keys.arrowright = true;
    moveWorker(0.001);
    expect(game.worker.targetX).toBeCloseTo(1040);
    expect(game.worker.targetY).toBeCloseTo(1000);
  });

  it('아래와 왼쪽 키를 함께 누르면 대각선이라 길이가 40이다', () => {
    keys.s = true;
    keys.a = true;
    moveWorker(0.001);
    const deltaX = game.worker.targetX - 1000;
    const deltaY = game.worker.targetY - 1000;
    expect(deltaX).toBeCloseTo(-40 * Math.SQRT1_2);
    expect(deltaY).toBeCloseTo(40 * Math.SQRT1_2);
  });

  it('반대쪽 키를 함께 누르면 서로 지운다', () => {
    keys.a = true;
    keys.d = true;
    moveWorker(0.001);
    expect(game.worker.targetX).toBe(1000);
    expect(game.worker.targetY).toBe(1000);
  });

  it('카메라가 돌아 있으면 그만큼 돌려서 목표를 삼는다', () => {
    camera.rotation = Math.PI / 2;
    camera.rotationCos = Math.cos(camera.rotation);
    camera.rotationSin = Math.sin(camera.rotation);
    keys.s = true;
    moveWorker(0.001);
    expect(game.worker.targetX).toBeCloseTo(1040);
    expect(game.worker.targetY).toBeCloseTo(1000);
  });

  it('누른 키가 없으면 목표를 건드리지 않는다', () => {
    game.worker.targetX = 1234;
    moveWorker(0.001);
    expect(game.worker.targetX).toBe(1234);
  });
});

describe('moveWorker 걷기', () => {
  it('목표 쪽으로 속도 190으로 걷고 걷는 동작이 넘어간다', () => {
    game.worker.targetX = 2000;
    moveWorker(0.1);
    expect(game.worker.isMoving).toBe(true);
    expect(game.worker.x).toBeCloseTo(1019);
    expect(game.worker.y).toBe(1000);
    expect(game.worker.heading).toBeCloseTo(calculateHeading(1000, 0));
    expect(game.worker.walk).toBeCloseTo(0.9);
  });

  it('목표에 거의 다 왔으면 멈춘다', () => {
    game.worker.targetX = 1003;
    moveWorker(0.1);
    expect(game.worker.isMoving).toBe(false);
    expect(game.worker.x).toBe(1000);
    expect(game.worker.walk).toBe(0);
  });

  it('남은 거리보다 멀리는 가지 않는다', () => {
    game.worker.targetX = 1010;
    moveWorker(1);
    expect(game.worker.x).toBeCloseTo(1010);
  });

  it('지도 가장자리 20 안으로는 가지 않는다', () => {
    Object.assign(game.worker, { x: 30, y: 30, targetX: -500, targetY: -500 });
    moveWorker(1);
    expect(game.worker.x).toBe(20);
    expect(game.worker.y).toBe(20);
    Object.assign(game.worker, {
      x: 4490,
      y: 2790,
      targetX: 9000,
      targetY: 9000,
    });
    moveWorker(1);
    expect(game.worker.x).toBe(4480);
    expect(game.worker.y).toBe(2780);
  });
});

describe('moveWorker 막힘', () => {
  const walkDiagonally = () => {
    game.worker.targetX = 1100;
    game.worker.targetY = 1100;
    moveWorker(0.1);
  };
  const step = 190 * 0.1 * Math.SQRT1_2;

  it('막히지 않으면 그대로 간다', () => {
    walkDiagonally();
    expect(game.worker.x).toBeCloseTo(1000 + step);
    expect(game.worker.y).toBeCloseTo(1000 + step);
  });

  it('막히면 가로로만 간다', () => {
    blocking.default.mockImplementation((_from, to) => to.y !== 1000);
    walkDiagonally();
    expect(game.worker.x).toBeCloseTo(1000 + step);
    expect(game.worker.y).toBe(1000);
  });

  it('가로도 막히면 세로로만 간다', () => {
    blocking.default.mockImplementation((_from, to) => to.x !== 1000);
    walkDiagonally();
    expect(game.worker.x).toBe(1000);
    expect(game.worker.y).toBeCloseTo(1000 + step);
  });

  it('모두 막히면 제자리에 선다', () => {
    blocking.default.mockReturnValue(true);
    walkDiagonally();
    expect([game.worker.x, game.worker.y]).toEqual([1000, 1000]);
  });
});

describe('moveWorker 카메라', () => {
  it('카메라는 주인공 쪽으로 초당 4의 비율로 따라온다', () => {
    Object.assign(game.worker, {
      x: 2000,
      y: 1500,
      targetX: 2000,
      targetY: 1500,
    });
    moveWorker(0.1);
    expect(camera.x).toBeCloseTo(1000 + 0.4 * 1000);
    expect(camera.y).toBeCloseTo(1000 + 0.4 * 500);
  });

  it('오랜 시간이 지나면 주인공 위치에 붙는다', () => {
    Object.assign(game.worker, {
      x: 2000,
      y: 1500,
      targetX: 2000,
      targetY: 1500,
    });
    moveWorker(10);
    expect(camera.x).toBe(2000);
    expect(camera.y).toBe(1500);
  });
});
