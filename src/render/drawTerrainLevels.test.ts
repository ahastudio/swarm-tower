import { beforeEach, describe, expect, it } from 'vitest';
import camera from '../camera/camera';
import { calculateLift, project, scratchFirst } from '../camera/projection';
import view from '../camera/view';
import { LEVEL_COUNT, MAP_MARGIN } from '../constants';
import { createFakeContext } from '../testing/fakeCanvas';
import { prepareFreshGame } from '../testing/freshGame';
import getTerrainPaths from '../world/getTerrainPaths';
import drawTerrainLevels from './drawTerrainLevels';
import getGroundLayers from './getGroundLayers';

const origin = { x: 600, y: 700 };

beforeEach(() => {
  prepareFreshGame();
  Object.assign(camera, {
    zoom: 1,
    rotation: 0,
    tilt: 1,
    rotationCos: 1,
    rotationSin: 0,
  });
  Object.assign(view, { pixelRatio: 1 });
  Object.assign(scratchFirst, { x: 33, y: 44 });
});

const draw = () => {
  const fake = createFakeContext();
  drawTerrainLevels(fake.context, origin);
  return fake.calls;
};

describe('drawTerrainLevels', () => {
  it('층마다 옆면 5겹과 윗면을 채우고 낮은 층부터 차례로 그린다', () => {
    const fills = draw().filter((call) => call.name === 'fill');
    expect(fills).toHaveLength(LEVEL_COUNT * 6);
    expect(fills.map((call) => call.callArguments[0])).toEqual(
      getTerrainPaths().flatMap((path) => Array(6).fill(path)),
    );
  });

  it('옆면은 층 높이를 2씩 올려 쌓고 윗면은 층 높이에 놓는다', () => {
    const transforms = draw()
      .filter((call) => call.name === 'setTransform')
      .map((call) => call.callArguments[5]);
    expect(transforms.slice(0, 6)).toEqual([
      origin.y - calculateLift(0),
      origin.y - calculateLift(2),
      origin.y - calculateLift(4),
      origin.y - calculateLift(6),
      origin.y - calculateLift(8),
      origin.y - calculateLift(10),
    ]);
  });

  it('층마다 색이 정해져 있어 옆면은 어둡고 윗면은 밝다', () => {
    const styles = draw()
      .filter((call) => call.name === 'set:fillStyle')
      .map((call) => call.callArguments[0]);
    expect(styles.slice(0, 6)).toEqual(
      Array(5).fill('#6c9f4a').concat('#b5df89'),
    );
    expect(styles.slice(-6)).toEqual(
      Array(5).fill('#aadd80').concat('#f4ffd9'),
    );
  });

  it('윗면 질감은 층 모양으로 잘라 반투명하게 한 번 더 얹는다', () => {
    const calls = draw();
    const clips = calls
      .filter((call) => call.name === 'clip')
      .map((call) => call.callArguments[0]);
    expect(clips).toEqual(getTerrainPaths());
    const images = calls.filter((call) => call.name === 'drawImage');
    expect(images).toHaveLength(LEVEL_COUNT);
    expect(images[0].callArguments).toEqual([getGroundLayers().top, 0, 0]);
    expect(
      calls
        .filter((call) => call.name === 'set:globalAlpha')
        .map((call) => call.callArguments[0]),
    ).toEqual(Array(LEVEL_COUNT).fill(0.45));
  });

  it('질감의 왼쪽 위 모서리는 다른 투영 결과와 상관없이 지도 모서리에 놓인다', () => {
    const transforms = draw().filter((call) => call.name === 'setTransform');
    const corner = project(-MAP_MARGIN, -MAP_MARGIN, { x: 0, y: 0 });
    expect(transforms[6].callArguments).toEqual([
      2,
      0,
      -0,
      2,
      corner.x,
      corner.y - calculateLift(10),
    ]);
    expect(transforms[13].callArguments).toEqual([
      2,
      0,
      -0,
      2,
      corner.x,
      corner.y - calculateLift(20),
    ]);
  });

  it('질감마다 저장하고 복원한다', () => {
    const calls = draw();
    expect(calls.filter((call) => call.name === 'save')).toHaveLength(
      LEVEL_COUNT,
    );
    expect(calls.filter((call) => call.name === 'restore')).toHaveLength(
      LEVEL_COUNT,
    );
  });
});
