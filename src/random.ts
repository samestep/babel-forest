export function weighted(min, max): number {
  const x = Math.random();
  const y = 2*x - 1;
  return 0.5*((y*y*y)*(max - min) + (min + max));
}
