/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as seedrandom from 'seedrandom';

import * as random from './random';

interface Book {
  rect: Phaser.Geom.Rectangle,
  color: number;
}

const minWidth = 5;
const maxWidth = 10;
const minHeight = 0.7; // multiplied by the available height
const maxHeight = 0.9; // multiplied by the available height
const maxGroup = 5;

function generateBooks(
  rect: Phaser.Geom.Rectangle, rng: seedrandom.prng
): Book[] {
  const books = [];
  let pos = 0;
  while (true) {
    const groupSize = Math.floor(rng()*maxGroup)+1;
    const width = minWidth+Math.floor(rng()*(maxWidth-minWidth+1));
    if (pos + groupSize*width > rect.width) {
      break;
    }
    const height = rect.height*(minHeight+rng()*(maxHeight-minHeight));
    books.push({
      rect: new Phaser.Geom.Rectangle(
        rect.left + pos, rect.bottom - height,
        width*groupSize, height,
      ),
      color: random.color(0x80, rng),
    });
    pos += groupSize*width;
  }
  return books;
}

export function drawBooks(
  rect: Phaser.Geom.Rectangle,
  graphics: Phaser.GameObjects.Graphics,
  rng: seedrandom.prng,
) {
  generateBooks(rect, rng).forEach(book => {
    graphics.fillStyle(book.color);
    graphics.fillRectShape(book.rect);
  })
}
