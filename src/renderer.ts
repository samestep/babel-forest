/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import { Octopus } from './octopus';

const config = {
  backgroundColor: '#00ffff',
  physics: {
    default: 'matter',
    matter: {
      debug: true
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: render,
  },
  scale: {
    parent: 'parent',
    mode: Phaser.Scale.RESIZE
  }
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
  graphics = scene.add.graphics({ lineStyle: { color: 0x000000 } });

  scene.matter.add.mouseSpring({ });
  scene.matter.world.setBounds(50, 50, 700, 500);

  scene.matter.add.rectangle(500, 300, 100, 50, { isStatic: true });

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

function render() {
  graphics.clear();

  const pointer = scene.input.activePointer;

  graphics.strokeLineShape(new Phaser.Geom.Line(
    octopus.head.position.x, octopus.head.position.y,
    pointer.worldX, pointer.worldY,
  ));
}
