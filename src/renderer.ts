/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as _ from 'underscore';

import { Octopus } from './octopus';
import { World } from './world';

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

let graphics: Phaser.GameObjects.Graphics;
let world: World;
let octopus: Octopus;
let wDown = false;
let aDown = false;
let sDown = false;
let dDown = false;
let jump = false;

function create() {
  graphics = scene.add.graphics();

  world = new World({
    book: 50,
    door: 2,
    gap: 50,
    height: 5,
    shelf: 5,
    trap: 75,
    wall: 25,
    width: 270,
  });
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

  const spacebar = scene.input.keyboard.addKey('SPACE');
  spacebar.on('down', () => { jump = true; });

  const [w, a, s, d] = ['W', 'A', 'S', 'D'].map(k => {
    return scene.input.keyboard.addKey(k);
  });
  w.on('down', () => { wDown = true; });
  a.on('down', () => { aDown = true; });
  s.on('down', () => { sDown = true; });
  d.on('down', () => { dDown = true; });
  w.on('up', () => { wDown = false; });
  a.on('up', () => { aDown = false; });
  s.on('up', () => { sDown = false; });
  d.on('up', () => { dDown = false; });
}

function update(time: number, delta: number) {
  const movingDir = { x: octopus.head.position.x, y: octopus.head.position.y };
  // TODO: change these values because I think the vector length does matter
  if (wDown) { movingDir.y -= 100; }
  if (aDown) { movingDir.x -= 100; }
  if (sDown) { movingDir.y += 100; }
  if (dDown) { movingDir.x += 100; }
  if (wDown || aDown || sDown || dDown) {
    octopus.goal = movingDir;
  } else {
    octopus.goal = null;
  }

  if (jump) {
    const pointer = scene.input.activePointer;
    const pointerLocation = { x: pointer.worldX, y: pointer.worldY };
    octopus.jump(pointerLocation);
    jump = false;
  }

  world.update(
    scene.cameras.main.worldView,
    () => scene.add.graphics(),
    key => scene.textures.remove(key),
  );
  // @ts-ignore: Argument of type 'MatterJS.World' is not assignable ...
  octopus.update(time, delta, scene.matter.world.localWorld);

  scene.cameras.main.centerOn(octopus.head.position.x, octopus.head.position.y);

  graphics.clear();
  world.render(graphics);
  octopus.render(graphics);
}
