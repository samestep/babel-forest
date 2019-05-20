/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import * as seedrandom from 'seedrandom';
import * as _ from 'underscore';

import { JSONMap } from './map';

interface WorldConfig {
  roomWidth: number;
  roomHeight: number;

  wallThickness: number;
  ceilThickness: number;

  ladderWidth: number;
  doorHeight: number;
}

interface Room<T> {
  ceilLeft: T;
  ceilRight: T;
  wallLeft: T;

  trap?: T; // in ceiling
  door?: T; // in left wall
}

export class World {
  config: WorldConfig;
  comp: Matter.Composite;
  rooms: JSONMap<[number, number], Room<Matter.Body>>;

  constructor(config: WorldConfig) {
    this.config = config;
    this.comp = Matter.Composite.create();
    this.rooms = new JSONMap();
  }

  query(col: number, row: number): { trap: boolean, door: boolean } {
    const rng = seedrandom(JSON.stringify([col, row]));
    let n = rng.int32();
    const trap = (n & 1) > 0;
    n = n >> 1;
    const door = (n & 1) > 0;

    if (row === 1) {
      return { trap: true, door };
    } else if (row === 0) {
      return { trap: false, door: false };
    } else {
      return { trap, door };
    }
  }

  closestRoom(v: Matter.Vector): [number, number] {
    const x = v.x / (this.config.roomWidth + this.config.wallThickness);
    const y = v.y / (this.config.roomHeight + this.config.ceilThickness);
    return [Math.round(x), Math.round(y)];
  }

  roomCenter(col: number, row: number): Matter.Vector {
    const x = col * (this.config.roomWidth + this.config.wallThickness);
    const y = row * (this.config.roomHeight + this.config.ceilThickness);
    return { x, y };
  }

  rects(col: number, row: number): Room<Phaser.Geom.Rectangle> {
    const { trap, door } = this.query(col, row);
    const { x, y } = this.roomCenter(col, row);
    const ceilPartWidth = (this.config.roomWidth - this.config.ladderWidth)/2 + this.config.wallThickness;
    const wallPartHeight = this.config.roomHeight - this.config.doorHeight + this.config.ceilThickness;
    const rects: Room<Phaser.Geom.Rectangle> = {
      ceilLeft: new Phaser.Geom.Rectangle(
        x - this.config.roomWidth/2 - this.config.wallThickness,
        y - this.config.roomHeight/2 - this.config.ceilThickness,
        ceilPartWidth,
        this.config.ceilThickness,
      ),
      ceilRight: new Phaser.Geom.Rectangle(
        x + this.config.ladderWidth/2,
        y - this.config.roomHeight/2 - this.config.ceilThickness,
        ceilPartWidth,
        this.config.ceilThickness,
      ),
      wallLeft: new Phaser.Geom.Rectangle(
        x - this.config.roomWidth/2 - this.config.wallThickness,
        y - this.config.roomHeight/2 - this.config.ceilThickness,
        this.config.wallThickness,
        wallPartHeight,
      ),
    };
    if (trap) {
      rects.trap = new Phaser.Geom.Rectangle(
        x - this.config.ladderWidth/2,
        y - this.config.roomHeight/2 - this.config.ceilThickness,
        this.config.ladderWidth,
        this.config.ceilThickness,
      );
    }
    if (door) {
      rects.door = new Phaser.Geom.Rectangle(
        x - this.config.roomWidth/2 - this.config.wallThickness,
        y + this.config.roomHeight/2 - this.config.doorHeight,
        this.config.wallThickness,
        this.config.doorHeight,
      );
    }
    return rects;
  }

  update(worldView: Phaser.Geom.Rectangle) {
    const corner1 = { x: worldView.left, y: worldView.top };
    const corner2 = { x: worldView.right, y: worldView.bottom };
    const [tileCorner1, tileCorner2] = [corner1, corner2].map(corner => {
      return this.closestRoom(corner);
    });

    const colMin = tileCorner1[0] - 1;
    const colMax = tileCorner2[0] + 1;
    const rowMin = tileCorner1[1] - 1;
    const rowMax = tileCorner2[1] + 1;

    this.rooms.forEach((key, room) => {
      const [x, y] = key;
      if (x < colMin || colMax < x || y < rowMin || rowMax < y) {
        const bodies = [room.ceilLeft, room.ceilRight, room.wallLeft];
        if (room.trap) { bodies.push(room.trap); }
        if (room.door) { bodies.push(room.door); }
        bodies.forEach(body => Matter.Composite.remove(this.comp, body));
        this.rooms.delete(key);
      }
    });

    for (let col = colMin; col <= colMax; col++) {
      for (let row = rowMin; row <= rowMax; row++) {
        if (this.query(col, row) && !(this.rooms.has([col, row]))) {
          const room = _.mapObject(this.rects(col, row), (rect) => {
            const body =  Matter.Bodies.rectangle(
              rect.centerX, rect.centerY, rect.width, rect.height,
              { isStatic: true },
            );
            Matter.Composite.add(this.comp, body);
            return body;
          });
          // @ts-ignore: Argument of type 'Dictionary<Body>' is not ...
          this.rooms.set([col, row], room);
        }
      }
    }
  }

  render(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0x000000);
    this.rooms.keys().forEach(([col, row]) => {
      if (row > 0) {
        const { x, y } = this.roomCenter(col, row);
        graphics.fillRect(
          x - this.config.roomWidth / 2 - this.config.wallThickness,
          y - this.config.roomHeight / 2 - this.config.ceilThickness,
          this.config.wallThickness + this.config.roomWidth,
          this.config.ceilThickness + this.config.roomHeight,
        );
      } else {
        _.values(this.rects(col, row)).forEach(rect => {
          graphics.fillRectShape(rect);
        });
      }
    });
  }
}
