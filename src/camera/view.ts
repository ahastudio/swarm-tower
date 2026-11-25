import { getCanvasContext } from '../canvas/canvasHelpers';

const MAX_PIXEL_RATIO = 2;

interface ViewScreen {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

let screen: ViewScreen | undefined;

// 캔버스는 처음 쓸 때 한 번만 만든다. 모듈을 불러오는 것만으로 DOM에 닿지 않게 하려는 것이다
function getScreen() {
  if (!screen) {
    const canvas = document.createElement('canvas');
    screen = { canvas, context: getCanvasContext(canvas) };
  }
  return screen;
}

const view = {
  width: 0,
  height: 0,
  pixelRatio: 1,
  get canvas() {
    return getScreen().canvas;
  },
  get context() {
    return getScreen().context;
  },
};

export default view;

export function resizeView() {
  view.pixelRatio = Math.min(devicePixelRatio || 1, MAX_PIXEL_RATIO);
  view.width = innerWidth;
  view.height = innerHeight;
  view.canvas.width = view.width * view.pixelRatio;
  view.canvas.height = view.height * view.pixelRatio;
}

export function initializeView() {
  document.body.prepend(view.canvas);
  addEventListener('resize', resizeView);
  resizeView();
}
