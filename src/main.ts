import { initializeView } from './camera/view';
import installInput from './input/installInput';
import installDebugHooks from './installDebugHooks';
import draw from './render/draw';
import resetGame from './resetGame';
import update from './sim/update';
import { loadAssets } from './sprites/assets';
import {
  startDeveloperInformation,
  tickDeveloperInformation,
} from './ui/developerInformation';
import installRestart from './ui/installRestart';
import { hideLoading, nextFrame, setLoading, showLoading } from './ui/loading';

import waitForStart from './ui/waitForStart';

const PROGRESS_STARTED = 5;
const PROGRESS_LOADED = 90;
const PROGRESS_READY = 100;
const LOADING_MESSAGE = '불러오는 중';
const MAX_FRAME_SECONDS = 0.05;
const MILLISECONDS_PER_SECOND = 1000;

const clock = { last: 0 };

async function showProgress(percent: number) {
  setLoading(percent, LOADING_MESSAGE);
  await nextFrame();
}

function installPage() {
  initializeView();
  installInput();
  installRestart();
}

// 시트를 읽는 동안은 시작과 읽기 끝 사이를 읽은 비율만큼 채운다
const showLoadedRatio = (ratio: number) =>
  setLoading(
    PROGRESS_STARTED + ratio * (PROGRESS_LOADED - PROGRESS_STARTED),
    LOADING_MESSAGE,
  );

async function loadGame() {
  installPage();
  await showProgress(PROGRESS_STARTED);
  await loadAssets(showLoadedRatio);
  await showProgress(PROGRESS_LOADED);
}

function prepareGame() {
  resetGame();
  draw();
}

// 개발용 훅은 개발 서버에서만 켠다. 배포판에는 들어가지 않는다
function installDevelopmentTools() {
  if (import.meta.env.DEV) {
    installDebugHooks();
  }
}

function advance(now: number) {
  const deltaSeconds = Math.min(
    MAX_FRAME_SECONDS,
    (now - clock.last) / MILLISECONDS_PER_SECOND,
  );
  clock.last = now;
  tickDeveloperInformation(now);
  update(deltaSeconds);
  draw();
}

function runLoop(now: number) {
  advance(now);
  requestAnimationFrame(runLoop);
}

function startLoop() {
  clock.last = performance.now();
  startDeveloperInformation(clock.last);
  runLoop(clock.last);
}

await waitForStart();
showLoading();
await loadGame();
prepareGame();
await showProgress(PROGRESS_READY);
hideLoading();
startLoop();
installDevelopmentTools();
