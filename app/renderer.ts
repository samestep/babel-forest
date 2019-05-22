/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import { HUD } from './hud';
import { MainScene } from './scene';

const game = new Phaser.Game({
  parent: 'parent',
  physics: { default: 'matter' },
  scale: { mode: Phaser.Scale.RESIZE },
});
addEventListener('beforeunload', () => game.destroy(true, true));
game.scene.add('main', MainScene, true);
game.scene.add('hud', HUD, true);
