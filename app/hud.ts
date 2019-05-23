/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

const delay = 100;

export class HUD extends Phaser.Scene {
  cooldown: number;
  text: Phaser.GameObjects.Text;
  letters: string[];
  running: string;

  create() {
    addEventListener('resize', () => {
      this.cameras.main.setSize(innerWidth, innerHeight);
    });

    this.running = '';
    this.text = this.add.text(0, 0, this.running, {
      fontFamily: 'sans',
      fontSize: '100px',
    });
    this.cooldown = delay;
    this.letters = 'Hello, world!'.split('');
  }

  update(time: number, delta: number) {
    this.cooldown -= delta;
    if (this.cooldown <= 0) {
      this.cooldown = delay;
      if (this.letters.length > 0) {
        this.running += this.letters[0];
        this.letters.shift();
        this.text.setText(this.running);
      }
    }
  }
}
