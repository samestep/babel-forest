/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

const points: [number, number][] = [
  [0, -150],
  [100, -100],
  [0, -125],
  [-100, -100],
];

function to(
  f: (x: number, y: number) => void,
  center: Matter.Vector,
  arrow: Matter.Vector,
  point: [number, number],
) {
  const [x, y] = point;
  const angle = Math.atan2(arrow.y, arrow.x) - Math.PI/2;
  const rotated = Matter.Vector.rotate({ x, y }, angle);
  const translated = Matter.Vector.add(center, rotated);
  f(translated.x, translated.y);
}

export function drawArrow(
  graphics: Phaser.GameObjects.Graphics,
  center: Matter.Vector,
  arrow: Matter.Vector,
) {
  const dist = Matter.Vector.magnitude(arrow);
  graphics.fillStyle(0xffffff, Math.max(0, Math.min((dist/250)-1, 1)));
  const move = (x: number, y: number) => graphics.moveTo(x, y);
  const line = (x: number, y: number) => graphics.lineTo(x, y);
  to(move, center, arrow, points[0]);
  points.slice(1).forEach(point => to(line, center, arrow, point));
  to(line, center, arrow, points[0]);
  graphics.fillPath();
}
