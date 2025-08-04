export function isPanning(): boolean {
  return (window as any).isPanning || false;
}

export function isTouchPanning(): boolean {
  return (window as any).isTouchPanning || false;
}