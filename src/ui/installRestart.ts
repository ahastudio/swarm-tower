import game from '../game';
import resetGame from '../resetGame';
import { findById } from './domLookup';

const RESTART_KEYS = ['Enter', ' '];

function restart() {
  if (!game.over) {
    return;
  }
  game.over = false;
  findById('over').style.display = 'none';
  resetGame();
}

export default function installRestart() {
  findById('again').addEventListener('click', restart);
  addEventListener('keydown', (event) => {
    if (RESTART_KEYS.includes(event.key)) {
      restart();
    }
  });
}
