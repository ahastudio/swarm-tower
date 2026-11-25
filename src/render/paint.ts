import { tracePolygon } from '../canvas/canvasHelpers';
import { COIN_BROWN_COLOR, COIN_GOLD_COLOR, FULL_ARC } from '../constants';
import type { Point, Segment } from '../types';

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export interface Ellipse {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Pen {
  color: string;
  width: number;
}

export function fillEllipse(
  context: CanvasRenderingContext2D,
  color: string,
  shape: Ellipse,
) {
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(
    shape.x,
    shape.y,
    shape.radiusX,
    shape.radiusY,
    0,
    0,
    FULL_ARC,
  );
  context.fill();
}

export function fillCircle(
  context: CanvasRenderingContext2D,
  color: string,
  circle: Circle,
) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(circle.x, circle.y, circle.radius, 0, FULL_ARC);
  context.fill();
}

export function fillRect(
  context: CanvasRenderingContext2D,
  color: string,
  rect: Rect,
) {
  context.fillStyle = color;
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
}

function usePen(context: CanvasRenderingContext2D, pen: Pen) {
  context.strokeStyle = pen.color;
  context.lineWidth = pen.width;
}

export function strokeEllipse(
  context: CanvasRenderingContext2D,
  pen: Pen,
  shape: Ellipse,
) {
  usePen(context, pen);
  context.beginPath();
  context.ellipse(
    shape.x,
    shape.y,
    shape.radiusX,
    shape.radiusY,
    0,
    0,
    FULL_ARC,
  );
  context.stroke();
}

export function strokeCircle(
  context: CanvasRenderingContext2D,
  pen: Pen,
  circle: Circle,
) {
  usePen(context, pen);
  context.beginPath();
  context.arc(circle.x, circle.y, circle.radius, 0, FULL_ARC);
  context.stroke();
}

// 노란 동전 그림: 채운 뒤 같은 경로에 갈색 테두리를 두른다
export function drawCoinIcon(
  context: CanvasRenderingContext2D,
  circle: Circle,
  lineWidth: number,
) {
  fillCircle(context, COIN_GOLD_COLOR, circle);
  usePen(context, { color: COIN_BROWN_COLOR, width: lineWidth });
  context.stroke();
}

export function strokeSegments(
  context: CanvasRenderingContext2D,
  pen: Pen,
  segments: Segment[],
) {
  usePen(context, pen);
  context.beginPath();
  segments.forEach(([startX, startY, endX, endY]) => {
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
  });
  context.stroke();
}

export function fillPolygon(
  context: CanvasRenderingContext2D,
  color: string,
  points: Point[],
) {
  context.fillStyle = color;
  context.beginPath();
  tracePolygon(context, points);
  context.fill();
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export function withTransform(
  context: CanvasRenderingContext2D,
  transform: Transform,
  paint: () => void,
) {
  context.save();
  context.translate(transform.x, transform.y);
  context.scale(transform.scale, transform.scale);
  paint();
  context.restore();
}

export function withRotation(
  context: CanvasRenderingContext2D,
  pose: { x: number; y: number; angle: number },
  paint: () => void,
) {
  context.save();
  context.translate(pose.x, pose.y);
  context.rotate(pose.angle);
  paint();
  context.restore();
}

function scaleAbout(context: CanvasRenderingContext2D, transform: Transform) {
  context.translate(transform.x, transform.y);
  context.scale(transform.scale, transform.scale);
  context.translate(-transform.x, -transform.y);
}

export function withScaleAbout(
  context: CanvasRenderingContext2D,
  transform: Transform,
  paint: () => void,
) {
  context.save();
  scaleAbout(context, transform);
  paint();
  context.restore();
}
