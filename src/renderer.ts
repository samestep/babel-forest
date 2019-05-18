/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import * as _ from 'underscore';

import { Octopus } from './octopus';
import * as random from './random';
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
    update: update,
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

let clicked = true;

let angle: number;

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

  scene.input.on('pointerdown', () => { clicked = true; });
}

function update() {
  octopus.update();

  graphics.clear();

  const pointer = scene.input.activePointer;

  const x1 = octopus.head.position.x;
  const y1 = octopus.head.position.y;
  const x2 = pointer.worldX;
  const y2 = pointer.worldY;

  const start = { x: x1, y: y1 };
  const end = { x: x2, y: y2 };

  if (clicked) {
    angle = random.weighted(-Math.PI/2, Math.PI/2);
    angle = 0;
  }

  const v1 = Matter.Vector.sub(end, start);
  const v2 = Matter.Vector.rotate(v1, angle);
  const end2 = Matter.Vector.add(start, v2);

  graphics.strokeLineShape(new Phaser.Geom.Line(start.x, start.y, end2.x, end2.y));

  // @ts-ignore: Argument of type 'World' is not assignable ...
  const bodies = Matter.Composite.allBodies(scene.matter.world.localWorld);
  const reachable = octopus.maybeReachable(bodies);
  const ray = Matter.Query.ray(reachable, start, end2);
  const cast = raycast(ray.map(obj => obj.body), start, end2);
  const point = cast.map(raycol => raycol.point)[0];
  if (point) {
    const dist = Matter.Vector.magnitude(Matter.Vector.sub(point, start));
    if (dist < octopus.reach) {
      graphics.fillPoint(point.x, point.y, 10);
      if (clicked) {
        let bestArm = octopus.arms[0];
        octopus.arms.forEach(arm => {
          const bestDist = Matter.Vector.magnitude(Matter.Vector.sub(bestArm.tipPosition(), point));
          const newDist = Matter.Vector.magnitude(Matter.Vector.sub(arm.tipPosition(), point));
          if (newDist > bestDist) {
            bestArm = arm;
          }
        });
        bestArm.move(point);
      }
    }
  }

  if (clicked) {
    clicked = false;
  }
}
