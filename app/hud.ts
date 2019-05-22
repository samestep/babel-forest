/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

export class HUD {
  text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(0, 0, 'Hello, world!', { fontFamily: 'sans' });
    this.text.setScrollFactor(0, 0);
  }
}
