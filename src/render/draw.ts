import { budget } from '../sprites/drawSprite';
import updateStatusDisplay from '../ui/updateStatusDisplay';
import addCoins from './addCoins';
import addEnemies from './addEnemies';
import addFences from './addFences';
import addHouse from './addHouse';
import addProps from './addProps';
import addSpotPrices from './addSpotPrices';
import addTowers from './addTowers';
import addWorker from './addWorker';
import drawEffects from './drawEffects';
import drawGround from './drawGround';
import drawOverlay from './drawOverlay';
import { beginScene, flushScene } from './scene';

// 서 있는 물체를 그릴 순서: 울타리, 꾸밈, 본부, 타워, 주인공, 적, 동전, 판 가격
const ADDERS = [
  addFences,
  addProps,
  addHouse,
  addTowers,
  addWorker,
  addEnemies,
  addCoins,
  addSpotPrices,
];

function drawStandingObjects() {
  const environment = beginScene();
  ADDERS.forEach((add) => {
    add(environment);
  });
  flushScene();
  return environment;
}

function drawObjectsAndEffects() {
  const environment = drawStandingObjects();
  drawEffects(environment);
  drawOverlay(environment);
}

// 한 프레임을 그린다. 바닥 -> 서 있는 물체(발의 화면 y 순서) -> 연출 -> 알림 -> 화면 위의 글자.
export default function draw() {
  budget.count = 0;
  drawGround();
  drawObjectsAndEffects();
  updateStatusDisplay();
}
