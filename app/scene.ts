/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import { Octopus } from './octopus';
import { World } from './world';

export class MainScene extends Phaser.Scene {
  graphics: Phaser.GameObjects.Graphics;
  world: World;
  octopus: Octopus;
  wDown: boolean;
  aDown: boolean;
  sDown: boolean;
  dDown: boolean;
  jump: boolean;

  create() {
    this.wDown = false;
    this.aDown = false;
    this.sDown = false;
    this.dDown = false;
    this.jump = false;

    addEventListener('resize', () => {
      this.cameras.main.setSize(innerWidth, innerHeight);
    });

    this.graphics = this.add.graphics();

    this.world = new World({
      book: 50,
      door: 2,
      gap: 50,
      height: 5,
      shelf: 5,
      trap: 75,
      wall: 25,
      width: 270,
    });
    this.matter.world.add(this.world.comp);

    const [x, y] = this.registry.values.save.location;
    this.octopus = new Octopus({
      x, y,
      headRadius: 20,
      numArms: 8,
      segmentLength: 30,
      segmentRadius: 5,
      segmentsPerArm: 5,
    });
    this.matter.world.add(this.octopus.comp);

    const spacebar = this.input.keyboard.addKey('SPACE');
    spacebar.on('down', () => { this.jump = true; });

    const [w, a, s, d] = ['W', 'A', 'S', 'D'].map(k => {
      return this.input.keyboard.addKey(k);
    });
    w.on('down', () => { this.wDown = true; });
    a.on('down', () => { this.aDown = true; });
    s.on('down', () => { this.sDown = true; });
    d.on('down', () => { this.dDown = true; });
    w.on('up', () => { this.wDown = false; });
    a.on('up', () => { this.aDown = false; });
    s.on('up', () => { this.sDown = false; });
    d.on('up', () => { this.dDown = false; });
  }

  update(time: number, delta: number) {
    const { progress } = this.registry.values.save;
    if (progress === 'library') {
      const movingDir = {
        x: this.octopus.head.position.x,
        y: this.octopus.head.position.y,
      };
      // TODO: change these values because I think the vector length does matter
      if (this.wDown) { movingDir.y -= 100; }
      if (this.aDown) { movingDir.x -= 100; }
      if (this.sDown) { movingDir.y += 100; }
      if (this.dDown) { movingDir.x += 100; }
      if (this.wDown || this.aDown || this.sDown || this.dDown) {
        this.octopus.goal = movingDir;
      } else {
        this.octopus.goal = null;
      }

      if (this.jump) {
        const pointer = this.input.activePointer;
        const pointerLocation = { x: pointer.worldX, y: pointer.worldY };
        this.octopus.jump(pointerLocation);
        this.jump = false;
      }
    }

    // @ts-ignore: Argument of type 'MatterJS.World' is not assignable ...
    this.octopus.update(time, delta, this.matter.world.localWorld);
    this.cameras.main.centerOn(
      this.octopus.head.position.x,
      this.octopus.head.position.y,
    );
    this.world.update(
      this.cameras.main.worldView,
      () => this.add.graphics(),
      key => this.textures.remove(key),
    );

    const { x, y } = this.octopus.head.position;
    this.registry.values.save.location = [x, y];

    this.graphics.clear();
    if (progress === 'library') {
      this.world.render(this.graphics);
    }
    this.octopus.render(this.graphics);
  }
}
