/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import * as _ from 'underscore';

import * as random from './random';
import { raycast } from './raycast';

function adjacents<T>(array: T[]): [T, T][] {
  return _.times(array.length - 1, i => [array[i], array[i + 1]]);
}

function bodyToWorld(body: Matter.Body, point: Matter.Vector): Matter.Vector {
  return Matter.Vector.add(
    body.position,
    Matter.Vector.rotate(point, body.angle)
  );
}

class Arm {
  segmentLength: number;
  segmentRadius: number;
  comp: Matter.Composite;
  segments: Matter.Body[];
  hook: Matter.Body;
  spring: Matter.Constraint;
  stopped: boolean;

  constructor(config) {
    this.comp = Matter.Composite.create();

    const {
      x, y,
      numSegments,
      segmentLength,
      segmentRadius,
      collisionFilter,
    } = config;

    this.segmentLength = segmentLength;
    this.segmentRadius = segmentRadius;

    this.segments = _.times(numSegments, () => Matter.Bodies.rectangle(
      x, y, segmentLength, segmentRadius*2,
      { chamfer: { radius: segmentRadius }, collisionFilter, }
    ));

    const constraints = adjacents(this.segments).map(([s1, s2], i) => {
      const direction = i % 2 === 0 ? 1 : -1;
      const offset = direction * (segmentLength / 2.0 - segmentRadius);
      return Matter.Constraint.create({
        bodyA: s1,
        pointA: { x: offset, y: 0 },
        bodyB: s2,
        pointB: { x: offset, y: 0 },
        stiffness: 1,
        length: 0,
      });
    });

    // @ts-ignore: Argument of type 'Body[]' is not assignable ...
    Matter.Composite.add(this.comp, this.segments);
    // @ts-ignore: Argument of type 'Constraint[]' is not assignable ...
    Matter.Composite.add(this.comp, constraints);

    this.hook = Matter.Bodies.rectangle(x, y, 1, 1, {
      isStatic: true,
      collisionFilter: { ...collisionFilter, mask: 0 }
    });

    const i = numSegments - 1;
    const direction = i % 2 === 0 ? 1 : -1;
    const offset = direction * (segmentLength / 2.0 - segmentRadius);
    this.spring = Matter.Constraint.create({
      bodyA: this.segments[numSegments - 1],
      bodyB: this.hook,
      pointA: { x: offset, y: 0 },
      stiffness: 0.01,
      length: 0,
    });

    Matter.Composite.add(this.comp, this.hook);
    Matter.Composite.add(this.comp, this.spring);

    this.stopped = true;
  }

  segmentTip(index: number): Matter.Vector {
    const direction = index % 2 === 0 ? 1 : -1;
    const offset = direction * (this.segmentLength / 2.0 - this.segmentRadius);
    return bodyToWorld(this.segments[index], { x: offset, y: 0 });
  }

  tipPosition(): Matter.Vector {
    return this.segmentTip(this.segments.length - 1);
  }

  stop() {
    this.stopped = true;
  }

  move(point: Matter.Vector) {
    this.hook.position = point;
    this.stopped = false;
  }

  update(center: Matter.Vector, reach: number) {
    const v = Matter.Vector.sub(this.hook.position, center);
    const dist = Matter.Vector.magnitude(v);
    if (dist > reach) {
      this.stop();
    }
    if (this.stopped) {
      this.hook.position = this.tipPosition();
    }
  }

  render(graphics: Phaser.GameObjects.Graphics, center: Matter.Vector) {
    const vectors = this.segments.map((s, i) => this.segmentTip(i));
    const points = [center, ...vectors].map(({ x, y }) => {
      return new Phaser.Math.Vector2(x, y);
    });
    const spline = new Phaser.Curves.Spline(points);

    graphics.lineStyle(this.segmentRadius * 2, 0xffa500);
    spline.draw(graphics);

    vectors.forEach(({ x, y }) => {
      graphics.fillCircle(x, y, this.segmentRadius);
    })
  }
}

// in ms
const jumpLength = 1000;

export class Octopus {
  headRadius: number;
  reach: number;
  comp: Matter.Composite;
  head: Matter.Body;
  arms: Arm[];
  hook: Matter.Body;
  spring: Matter.Constraint;
  goal: Matter.Vector;
  cooldown: number;
  jumpCooldown: number;
  jumpDirection: Matter.Vector;
  armOrder: number[];

  constructor(config) {
    this.comp = Matter.Composite.create();

    const {
      x, y,
      headRadius,
      numArms,
      segmentLength,
      segmentRadius,
      segmentsPerArm,
    } = config;

    this.headRadius = headRadius;
    this.reach = (segmentLength - 2 * segmentRadius) * segmentsPerArm;

    const group = Matter.Body.nextGroup(true);
    const collisionFilter = {
      group,
      mask: ~0,
      category: 1,
    };

    this.head = Matter.Bodies.circle(x, y, headRadius, { collisionFilter });

    this.arms = _.times(numArms, () => new Arm({
      x, y: y - 30,
      numSegments: segmentsPerArm,
      segmentLength,
      segmentRadius,
      collisionFilter,
    }));

    const constraints = this.arms.map(arm => {
      const offset = -1 * (segmentLength / 2.0 - segmentRadius);
      return Matter.Constraint.create({
        bodyA: this.head,
        bodyB: arm.segments[0],
        pointB: { x: offset, y: 0 },
        stiffness: 1,
        length: 0,
      });
    });

    Matter.Composite.add(this.comp, this.head);
    // @ts-ignore: Argument of type 'Composite[]' is not assignable ...
    Matter.Composite.add(this.comp, this.arms.map(arm => arm.comp));
    // @ts-ignore: Argument of type 'Constraint[]' is not assignable ...
    Matter.Composite.add(this.comp, constraints);

    this.hook = Matter.Bodies.rectangle(x, y, 1, 1, {
      isStatic: true,
      collisionFilter: { ...collisionFilter, mask: 0 }
    });

    this.spring = Matter.Constraint.create({
      bodyA: this.head,
      bodyB: this.hook,
      stiffness: 0.01,
      length: 0,
    });

    Matter.Composite.add(this.comp, this.hook);
    Matter.Composite.add(this.comp, this.spring);

    this.goal = null;
    this.cooldown = 0;
    this.jumpCooldown = 0;
    this.jumpDirection = { x: 0, y: 0 };
    this.replenishArmOrder();
  }

  replenishArmOrder() {
    this.armOrder = this.arms.map((arm, i) => i);
  }

  maybeReachable(bodies: Matter.Body[]): Matter.Body[] {
    const octobodies = new Set(Matter.Composite.allBodies(this.comp));
    // haha see what I did there?

    const relevantBodies = bodies.filter(b => !octobodies.has(b));

    const center = this.head.position;
    const reachBody = Matter.Bodies.circle(center.x, center.y, this.reach);

    return Matter.Query.region(relevantBodies, reachBody.bounds);
  }

  isGrounded(): boolean {
    return this.arms.some(arm => !(arm.stopped));
  }

  jump(toward: Matter.Vector) {
    if (this.isGrounded() && this.jumpCooldown <= 0) {
      this.jumpCooldown = jumpLength;
      this.arms.forEach(arm => arm.stop());

      const rawDiff = Matter.Vector.sub(toward, this.head.position);
      const normalized = Matter.Vector.normalise(rawDiff);
      this.jumpDirection = Matter.Vector.mult(normalized, 200);
    }
  }

  moveArm(reachable: Matter.Body[], toMove: Arm, tries: number) {
    const start = this.head.position;
    const angles = _.times(tries, () => random.weighted(-Math.PI/2, Math.PI/2));

    const points = angles.map(angle => {
      const v1 = Matter.Vector.sub(this.goal, start);
      const v2 = Matter.Vector.rotate(v1, angle);
      const end2 = Matter.Vector.add(start, v2);

      const ray = Matter.Query.ray(reachable, start, end2);
      const cast = raycast(ray.map(obj => obj.body), start, end2);
      return cast.map(raycol => raycol.point)[0];
    }).filter(point => {
      if (!point) {
        return false;
      }
      const dist = Matter.Vector.magnitude(Matter.Vector.sub(point, start));
      if (dist > this.reach) {
        return false;
      }
      return true;
    });
    if (points.length > 0) {
      const point = points.reduce((acc, cur) => {
        const d1 = Matter.Vector.magnitude(Matter.Vector.sub(acc, this.goal));
        const d2 = Matter.Vector.magnitude(Matter.Vector.sub(cur, this.goal));
        return d2 < d1 ? cur : acc;
      }, points[0]);
      toMove.move(point);
    }
  }

  update(time: number, delta: number, world: Matter.World) {
    this.cooldown = Math.max(0, this.cooldown - delta);
    this.jumpCooldown = Math.max(0, this.jumpCooldown - delta);

    if (this.isGrounded()) {
      const total = this.arms.reduce((acc, cur) => {
        return Matter.Vector.add(acc, cur.tipPosition());
      }, { x: 0, y: 0 });
      this.hook.position = Matter.Vector.div(total, this.arms.length);
    } else {
      this.hook.position = Matter.Vector.add(
        this.head.position,
        Matter.Vector.mult(
          this.jumpDirection,
          (1.0/jumpLength)*Math.max(0, this.jumpCooldown - jumpLength*0.5)
        ),
      );
    }

    const bodies = Matter.Composite.allBodies(world);
    const reachable = this.maybeReachable(bodies);
    if (this.goal) {
      this.arms.filter(arm => arm.stopped).forEach(arm => this.moveArm(reachable, arm, 1));
      if (this.cooldown <= 0) {
        this.cooldown = 100;
        const bestArm = this.arms[this.armOrder[0]];
        this.armOrder.shift();
        if (this.armOrder.length === 0) {
          this.replenishArmOrder();
        }
        this.moveArm(reachable, bestArm, 100);
      }
    }

    this.arms.forEach(arm => arm.update(this.head.position, this.reach));
  }

  render(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0xffa500);
    this.arms.forEach(arm => arm.render(graphics, this.head.position));
    const center = this.head.position;
    const radius = this.headRadius;
    graphics.fillCircle(center.x, center.y, radius);
    graphics.fillStyle(0xffffff);
    graphics.fillEllipse(center.x - radius / 3.0, center.y, radius / 5.0, radius / 2.0);
    graphics.fillEllipse(center.x + radius / 3.0, center.y, radius / 5.0, radius / 2.0);
  }
}
