export function rgbToHex(r: number, g: number, b: number): number {
  return (r << 16) | (g << 8) | b;
}

export function hexToRgb(hex: number): [number, number, number] {
  const b = hex & 0xff;
  hex >>= 8;
  const g = hex & 0xff;
  hex >>= 8;
  const r = hex & 0xff;
  return [r, g, b];
}

function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(min, x), max);
}

export function multiply(color: number, brightness: number): number {
  const [r, g, b] = hexToRgb(color)
    .map(component => clamp(component*brightness, 0, 255))
    .map(Math.round);
  return rgbToHex(r, g, b);
}
