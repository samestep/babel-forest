import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import * as _ from 'underscore';

function adjacents<T>(array: T[]): [T, T][] {
  return _.times(array.length - 1, i => [array[i], array[i + 1]]);
}

class Arm {
  comp: Matter.Composite;
  segments: Matter.Body[];
  hook: Matter.Body;
  spring: Matter.Constraint;

  constructor(config) {
    this.comp = Matter.Composite.create();

    const {
      x, y,
      numSegments,
      segmentLength,
      segmentRadius,
      collisionFilter,
    } = config;

    this.segments = _.times(numSegments, () => Matter.Bodies.rectangle(
      x, y, segmentLength, segmentRadius*2,
      { chamfer: { radius: segmentRadius }, collisionFilter, }
    ));

    const constraints = adjacents(this.segments).map(([s1, s2], i) => {
      const direction = i % 2 == 0 ? 1 : -1;
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
    const direction = i % 2 == 0 ? 1 : -1;
    const offset = direction * (segmentLength / 2.0 - segmentRadius);
    this.spring = Matter.Constraint.create({
      bodyA: this.segments[numSegments - 1],
      bodyB: this.hook,
      pointA: { x: offset, y: 0 },
      stiffness: 0.003,
      length: 0,
    });
  }

  // TODO: make this the actual tip rather than the center of the tip segment
  tipPosition(): Matter.Vector {
    return this.segments[this.segments.length - 1].position;
  }

  stop() {
    Matter.Composite.remove(this.comp, this.hook);
    Matter.Composite.remove(this.comp, this.spring);
  }

  move(point: Matter.Vector) {
    this.hook.position = point;

    Matter.Composite.add(this.comp, this.hook);
    Matter.Composite.add(this.comp, this.spring);
  }

  update(center: Matter.Vector, reach: number) {
    const v = Matter.Vector.sub(this.hook.position, center);
    const dist = Matter.Vector.magnitude(v);
    if (dist > reach) {
      this.stop();
    }
  }
}

export class Octopus {
  reach: number;
  comp: Matter.Composite;
  head: Matter.Body;
  arms: Arm[];
  hook: Matter.Body;
  spring: Matter.Constraint;

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
  }

  maybeReachable(bodies: Matter.Body[]): Matter.Body[] {
    const octobodies = new Set(Matter.Composite.allBodies(this.comp));
    // haha see what I did there?

    const relevantBodies = bodies.filter(b => !octobodies.has(b));

    const center = this.head.position;
    const reachBody = Matter.Bodies.circle(center.x, center.y, this.reach);

    return Matter.Query.region(relevantBodies, reachBody.bounds);
  }

  update() {
    const total = this.arms.reduce((acc, cur) => {
      return Matter.Vector.add(acc, cur.tipPosition());
    }, { x: 0, y: 0 });
    this.hook.position = Matter.Vector.div(total, this.arms.length);

    this.arms.forEach(arm => arm.update(this.head.position, this.reach));
  }
}
