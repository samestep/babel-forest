/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import * as _ from 'underscore';

import { Octopus } from './octopus';

const config = {
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

const bounds = { x: 50, y: 50, width: 700, height: 500};
const block = { x: 500, y: 300, width: 100, height: 50};

let graphics: Phaser.GameObjects.Graphics;
let octopus: Octopus;

function create() {
  graphics = scene.add.graphics();

  scene.matter.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

  const rect = Matter.Bodies.rectangle(
    block.x, block.y, block.width, block.height, { isStatic: true }
  );
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
  graphics.fillStyle(0x202020);
  graphics.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  graphics.fillStyle(0x000000);
  graphics.fillRect(block.x, block.y, block.width, block.height);
  octopus.render(graphics);
}
