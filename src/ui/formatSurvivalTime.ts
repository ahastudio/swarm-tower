import type { Seconds } from '../types';

const SECONDS_PER_MINUTE = 60;
const SECOND_DIGITS = 2;

// 생존 시간을 분:초로 쓴다. 125초는 2:05
export default function formatSurvivalTime(seconds: Seconds) {
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / SECONDS_PER_MINUTE);
  const rest = String(wholeSeconds % SECONDS_PER_MINUTE);
  return `${minutes}:${rest.padStart(SECOND_DIGITS, '0')}`;
}
