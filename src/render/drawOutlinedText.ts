interface TextStyle {
  x: number;
  y: number;
  font: string;
  lineWidth: number;
  stroke: string;
  fill: string;
}

export default function drawOutlinedText(
  context: CanvasRenderingContext2D,
  text: string,
  style: TextStyle,
) {
  Object.assign(context, {
    font: style.font,
    textAlign: 'center',
    textBaseline: 'middle',
    lineWidth: style.lineWidth,
    lineJoin: 'round',
    strokeStyle: style.stroke,
  });
  context.strokeText(text, style.x, style.y);
  context.fillStyle = style.fill;
  context.fillText(text, style.x, style.y);
}
