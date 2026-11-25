import { beforeEach, describe, expect, it } from 'vitest';
import { spriteAssets } from '../sprites/assets';
import { installFakeAssets } from '../testing/fakeAssets';
import { makeRenderEnvironment, projectFoot } from '../testing/fakeEnv';
import { fencePieces } from '../world/yard';
import addFences from './addFences';

beforeEach(installFakeAssets);

describe('addFences', () => {
  it('울타리 조각마다 화면 안에 있을 때 층 그림을 놓는다', () => {
    const fake = makeRenderEnvironment();
    addFences(fake.environment);
    expect(fake.placed).toHaveLength(fencePieces.length);
    expect(fake.placed[0]).toEqual({
      point: { x: fencePieces[0][0], y: fencePieces[0][1] },
      margin: 80,
    });
  });

  it('조각의 방향과 화면 발 위치로 그린다', () => {
    const fake = makeRenderEnvironment();
    addFences(fake.environment);
    const [x, y, angle] = fencePieces[2];
    const foot = projectFoot({ x, y });
    expect(fake.stacks[2]).toEqual({
      stack: spriteAssets.fence,
      placement: { angle, x: foot.x, y: foot.y },
    });
  });
});
