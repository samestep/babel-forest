/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import * as seedrandom from 'seedrandom';

import { JSONMap } from './map';
import { drawBooks, generateBooks } from './book';
import * as random from './random';

interface WorldConfig {
  book: number; // the height of the gap between bookshelves
  door: number; // the height of doors (expressed as number of bookshelves)
  gap: number; // the gap between the two poles of a ladder
  height: number; // the height of the room (expressed as number of bookshelves)
  shelf: number; // the thickness of the bookshelves and ladder parts
  trap: number; // the width of the  opening in the ceiling for the ladder
  wall: number; // the thickness of the walls, ceilings, and floors
  width: number; // the width of the room
}

function worldHeight(config: WorldConfig): number {
  return config.height * (config.book + config.shelf) - config.shelf;
}

function innerCorner(config: WorldConfig): [number, number] {
  return [-config.width/2, -worldHeight(config)/2];
}

function outerCorner(config: WorldConfig): [number, number] {
  const [x, y] = innerCorner(config);
  return [x - config.wall, y - config.wall];
}

function fullSize(config: WorldConfig): [number, number] {
  return [config.wall + config.width, config.wall + worldHeight(config)];
}

function shelfWidth(config: WorldConfig): number {
  return (config.width - config.trap)/2;
}

function ceilPartWidth(config: WorldConfig): number {
  return shelfWidth(config) + config.wall;
}

function worldDoor(config: WorldConfig): number {
  return config.door * (config.book + config.shelf) - config.shelf;
}

function wallPartHeight(config: WorldConfig): number {
  return config.wall + worldHeight(config) - worldDoor(config);
}

const wallColor = 0x5c4019;
const ladderColor = 0xa88a62;
const shelfColor = 0xa87632;

export class World {
  config: WorldConfig;
  comp: Matter.Composite;
  rooms: JSONMap<[number, number], Matter.Body[]>;
  darkness: number;

  constructor(config: WorldConfig) {
    this.config = config;
    this.comp = Matter.Composite.create();
    this.rooms = new JSONMap();
    this.darkness = 1;
  }

  query(col: number, row: number): { trap: boolean; door: boolean } {
    const rng = seedrandom(JSON.stringify([col, row]));
    let n = rng.int32();
    const trap = (n & 1) > 0;
    n = n >> 1;
    const door = (n & 1) > 0;

    if (row === 1) {
      return { trap: true, door };
    } else if (row === 0) {
      return { trap, door: false };
    } else {
      return { trap, door };
    }
  }

  closestRoom(v: Matter.Vector): [number, number] {
    const [w, h] = fullSize(this.config);
    return [Math.round(v.x / w), Math.round(v.y / h)];
  }

  roomCenter(col: number, row: number): Matter.Vector {
    const [w, h] = fullSize(this.config);
    return { x: col*w, y: row*h };
  }

  rects(col: number, row: number): Phaser.Geom.Rectangle[] {
    const { trap, door } = this.query(col, row);
    const { x, y } = this.roomCenter(col, row);
    const [outerX, outerY] = outerCorner(this.config);

    if (row > 0) {
      const [width, height] = fullSize(this.config)
      return [new Phaser.Geom.Rectangle(x + outerX, y + outerY, width, height)];
    }

    const rects = [
      // left ceiling
      new Phaser.Geom.Rectangle(
        x + outerX, y + outerY,
        ceilPartWidth(this.config), this.config.wall,
      ),
      // right ceiling
      new Phaser.Geom.Rectangle(
        x + this.config.trap/2, y + outerY,
        ceilPartWidth(this.config), this.config.wall,
      ),
      // left wall part
      new Phaser.Geom.Rectangle(
        x + outerX, y + outerY,
        this.config.wall, wallPartHeight(this.config),
      ),
    ];
    if (trap) {
      rects.push(new Phaser.Geom.Rectangle(
        x - this.config.trap/2, y + outerY,
        this.config.trap, this.config.wall,
      ));
    }
    if (door) {
      rects.push(new Phaser.Geom.Rectangle(
        x + outerX, y + worldHeight(this.config)/2 - worldDoor(this.config),
        this.config.wall, worldDoor(this.config),
      ));
    }
    return rects;
  }

  roomShelves(col: number, row: number): [Phaser.Geom.Rectangle, string][] {
    const { trap } = this.query(col, row);
    const { trap: trapBelow } = this.query(col, row + 1);
    const shelves = [];
    for (let i = 1; i < this.config.height; i++) {
      const y = this.config.wall + i*(this.config.book + this.config.shelf) - this.config.shelf;
      if (!trap || (!trapBelow && i >= this.config.height - 1)) {
        shelves.push([
          new Phaser.Geom.Rectangle(
            this.config.wall, y - this.config.book,
            shelfWidth(this.config), this.config.book,
          ),
          JSON.stringify([col, row, i, 'left']),
        ]);
        shelves.push([
          new Phaser.Geom.Rectangle(
            this.config.wall + this.config.width - shelfWidth(this.config), y - this.config.book,
            shelfWidth(this.config), this.config.book,
          ),
          JSON.stringify([col, row, i, 'right']),
        ]);
      } else {
        shelves.push([
          new Phaser.Geom.Rectangle(
            this.config.wall, y - this.config.book,
            this.config.width, this.config.book,
          ),
          JSON.stringify([col, row, i]),
        ]);
      }
    }
    return shelves;
  }

  drawRoom(col: number, row: number, graphics: Phaser.GameObjects.Graphics) {
    const { trap, door } = this.query(col, row);

    graphics.fillStyle(wallColor);
    if (!trap) {
      graphics.fillRect(
        ceilPartWidth(this.config), 0,
        this.config.trap, this.config.wall,
      );
    }
    if (!door) {
      graphics.fillRect(
        0, wallPartHeight(this.config),
        this.config.wall, worldDoor(this.config),
      );
    }
    graphics.fillRect(
      this.config.wall, this.config.wall,
      this.config.width, worldHeight(this.config),
    );

    const trapBelow = this.query(col, row+1).trap;

    for (let i = 1; i < this.config.height; i++) {
      const y = this.config.wall + i*(this.config.book + this.config.shelf) - this.config.shelf;
      graphics.fillStyle(shelfColor);
      graphics.fillRect(
        this.config.wall, y,
        shelfWidth(this.config), this.config.shelf,
      );
      graphics.fillRect(
        this.config.wall + this.config.width - shelfWidth(this.config), y,
        shelfWidth(this.config), this.config.shelf,
      );
      if (!trap || (!trapBelow && i >= this.config.height - 1)) {
        graphics.fillStyle(ladderColor);
      } else {
        graphics.fillStyle(shelfColor);
      }
      graphics.fillRect(
        ceilPartWidth(this.config), y,
        this.config.trap, this.config.shelf,
      );
    }

    this.roomShelves(col, row).forEach(([rect, seed]) => {
      drawBooks(rect, graphics, seedrandom(seed));
    });

    graphics.fillStyle(ladderColor);
    if (!trap) {
      graphics.fillRect(
        this.config.wall + this.config.width/2 - this.config.trap/2,
        this.config.wall/2 - this.config.shelf/2,
        this.config.trap,
        this.config.shelf,
      );
    }

    if (!(trap && trapBelow)) {
      let fullHeight: number;
      if (!trap) {
        fullHeight = fullSize(this.config)[1];
      } else {
        fullHeight = 1.5*this.config.book + this.config.shelf;
      }
      graphics.fillRect(
        this.config.wall + this.config.width/2 - this.config.gap/2,
        this.config.wall + worldHeight(this.config) - fullHeight,
        this.config.shelf, fullHeight,
      );
      graphics.fillRect(
        this.config.wall + this.config.width/2 + this.config.gap/2 - this.config.shelf,
        this.config.wall + worldHeight(this.config) - fullHeight,
        this.config.shelf, fullHeight,
      );
    }
  }

  roomBooks(col: number, row: number): Phaser.Geom.Rectangle[] {
    return [].concat(...(this.roomShelves(col, row).map(([rect, seed]) => {
      return generateBooks(rect, seedrandom(seed)).map(book => book.rect);
    })));
  }

  chooseBook(pos: Matter.Vector): Phaser.Geom.Rectangle {
    const [col, row] = this.closestRoom(pos);
    const rect = random.choose(this.roomBooks(col, row));
    const { x: centerX, y: centerY } = this.roomCenter(col, row);
    const [cornerX, cornerY] = outerCorner(this.config)
    rect.x += centerX + cornerX;
    rect.y += centerY + cornerY;
    return rect;
  }

  update(
    worldView: Phaser.Geom.Rectangle,
    makeGraphics: () => Phaser.GameObjects.Graphics,
    destroyTexture: (key: string) => void,
  ) {
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
        room.forEach(body => Matter.Composite.remove(this.comp, body));
        this.rooms.delete(key);

        destroyTexture(JSON.stringify(key));
      }
    });

    for (let col = colMin; col <= colMax; col++) {
      for (let row = rowMin; row <= rowMax; row++) {
        if (this.query(col, row) && !(this.rooms.has([col, row]))) {
          const room = this.rects(col, row).map(rect => {
            const body =  Matter.Bodies.rectangle(
              rect.centerX, rect.centerY, rect.width, rect.height,
              { isStatic: true },
            );
            Matter.Composite.add(this.comp, body);
            return body;
          });
          this.rooms.set([col, row], room);

          const [w, h] = fullSize(this.config)
          const g = makeGraphics();
          this.drawRoom(col, row, g);
          g.generateTexture(JSON.stringify([col, row]), w, h);
          g.destroy();
        }
      }
    }
  }

  render(graphics: Phaser.GameObjects.Graphics) {
    this.rooms.keys().forEach(([col, row]) => {
      if (row <= 0) {
        const { x, y } = this.roomCenter(col, row);
        const [outerX, outerY] = outerCorner(this.config);
        const [width, height] = fullSize(this.config);
        graphics.fillStyle(0xffffff);
        graphics.setTexture(JSON.stringify([col, row]));
        graphics.fillRect(x + outerX, y + outerY, width, height);
        graphics.setTexture();
      }
    });
  }
}
