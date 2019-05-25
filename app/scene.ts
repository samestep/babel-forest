/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import { drawArrow } from './arrow';
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
  waiting: boolean;
  book: Phaser.Geom.Rectangle;
  oscillate: number;

  create() {
    this.wDown = false;
    this.aDown = false;
    this.sDown = false;
    this.dDown = false;
    this.jump = false;
    this.waiting = false;

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

    const { progress } = this.registry.values.save;
    if (progress === 'sleeping') {
      const listener = (
        e: Phaser.Physics.Matter.Events.CollisionStartEvent,
        a: Matter.Body, b: Matter.Body,
      ) => {
        const octobodies = Matter.Composite.allBodies(this.octopus.comp);
        const hasHead = [a, b].some(body => body === this.octopus.head);
        const hasWall = !([a, b].every(body => octobodies.includes(body)));
        if (hasHead && hasWall) {
          this.tweens.add({
            targets: this.octopus,
            brightness: 1,
            delay: 500,
            duration: 1000,
            onComplete: () => { this.events.emit('main-introduction'); },
          });
          this.matter.world.off('collisionstart', listener);
        }
      };
      this.matter.world.on('collisionstart', listener);
    } else {
      this.octopus.brightness = 1;
      this.world.darkness = 0;
      if (progress === 'library') {
        this.time.addEvent({ delay: 250, callback: () => {
          this.events.emit('main-library');
        } });
      } else if (progress === 'move') {
        this.time.addEvent({ delay: 250, callback: () => {
          this.events.emit('main-move');
        } });
      } else if (progress === 'book1') {
        this.time.addEvent({ delay: 250, callback: () => {
          this.events.emit('main-book1');
        } });
      } else if (progress === 'book2') {
        this.time.addEvent({ delay: 250, callback: () => {
          this.events.emit('main-book2');
        } });
      }
    }

    this.scene.get('hud').events.on('hud-library', () => {
      this.tweens.add({
        targets: this.world,
        darkness: 0,
        duration: 1000,
        onComplete: () => { this.events.emit('main-library'); },
      });
    });

    this.scene.get('hud').events.on('hud-move', () => {
      this.time.addEvent({ delay: 250, callback: () => {
        this.events.emit('main-move');
      } });
    });

    const waitingF = () => { this.waiting = true; };
    this.scene.get('hud').events.on('hud-waiting', waitingF);
    if (progress === 'waiting') {
      waitingF();
    }

    const getting1F = () => {
      this.book = this.world.chooseBook(this.octopus.head.position, 0);
    }
    this.scene.get('hud').events.on('hud-getting1', getting1F);
    if (progress === 'getting1') {
      getting1F();
    }

    const getting2F = () => {
      this.book = this.world.chooseBook(this.octopus.head.position, 3);
    }
    this.scene.get('hud').events.on('hud-getting2', getting2F);
    if (progress === 'getting2') {
      getting2F();
    }

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

  closeEnough(): boolean {
    if (this.book) {
      const bookVec = { x: this.book.centerX, y: this.book.centerY };
      const diff = Matter.Vector.sub(this.octopus.head.position, bookVec);
      return Matter.Vector.magnitude(diff) < 40;
    } else {
      return false;
    }
  }

  update(time: number, delta: number) {
    const { progress } = this.registry.values.save;
    if (progress !== 'sleeping') {
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
        if (this.waiting && this.octopus.isGrounded()) {
          this.waiting = false;
          this.registry.values.save.progress = 'book1';
          this.events.emit('main-book1');
        }
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

    if (this.closeEnough()) {
      this.book = null;
      if (progress === 'getting1') {
        this.registry.values.save.progress = 'found1';
        this.events.emit('main-found1');
      }
      if (progress === 'getting2') {
        this.registry.values.save.progress = 'close';
        this.events.emit('main-close');
      }
    }

    if (this.oscillate) {
      this.oscillate += delta/1000;
      if (this.oscillate > 2) {
        this.oscillate -= 2;
      }
    } else {
      this.oscillate = 1;
    }

    const { x, y } = this.octopus.head.position;
    this.registry.values.save.location = [x, y];

    this.graphics.clear();
    if (progress !== 'sleeping') {
      this.world.render(this.graphics);
    }
    const { left, top, width, height } = this.cameras.main.worldView;
    this.graphics.fillStyle(0x000000, this.world.darkness);
    this.graphics.fillRect(left, top, width, height);
    if (this.book) {
      this.graphics.fillStyle(0xffffff, Math.abs(1 - this.oscillate));
      this.graphics.fillRectShape(this.book);
    }
    this.octopus.render(this.graphics, progress);
    if (this.book) {
      const bookVec = { x: this.book.centerX, y: this.book.centerY };
      const diff = Matter.Vector.sub(this.octopus.head.position, bookVec);
      drawArrow(this.graphics, this.octopus.head.position, diff);
    }
  }
}
