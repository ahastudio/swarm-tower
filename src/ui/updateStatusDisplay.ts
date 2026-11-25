import game from '../game';
import { findById } from './domLookup';
import formatSurvivalTime from './formatSurvivalTime';

const PULSE_FADE = 0.06;
const PULSE_SCALE = 0.18;

function createWaveText() {
  if (game.phase === 'break') {
    return `웨이브 ${game.wave + 1}까지 ${Math.max(0, Math.ceil(game.phaseTime))}초`;
  }
  return `웨이브 ${game.wave} · 남은 적 ${game.enemies.length + game.toSpawn}`;
}

export default function updateStatusDisplay() {
  findById('coin-count').textContent = String(game.coins);
  game.pulse = Math.max(0, game.pulse - PULSE_FADE);
  findById('coins').style.transform = `scale(${1 + game.pulse * PULSE_SCALE})`;
  findById('survival').textContent =
    `생존 시간 ${formatSurvivalTime(game.time)}`;
  findById('wave').textContent = createWaveText();
}
