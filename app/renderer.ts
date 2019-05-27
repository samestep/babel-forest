/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import { HUD } from './hud';
import * as music from './music';
import { loadGame, saveGame } from './save';
import { MainScene } from './scene';

const game = new Phaser.Game({
  parent: 'parent',
  physics: { default: 'matter' },
  scale: { mode: Phaser.Scale.RESIZE },
});

game.registry.values.save = loadGame();
music.play(game.registry.values.save);

addEventListener('beforeunload', () => {
  saveGame(game.registry.values.save);
  game.destroy(true, true);
});

game.scene.add('main', MainScene, true);
game.scene.add('hud', HUD, true);
