/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as seedrandom from 'seedrandom';

import * as random from './random';
import { hexToRgb, rgbToHex } from './color';

interface Book {
  rect: Phaser.Geom.Rectangle,
  color: number;
}

const minWidth = 10;
const maxWidth = 15;
const minHeight = 0.7; // multiplied by the available height
const maxHeight = 0.9; // multiplied by the available height
const maxGroup = 5;

function generateBooks(
  rect: Phaser.Geom.Rectangle, rng: seedrandom.prng
): Book[] {
  const books = [];
  let pos = 0;
  while (true) {
    // TODO; skew groupSize toward 1
    const groupSize = Math.floor(rng()*maxGroup)+1;
    const width = minWidth+Math.floor(rng()*(maxWidth-minWidth+1));
    if (pos + groupSize*width > rect.width) {
      break;
    }
    const height = rect.height*(minHeight+rng()*(maxHeight-minHeight));
    const color = random.color(0x80, rng);
    for (let i = 0; i < groupSize; i++) {
      books.push({
        rect: new Phaser.Geom.Rectangle(
          rect.left + pos, rect.bottom - height,
          width, height,
        ),
        color,
      });
      pos += width;
    }
  }
  const shift = (rect.width - pos)/2;
  books.forEach(book => { book.rect.x += shift; });
  return books;
}

export function drawBooks(
  rect: Phaser.Geom.Rectangle,
  graphics: Phaser.GameObjects.Graphics,
  rng: seedrandom.prng,
) {
  generateBooks(rect, rng).forEach(book => {
    const [r, g, b] = hexToRgb(book.color);
    const dark = rgbToHex(Math.round(r*0.95), Math.round(g*0.95), Math.round(b*0.95));
    const light = rgbToHex(Math.round(r*1.05), Math.round(g*1.05), Math.round(b*1.05));
    graphics.fillStyle(dark);
    graphics.fillRect(book.rect.x, book.rect.y, book.rect.width/2, book.rect.height);
    graphics.fillStyle(light);
    graphics.fillRect(book.rect.x + book.rect.width/2, book.rect.y, book.rect.width/2, book.rect.height);
  })
}
