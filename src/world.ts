/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import * as seedrandom from 'seedrandom';

import { JSONMap } from './map';

const tileSize = 100.0;

export class World {
  comp: Matter.Composite;
  bodies: JSONMap<[number, number], Matter.Body>;

  constructor() {
    this.comp = Matter.Composite.create();
    this.bodies = new JSONMap();
  }

  query(col: number, row: number): boolean {
    if (col === 0 && row === 0) {
      return false;
    } else {
      const rng = seedrandom(`${col},${row}`);
      return rng.int32() % 2 === 1;
    }
  }

  worldToTile(v: Matter.Vector): [number, number] {
    const [x, y] = [v.x, v.y].map(coord => Math.round(coord / tileSize));
    return [x, y];
  }

  tileToWorld(col: number, row: number): Matter.Vector {
    const [x, y] = [col, row].map(coord => coord * tileSize);
    return { x, y };
  }

  update(worldView: Phaser.Geom.Rectangle) {
    const corner1 = { x: worldView.left, y: worldView.top };
    const corner2 = { x: worldView.right, y: worldView.bottom };
    const [tileCorner1, tileCorner2] = [corner1, corner2].map(this.worldToTile);

    const colMin = tileCorner1[0] - 1;
    const colMax = tileCorner2[0] + 1;
    const rowMin = tileCorner1[1] - 1;
    const rowMax = tileCorner2[1] + 1;

    const keys = this.bodies.keys();
    keys.forEach(key => {
      const [x, y] = key;
      if (x < colMin || colMax < x || y < rowMin || rowMax < y) {
        Matter.Composite.remove(this.comp, this.bodies.get(key));
        this.bodies.delete(key);
      }
    });

    for (let col = colMin; col <= colMax; col++) {
      for (let row = rowMin; row <= rowMax; row++) {
        if (this.query(col, row) && !(this.bodies.has([col, row]))) {
          const { x, y } = this.tileToWorld(col, row);
          const tile = Matter.Bodies.rectangle(x, y, tileSize, tileSize, {
            isStatic: true
          });
          Matter.Composite.add(this.comp, tile);
          this.bodies.set([col, row], tile);
        }
      }
    }
  }

  render(graphics: Phaser.GameObjects.Graphics) {
    this.bodies.values().forEach(body => {
      graphics.fillStyle(0x000000);
      graphics.fillRect(
        body.position.x - tileSize / 2.0, body.position.y - tileSize / 2.0,
        tileSize, tileSize,
      );
    });
  }
}
