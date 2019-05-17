/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

const config = {
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#ffffff',
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
  }
};

const game = new Phaser.Game(config);

window.addEventListener('beforeunload', () => game.destroy(true, true));

let scene: Phaser.Scene;

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  game.resize(width, height);
  scene.cameras.main.setSize(width, height);
});

function preload() {
  scene = this;
}

let cursors: Phaser.Input.Keyboard.CursorKeys;
let body: Matter.Body;
let car: Matter.Composite;
let axelA: Matter.Constraint;
let axelB: Matter.Constraint;

function create() {
  cursors = scene.input.keyboard.createCursorKeys();

  scene.matter.add.mouseSpring({ });
  scene.matter.world.setBounds(50, 50, 700, 500);

  scene.matter.add.rectangle(500, 300, 100, 50, { isStatic: true });

  const group = Matter.Body.nextGroup(true);
  body = Matter.Bodies.rectangle(200, 100, 100, 50, {
    collisionFilter: {
      group: group
    },
    density: 0.0002
  });
  const wheelA = Matter.Bodies.circle(150, 125, 25, {
    collisionFilter: {
      group: group
    },
    friction: 0.8
  });
  const wheelB = Matter.Bodies.circle(250, 125, 25, {
    collisionFilter: {
      group: group
    },
    friction: 0.8
  });
  axelA = Matter.Constraint.create({
    bodyB: body,
    pointB: { x: -50, y: 25 },
    bodyA: wheelA,
    stiffness: 1,
    length: 0
  });
  axelB = Matter.Constraint.create({
    bodyB: body,
    pointB: { x: 50, y: 25 },
    bodyA: wheelB,
    stiffness: 1,
    length: 0
  });
  scene.matter.world.add(body);
  scene.matter.world.add(wheelA);
  scene.matter.world.add(wheelB);
  scene.matter.world.add(axelA);
  scene.matter.world.add(axelB);
}

function update() {
  const angle = body.angle;
  if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
    const dist = Math.sqrt(50*50+10*10);
    const angle2 = Math.atan2(10, -50);
    const angle3 = Math.atan2(10, 50);
    axelA.pointB = {
      x: dist*Math.cos(angle + angle2),
      y: dist*Math.sin(angle + angle2)
    };
    axelB.pointB = {
      x: dist*Math.cos(angle + angle3),
      y: dist*Math.sin(angle + angle3)
    };
  }
  if (Phaser.Input.Keyboard.JustUp(cursors.down)) {
    const dist = Math.sqrt(50*50+25*25);
    const angle2 = Math.atan2(25, -50);
    const angle3 = Math.atan2(25, 50);
    axelA.pointB = {
      x: dist*Math.cos(angle + angle2),
      y: dist*Math.sin(angle + angle2)
    };
    axelB.pointB = {
      x: dist*Math.cos(angle + angle3),
      y: dist*Math.sin(angle + angle3)
    };
  }
}
