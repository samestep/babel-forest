import { JSONMap } from './map';

export interface Graph<T> {
  neighbors(node: T): T[];
}

export function bfs<T>(graph: Graph<T>, start: T, depth: number): T[] {
  const result: T[] = [];
  const visited: JSONMap<T, null> = new JSONMap();
  const queue: [T, number][] = [[start, 0]];
  while (queue.length > 0) {
    const [v, d] = queue.shift();
    visited.set(v, null);
    if (d < depth) {
      graph.neighbors(v).filter(n => !(visited.has(n))).forEach(n => {
        queue.push([n, d + 1]);
      });
    } else {
      result.push(v);
    }
  }
  return result;
}
