import * as MatterJS from 'matter-js';
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

import * as _ from 'underscore';

function adjacents(array) {
  return _.times(array.length - 1, i => [array[i], array[i + 1]]);
}

function makeArm(config) {
  const {
    x, y,
    numSegments,
    segmentLength,
    segmentRadius,
    collisionFilter,
  } = config;

  const segments = _.times(numSegments, () => Matter.Bodies.rectangle(
    x, y, segmentLength, segmentRadius*2,
    { chamfer: { radius: segmentRadius }, collisionFilter, }
  ));
  const constraints = adjacents(segments).map(([s1, s2], i) => {
    const direction = i % 2 == 0 ? 1 : -1;
    const offset = direction * (segmentLength / 2.0 - segmentRadius);
    const point = { x: offset, y: 0 };
    console.log(point);
    return Matter.Constraint.create({
      bodyA: s1,
      pointA: { x: offset, y: 0 },
      bodyB: s2,
      pointB: { x: offset, y: 0 },
      stiffness: 1,
      length: 0,
    });
  });
  return {
    things: segments.concat(constraints),
    start: segments[0],
  };
}

export function makeOctopus(config) {
  const {
    x, y,
    headRadius,
    numArms,
    segmentLength,
    segmentRadius,
    segmentsPerArm,
  } = config;

  const group = Matter.Body.nextGroup(true);
  const collisionFilter = {
    group,
    mask: ~0,
    category: 1,
  };

  const head = Matter.Bodies.circle(x, y, headRadius, { collisionFilter });

  const arms = _.times(numArms, () => makeArm({
    x, y: y - 30,
    numSegments: segmentsPerArm,
    segmentLength,
    segmentRadius,
    collisionFilter,
  }));
  const constraints = arms.map(arm => {
    const offset = -1 * (segmentLength / 2.0 - segmentRadius);
    return Matter.Constraint.create({
      bodyA: head,
      bodyB: arm.start,
      pointB: { x: offset, y: 0 },
      stiffness: 1,
      length: 0,
    });
  });
  return [head].concat(...(arms.map(arm => arm.things)), ...constraints);
}
