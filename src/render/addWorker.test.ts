import { beforeEach, describe, expect, it } from 'vitest';
import camera from '../camera/camera';
import game from '../game';
import { spriteAssets } from '../sprites/assets';
import { installFakeAssets } from '../testing/fakeAssets';
import { makeRenderEnvironment, projectFoot } from '../testing/fakeEnv';
import { prepareFreshGame } from '../testing/freshGame';
import addWorker from './addWorker';

beforeEach(() => {
  prepareFreshGame();
  installFakeAssets();
  camera.tilt = 0.5;
  Object.assign(game.worker, {
    x: 100,
    y: 200,
    heading: 0.7,
    swing: 0,
    isMoving: false,
    walk: 0,
  });
});

const draw = () => {
  const fake = makeRenderEnvironment(2);
  addWorker(fake.environment);
  return fake;
};

describe('addWorker 모양', () => {
  it('주인공은 화면 밖에서도 항상 놓는다', () => {
    expect(draw().placed[0].margin).toBe(Number.POSITIVE_INFINITY);
  });

  it('그림자와 발밑 고리를 먼저 그리고 향한 쪽으로 돌린 그림을 놓는다', () => {
    const fake = draw();
    const foot = projectFoot({ x: 100, y: 200 });
    expect(fake.shadows[0]).toEqual([foot.x, foot.y, 20]);
    expect(
      fake.calls.find((call) => call.name === 'ellipse')?.callArguments,
    ).toEqual([foot.x, foot.y + 4, 52, 26 * 0.5 * 2, 0, 0, 7]);
    expect(
      fake.calls.find((call) => call.name === 'set:strokeStyle')?.callArguments,
    ).toEqual(['#d6ec58']);
    expect(fake.stacks[0].placement).toEqual({
      angle: 0.7,
      x: foot.x,
      y: foot.y,
    });
  });
});

describe('addWorker 동작', () => {
  it('서 있으면 대기 그림이다', () => {
    expect(draw().stacks[0].stack).toBe(spriteAssets.manIdle);
  });

  it('걸으면 걸음 수에 맞는 걷기 그림이고 한 바퀴 돌면 처음으로 돌아간다', () => {
    game.worker.isMoving = true;
    game.worker.walk = 1.9;
    expect(draw().stacks[0].stack).toBe(spriteAssets.manWalk[1]);
    game.worker.walk = 3.2;
    expect(draw().stacks[0].stack).toBe(spriteAssets.manWalk[0]);
  });

  it('쏘는 중에는 남은 시간에 따라 던지기 그림이 넘어간다', () => {
    game.worker.swing = 0.3;
    expect(draw().stacks[0].stack).toBe(spriteAssets.manThrow[0]);
    game.worker.swing = 0.15;
    expect(draw().stacks[0].stack).toBe(spriteAssets.manThrow[2]);
    game.worker.swing = 0.0001;
    expect(draw().stacks[0].stack).toBe(spriteAssets.manThrow[3]);
  });

  it('쏘는 중이면 걸어도 던지기 그림이다', () => {
    game.worker.swing = 0.2;
    game.worker.isMoving = true;
    expect(spriteAssets.manThrow).toContain(draw().stacks[0].stack);
  });
});
