import { describe, expect, it } from 'vitest';
import { MAP_HEIGHT, MAP_MARGIN, MAP_WIDTH, PONDS } from '../constants';
import { randomState } from '../randomNumbers';
import { findContext } from '../testing/fakeCanvas';
import { findShorePoint } from '../world/islandShape';
import getGroundLayers from './getGroundLayers';

const findCalls = (canvas: HTMLCanvasElement) => findContext(canvas).calls;
const count = (canvas: HTMLCanvasElement, name: string) =>
  findCalls(canvas).filter((call) => call.name === name).length;
const fillStyles = (canvas: HTMLCanvasElement) =>
  findCalls(canvas)
    .filter((call) => call.name === 'set:fillStyle')
    .map((call) => call.callArguments[0]);

describe('getGroundLayers', () => {
  it('처음 한 번만 만들고 다음부터는 같은 것을 돌려준다', () => {
    expect(getGroundLayers()).toBe(getGroundLayers());
  });

  it('난수 시드를 원래대로 돌려 놓는다', () => {
    randomState.seed = 99;
    const before = randomState.seed;
    getGroundLayers();
    expect(randomState.seed).toBe(before);
  });

  it('바다, 섬 옆면 두 장, 섬 윗면을 반 해상도로 만든다', () => {
    const { sea, bands, top } = getGroundLayers();
    const size = [
      Math.ceil((MAP_WIDTH + MAP_MARGIN * 2) / 2),
      Math.ceil((MAP_HEIGHT + MAP_MARGIN * 2) / 2),
    ];
    expect(bands).toHaveLength(2);
    for (const canvas of [sea, ...bands, top]) {
      expect([canvas.width, canvas.height]).toEqual(size);
    }
  });

  it('모든 그림은 여백만큼 옮기고 반으로 줄여 월드 좌표로 그린다', () => {
    const { sea, top } = getGroundLayers();
    for (const canvas of [sea, top]) {
      expect(findCalls(canvas).slice(0, 2)).toEqual([
        { name: 'scale', callArguments: [0.5, 0.5] },
        { name: 'translate', callArguments: [300, 300] },
      ]);
    }
  });
});

describe('바다', () => {
  it('바탕색 위에 파도 2400개와 거품 1700개를 흩뿌린다', () => {
    const { sea } = getGroundLayers();
    expect(count(sea, 'fillRect')).toBe(1 + 2400 + 1700);
    expect(fillStyles(sea)[0]).toBe('#4db6e6');
    expect(fillStyles(sea)).toContain('#5fc4ee');
    expect(fillStyles(sea)).toContain('#3fa6d8');
    expect(fillStyles(sea).filter((style) => style === '#c9efff')).toHaveLength(
      1700,
    );
  });

  it('섬 둘레를 두 번 굵게 그어 파도가 부서지는 모습을 낸다', () => {
    const { sea } = getGroundLayers();
    const widths = findCalls(sea)
      .filter((call) => call.name === 'set:lineWidth')
      .map((call) => call.callArguments[0]);
    expect(widths).toEqual([110, 50]);
  });
});

describe('섬 옆면', () => {
  it('섬 모양을 흙색으로 채운 그림 두 장이다', () => {
    const { bands } = getGroundLayers();
    expect(fillStyles(bands[0])).toEqual(['#7a5838']);
    expect(fillStyles(bands[1])).toEqual(['#b08350']);
    expect(count(bands[0], 'fill')).toBe(1);
  });

  it('섬 모양은 바닷가 점 361개를 이은 닫힌 경로다', () => {
    const { bands } = getGroundLayers();
    expect(count(bands[0], 'moveTo')).toBe(1);
    expect(count(bands[0], 'lineTo')).toBe(360);
    expect(
      findCalls(bands[0]).find((call) => call.name === 'moveTo')?.callArguments,
    ).toEqual(findShorePoint(0));
    expect(count(bands[0], 'closePath')).toBe(1);
  });
});

describe('섬 윗면', () => {
  it('섬 모양으로 잘라 그리고 끝에 복원한다', () => {
    const { top } = getGroundLayers();
    expect(count(top, 'clip')).toBe(1);
    expect(count(top, 'save')).toBe(1);
    expect(count(top, 'restore')).toBe(1);
  });

  it('풀색 바탕 위에 풀 무늬 1700개와 풀 점 8500개를 흩뿌린다', () => {
    const { top } = getGroundLayers();
    expect(fillStyles(top)[0]).toBe('#bfe39a');
    for (const color of [
      '#a8d98a',
      '#cdeba9',
      '#d9f0b8',
      '#9fd27f',
      '#e6f7c4',
    ]) {
      expect(fillStyles(top)).toContain(color);
    }
    const blobs = count(top, 'ellipse') - 2 * PONDS.length;
    expect(blobs).toBe(1700);
  });

  it('바닷가 모래를 두 겹으로 긋고 모래 반짝임 1500개를 놓는다', () => {
    const { top } = getGroundLayers();
    const widths = findCalls(top)
      .filter((call) => call.name === 'set:lineWidth')
      .map((call) => call.callArguments[0]);
    expect(widths).toEqual([120, 56]);
    expect(fillStyles(top).filter((style) => style === '#fff4cf')).toHaveLength(
      1500,
    );
  });

  it('연못은 둘레 모래를 그린 뒤 안쪽을 투명하게 파낸다', () => {
    const { top } = getGroundLayers();
    const names = findCalls(top).map((call) => call.name);
    const cutStart = findCalls(top).findIndex(
      (call) => call.name === 'set:globalCompositeOperation',
    );
    expect(findCalls(top)[cutStart].callArguments).toEqual(['destination-out']);
    expect(
      names.slice(cutStart).filter((name) => name === 'ellipse'),
    ).toHaveLength(PONDS.length);
    const last = findCalls(top)
      .filter((call) => call.name === 'set:globalCompositeOperation')
      .at(-1);
    expect(last?.callArguments).toEqual(['source-over']);
    expect(fillStyles(top)).toContain('#000');
  });
});
