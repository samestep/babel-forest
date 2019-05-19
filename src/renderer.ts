/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as _ from 'underscore';

import { Octopus } from './octopus';
import { World } from './world';

const config = {
  backgroundColor: '#303030',
  physics: {
    default: 'matter',
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  scale: {
    parent: 'parent',
    mode: Phaser.Scale.RESIZE,
  },
};

const game = new Phaser.Game(config);

window.addEventListener('beforeunload', () => game.destroy(true, true));

let scene: Phaser.Scene;

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  scene.cameras.main.setSize(width, height);
});

function preload() {
  scene = this;
}

let graphics: Phaser.GameObjects.Graphics;
let world: World;
let octopus: Octopus;
let spacebar: Phaser.Input.Keyboard.Key;
let jump: boolean;

function create() {
  graphics = scene.add.graphics();

  world = new World();
  scene.matter.world.add(world.comp);

  octopus = new Octopus({
    x: 0, y: 0,
    headRadius: 20,
    numArms: 8,
    segmentLength: 30,
    segmentRadius: 5,
    segmentsPerArm: 5,
  });
  scene.matter.world.add(octopus.comp);

  spacebar = scene.input.keyboard.addKey('SPACE');
  spacebar.on('down', () => { jump = true; });
}

function update(time: number, delta: number) {
  const pointer = scene.input.activePointer;
  const pointerLocation = { x: pointer.worldX, y: pointer.worldY };
  if (pointer.leftButtonDown()) {
    octopus.goal = pointerLocation;
  } else {
    octopus.goal = null;
  }

  if (jump) {
    octopus.jump(pointerLocation);
    jump = false;
  }

  world.update(scene.cameras.main.worldView);
  // @ts-ignore: Argument of type 'MatterJS.World' is not assignable ...
  octopus.update(time, delta, scene.matter.world.localWorld);

  scene.cameras.main.centerOn(octopus.head.position.x, octopus.head.position.y);

  graphics.clear();
  world.render(graphics);
  octopus.render(graphics);
}
