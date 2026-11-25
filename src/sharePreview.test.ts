import { describe, expect, it } from 'vitest';
import page from '../index.html?raw';
import imageDataUrl from '../public/og.jpg?inline';

const SITE = 'https://swarm-tower.vercel.app/';
const IMAGE_BYTES_LIMIT = 1024 * 1024;
const HASH_LENGTH = 8;
const FRAME_MARKERS = [0xc0, 0xc1, 0xc2];

function readMeta(name: string) {
  const pattern = new RegExp(
    `(?:property|name)="${name}"\\s+content="([^"]*)"`,
  );
  return page.replace(/\s+/g, ' ').match(pattern)?.[1];
}

function readImageBytes() {
  const binary = atob(imageDataUrl.split(',')[1]);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

// 그림이 바뀌면 해시가 달라져 공유 서비스의 캐시가 새로 읽힌다. 그림을 바꾸면 index.html의 해시도 바꾼다
async function hashImage() {
  const digest = await crypto.subtle.digest('SHA-256', readImageBytes());
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  );
  return hex.join('').slice(0, HASH_LENGTH);
}

// JPEG의 프레임 표지(SOF)에서 너비와 높이를 읽는다
function readJpegSize(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer);
  let offset = 2;
  while (!FRAME_MARKERS.includes(bytes[offset + 1])) {
    offset += 2 + view.getUint16(offset + 2);
  }
  return [view.getUint16(offset + 7), view.getUint16(offset + 5)];
}

describe('공유 미리보기', () => {
  it('게임 이름과 한 줄 설명을 보인다', () => {
    expect(readMeta('og:title')).toBe('Swarm Tower');
    expect(readMeta('og:site_name')).toBe('Swarm Tower');
    expect(readMeta('og:description')).toBe(
      '얼마나 오래 버틸 수 있을까? 적으로부터 본부를 지키는 타워 디펜스',
    );
    expect(readMeta('og:image:alt')).toBe('Swarm Tower');
  });

  it('주소와 그림 주소는 절대 주소이고 그림 주소에 그림의 해시가 붙어 있다', async () => {
    expect(readMeta('og:url')).toBe(SITE);
    expect(readMeta('og:image')).toBe(`${SITE}og.jpg?v=${await hashImage()}`);
    expect(readMeta('twitter:card')).toBe('summary_large_image');
  });

  it('그림은 태그에 적은 1200x630이고 1MB를 넘지 않는다', () => {
    const bytes = readImageBytes();
    const size = readJpegSize(bytes);
    expect(size).toEqual([
      Number(readMeta('og:image:width')),
      Number(readMeta('og:image:height')),
    ]);
    expect(size).toEqual([1200, 630]);
    expect(bytes.length).toBeLessThan(IMAGE_BYTES_LIMIT);
  });
});
