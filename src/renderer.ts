/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import { Octopus, maybeReachable } from './octopus';
import { raycast } from './raycast';

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
  graphics = scene.add.graphics({
    lineStyle: { color: 0x000000 },
    fillStyle: { color: 0xff0000 },
  });

  scene.matter.add.mouseSpring({ });
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

  const constraint = Matter.Constraint.create({
    bodyA: octopus.arms[0].segments[4],
    bodyB: rect,
    pointA: { x: 30 / 2.0 - 5, y: 0 },
    pointB: { x: -100, y: 0 },
    stiffness: 0.001,
    length: 0,
  });
  scene.matter.world.add(constraint);
}

function render() {
  graphics.clear();

  const pointer = scene.input.activePointer;

  const x1 = octopus.head.position.x;
  const y1 = octopus.head.position.y;
  const x2 = pointer.worldX;
  const y2 = pointer.worldY;

  graphics.strokeLineShape(new Phaser.Geom.Line(x1, y1, x2, y2));

  const start = { x: x1, y: y1 };
  const end = { x: x2, y: y2 };

  // @ts-ignore: Argument of type 'World' is not assignable ...
  const bodies = Matter.Composite.allBodies(scene.matter.world.localWorld);
  const reachable = maybeReachable(bodies, octopus);
  const ray = Matter.Query.ray(reachable, start, end);
  const cast = raycast(ray.map(obj => obj.body), start, end);
  const points = cast.map(raycol => raycol.point);
  points.map(({ x, y }) => { graphics.fillPoint(x, y, 10); });
}
