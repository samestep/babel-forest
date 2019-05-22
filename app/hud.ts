/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

export class HUD {
  text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const worldStr = localStorage.getItem('babel-forest');
    const worldNum = worldStr ? parseInt(worldStr, 10) + 1 : 0;
    localStorage.setItem('babel-forest', worldNum.toString());
    this.text = scene.add.text(0, 0, `Hello, world #${worldNum}!`, { fontFamily: 'sans' });
    this.text.setScrollFactor(0, 0);
  }
}
