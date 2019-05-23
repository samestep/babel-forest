/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import { HUD } from './hud';
import { loadGame, saveGame } from './save';
import { MainScene } from './scene';

const game = new Phaser.Game({
  parent: 'parent',
  physics: { default: 'matter' },
  scale: { mode: Phaser.Scale.RESIZE },
});

const state = loadGame();

addEventListener('beforeunload', () => {
  const scene = game.scene.getScene('main');
  if (scene instanceof MainScene) { // should be always true
    const { x, y } = scene.octopus.head.position;
    state.location = [x, y];
  }
  saveGame(state);
  game.destroy(true, true);
});

game.scene.add('main', MainScene, true, state.location);
game.scene.add('hud', HUD, true);
