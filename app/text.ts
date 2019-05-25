/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

export class Text {
  inner: Phaser.GameObjects.Text;
  line: string;
  progCounter: number;

  constructor(pText: Phaser.GameObjects.Text) {
    this.inner = pText;
    this.line = '';
    this.progCounter = 0;
  }

  reveal(delay: number, color: string, line: string, onComplete: () => void): object {
    this.inner.setColor(color);
    this.line = line;
    this.progress = 0;
    return {
      targets: this,
      progress: line.length,
      duration: delay*line.length,
      onComplete,
    }
  }

  get progress() {
    return this.progCounter;
  }

  set progress(value: number) {
    this.progCounter = value;
    this.inner.setText(this.line.substring(0, Math.round(value)));
  }

  update(worldView: Phaser.Geom.Rectangle) {
    this.inner.setWordWrapWidth(worldView.width);
  }
}
