import { findById } from './domLookup';

const REFRESH_MILLISECONDS = 500;
const MILLISECONDS_PER_SECOND = 1000;

const counter = { frames: 0, since: 0 };

// 게임 루프를 시작할 때 첫 구간의 시작 시각을 정한다
export function startFpsCounter(now: number) {
  counter.frames = 0;
  counter.since = now;
}

function publishFps(now: number) {
  const fps = Math.round(
    (counter.frames * MILLISECONDS_PER_SECOND) / (now - counter.since),
  );
  findById('developer-information').textContent = `${fps} fps`;
  counter.frames = 0;
  counter.since = now;
}

export default function tickFps(now: number) {
  counter.frames++;
  if (now - counter.since >= REFRESH_MILLISECONDS) {
    publishFps(now);
  }
}
