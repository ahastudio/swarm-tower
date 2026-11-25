import { findById } from './domLookup';
import tickFps, { startFpsCounter } from './tickFps';

// 개발자 정보(지금은 fps)는 개발 서버에서만 보인다. 배포판에는 들어가지 않는다
export function startDeveloperInformation(now: number) {
  if (import.meta.env.DEV) {
    findById('developer-information').hidden = false;
    startFpsCounter(now);
  }
}

export function tickDeveloperInformation(now: number) {
  if (import.meta.env.DEV) {
    tickFps(now);
  }
}
