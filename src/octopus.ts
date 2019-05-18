import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import * as _ from 'underscore';

function adjacents(array) {
  return _.times(array.length - 1, i => [array[i], array[i + 1]]);
}

class Arm {
  comp: Matter.Composite;
  segments: Matter.Body[];

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
      const point = { x: offset, y: 0 };
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
    Matter.Composite.add(this.comp, constraints);
  }
}

export class Octopus {
  reach: number;
  comp: Matter.Composite;
  head: Matter.Body;
  arms: Arm[];

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
  }
}

export function maybeReachable(bodies: Matter.Body[], octopus: Octopus) {
  const center = octopus.head.position;
  const reachBody = Matter.Bodies.circle(center.x, center.y, octopus.reach);
  return Matter.Query.region(bodies, reachBody.bounds);
}
