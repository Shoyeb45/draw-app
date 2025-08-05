export function renderTextShape(
  ctx: CanvasRenderingContext2D,
  shape: {
    x: number;
    y: number;
    content: string;
    fontSize?: number;
    fontFamily?: string;
    letterSpacing?: number;
    textAlign?: "left" | "center" | "right";
    lineHeight?: number;
    color?: string;
  }
) {
  const {
    x,
    y,
    content,
    fontSize = 16,
    fontFamily = "Cascadia Code, Chalkboard SE, sans-serif",
    letterSpacing = 1,
    textAlign = "center",
    lineHeight = 1.2,
    color = "white"
  } = shape;

  ctx.save();
  
  // Set font properties to match textarea
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = textAlign;
  ctx.textBaseline = "top"; // Important: match textarea's text baseline
  ctx.fillStyle = color;
  ctx.letterSpacing = `${letterSpacing}px`;
  
  const lines = content.split('\n');
  const lineHeightPx = fontSize * lineHeight;
  
  lines.forEach((line, index) => {
    const lineY = y + (index * lineHeightPx);
    ctx.fillText(line, x, lineY);
  });
  
  ctx.restore();
}

// Helper function to get text dimensions (useful for selection/interaction)
export function getTextDimensions(
  ctx: CanvasRenderingContext2D,
  content: string,
  fontSize = 16,
  fontFamily = "Cascadia Code, Chalkboard SE, sans-serif",
  letterSpacing = 1,
  lineHeight = 1.2
) {
  ctx.save();
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.letterSpacing = `${letterSpacing}px`;
  
  const lines = content.split('\n');
  const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
  const height = lines.length * fontSize * lineHeight;
  
  ctx.restore();
  
  return { width: maxWidth, height };
}