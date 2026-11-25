import game from '../game';
import { findById } from './domLookup';
import formatSurvivalTime from './formatSurvivalTime';

export default function showGameOver() {
  game.over = true;
  findById('survival-result').textContent =
    `생존 시간 ${formatSurvivalTime(game.time)}`;
  findById('game-over-message').textContent =
    `웨이브 ${game.wave}까지 버텼습니다`;
  findById('over').style.display = 'flex';
}
