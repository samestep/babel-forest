/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

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
    update: update
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

function makeOctopus(config) {
  const {
    x,
    y,
    headSize,
    numArms,
    segmentLength,
    segmentWidth,
    segmentsPerArm,
  } = config;

  const group = Matter.Body.nextGroup(true);
  const options = {
    collisionFilter: {
      group,
      mask: ~0,
      category: 1,
    },
  };
  const head = Matter.Bodies.circle(x, y, headSize, options);
  scene.matter.world.add(head);

  // TODO: make the rest of the octopus
}

function create() {
  scene.matter.add.mouseSpring({ });
  scene.matter.world.setBounds(50, 50, 700, 500);

  scene.matter.add.rectangle(500, 300, 100, 50, { isStatic: true });

  makeOctopus({
    x: 300, y: 400,
    headSize: 20,
    numArms: 8,
    segmentLength: 10,
    segmentWidth: 5,
    segmentsPerArm: 5,
  });
}

function update() { }
