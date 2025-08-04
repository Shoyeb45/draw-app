const ARROW_ANGLE = Math.PI / 6;
const ARROW_LENGTH = 10;

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  scale: number
) {
  const headLength = ARROW_LENGTH;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);

  // Draw main line
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - ARROW_ANGLE),
    y2 - headLength * Math.sin(angle - ARROW_ANGLE)
  );
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + ARROW_ANGLE),
    y2 - headLength * Math.sin(angle + ARROW_ANGLE)
  );
  ctx.stroke();
}
