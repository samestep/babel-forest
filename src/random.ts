import * as seedrandom from 'seedrandom';
import * as _ from 'underscore';

import { rgbToHex } from './color';

export function choose<T>(array: T[]): T {
  // https://stackoverflow.com/a/4550514/5044950
  return array[Math.floor(Math.random() * array.length)];
}

export function weighted(min: number, max: number): number {
  const x = Math.random();
  const y = 2*x - 1;
  return 0.5*((y*y*y)*(max - min) + (min + max));
}

export function color(sum: number, rng: seedrandom.prng): number {
  const r = Math.floor(rng()*(sum+1));
  const g = Math.floor(rng()*(sum-r+1));
  const b = sum - r - g;
  return rgbToHex(r, g, b);
}

export function groupSize(max: number, rng: seedrandom.prng): number {
  const pmf = new Map(_.times(max, i => {
    const outcome = i + 1;
    return [outcome, 1/(outcome*outcome)];
  }));
  const total = Array.from(pmf.values()).reduce((x, y) => x + y);
  const choice = rng()*total;
  let running = 0;
  for (let i = 1; i <= max; ++i) {
    const next = running + pmf.get(i);
    if (choice < next) {
      return i;
    }
    running = next;
  }
  return 1;
}
