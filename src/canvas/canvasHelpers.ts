import type { Point } from '../types';

export function getCanvasContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('2D 캔버스 컨텍스트를 얻지 못했습니다');
  }
  return context;
}

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function createPixelContext(canvas: HTMLCanvasElement) {
  const context = getCanvasContext(canvas);
  context.imageSmoothingEnabled = false;
  return context;
}

export function tracePolygon(path: CanvasPath, points: Point[]) {
  path.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => {
    path.lineTo(point.x, point.y);
  });
  path.closePath();
}
