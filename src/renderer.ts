/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import * as _ from 'underscore';

import { Octopus } from './octopus';

const config = {
  backgroundColor: '#00ffff',
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
let octopus: Octopus;

function create() {
  graphics = scene.add.graphics();

  scene.matter.world.setBounds(50, 50, 700, 500);

  const rect = Matter.Bodies.rectangle(500, 300, 100, 50, { isStatic: true });
  scene.matter.world.add(rect);

  octopus = new Octopus({
    x: 300, y: 400,
    headRadius: 20,
    numArms: 8,
    segmentLength: 30,
    segmentRadius: 5,
    segmentsPerArm: 5,
  });
  scene.matter.world.add(octopus.comp);
}

function update(time: number, delta: number) {
  const pointer = scene.input.activePointer;
  if (pointer.leftButtonDown()) {
    octopus.goal = { x: pointer.worldX, y: pointer.worldY };
  } else {
    octopus.goal = null;
  }
  // @ts-ignore: Argument of type 'MatterJS.World' is not assignable ...
  octopus.update(time, delta, scene.matter.world.localWorld);

  graphics.clear();
  octopus.render(graphics);
}
