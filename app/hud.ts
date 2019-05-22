/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

export class HUD extends Phaser.Scene {
  create() {
    addEventListener('resize', () => {
      this.cameras.main.setSize(innerWidth, innerHeight);
    });

    const worldStr = localStorage.getItem('babel-forest');
    const worldNum = worldStr ? parseInt(worldStr, 10) + 1 : 0;
    localStorage.setItem('babel-forest', worldNum.toString());
    this.add.text(0, 0, `Hello, world #${worldNum}!`, { fontFamily: 'sans' });
  }
}
