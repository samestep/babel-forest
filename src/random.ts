export function choose<T>(array: T[]): T {
  // https://stackoverflow.com/a/4550514/5044950
  return array[Math.floor(Math.random() * array.length)];
}

export function weighted(min: number, max: number): number {
  const x = Math.random();
  const y = 2*x - 1;
  return 0.5*((y*y*y)*(max - min) + (min + max));
}
