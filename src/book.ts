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
  // TODO: multiple books
  return [{ rect, color: random.color(0x80, rng) }];
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
