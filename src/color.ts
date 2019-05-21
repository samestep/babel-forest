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
