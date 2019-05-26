/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as _ from 'underscore';

const testLine = 'F';

function maxLines(text: Phaser.GameObjects.Text, height: number): number {
  text.setText(testLine);
  let n = 1;
  while (text.displayHeight <= height) {
    text.setText(`${text.text}\n${testLine}`);
    n++;
  }
  return n - 1;
}

export class Page {
  worldView: Phaser.Geom.Rectangle;
  left: Phaser.GameObjects.Text;
  right: Phaser.GameObjects.Text;
  paragraphs: string[];
  pages: string[];
  pageNum: number;
  opacity: number;

  constructor(left: Phaser.GameObjects.Text, right: Phaser.GameObjects.Text) {
    [left, right].forEach(text => {
      text.setColor('black');
      text.setFontFamily('serif');
      text.setFontSize(25);
    })
    this.left = left;
    this.right = right;
    this.pages = [];
    this.pageNum = 0;
    this.opacity = 0;
  }

  refillText(paragraphs: string[]) {
    this.paragraphs = paragraphs;

    this.left.setX(100);
    this.left.setY(100);
    this.right.setX(this.worldView.centerX + 50);
    this.right.setY(100);

    this.left.setWordWrapWidth((this.worldView.width - 300)/2);
    const linesPerPage = maxLines(this.left, this.worldView.height - 200);
    const lines = this.left.runWordWrap(paragraphs.join('\n\n')).split('\n');
    this.left.setWordWrapWidth(null); // otherwise it would wrap "twice", weird

    this.pages = _.chunk(lines, linesPerPage).map(page => {
      return _.toArray(page).join('\n');
    });

    if (this.pages.length > this.pageNum) {
      this.left.setText(this.pages[this.pageNum]);
      if (this.pages.length > this.pageNum + 1) {
        this.right.setText(this.pages[this.pageNum + 1]);
      }
    }
  }

  update(
    worldView: Phaser.Geom.Rectangle,
    makeGraphics: () => Phaser.GameObjects.Graphics,
    destroyTexture: (key: string) => void,
  ) {
    this.left.setAlpha(this.opacity);
    this.right.setAlpha(this.opacity);
    if (!(this.worldView)
        || worldView.width !== this.worldView.width
        || worldView.height !== this.worldView.height
    ) {
      this.worldView = new Phaser.Geom.Rectangle(
        worldView.x, worldView.y,
        worldView.width, worldView.height,
      );

      if (this.paragraphs) {
        this.refillText(this.paragraphs);
      }

      destroyTexture('book');
      const g = makeGraphics();
      g.fillStyle(0x4f2c0f);
      g.fillRect(40, 40, this.worldView.width - 80, this.worldView.height - 80);
      g.fillStyle(0xffffff);
      g.fillRect(50, 50, this.worldView.width - 100, this.worldView.height - 100);
      g.fillStyle(0x888888);
      g.fillRect(this.worldView.centerX - 2, 50, 4, this.worldView.height - 100);
      g.generateTexture('book');
      g.destroy();
    }
  }

  render(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0xffffff, this.opacity);
    graphics.setTexture('book');
    graphics.fillRect(0, 0, this.worldView.width, this.worldView.height);
    graphics.setTexture();
  }
}
