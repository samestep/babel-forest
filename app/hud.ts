/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as story from './story';
import { Text } from './text';

const delay = 100;

export class HUD extends Phaser.Scene {
  cooldown: number;
  text: Text;
  queue: string[];

  create() {
    addEventListener('resize', () => {
      this.cameras.main.setSize(innerWidth, innerHeight);
    });

    this.text = new Text(this.add.text(10, 10, '', {
      fontFamily: 'sans',
      fontSize: '50px',
    }));
    this.cooldown = delay;

    this.queue = story.introduction;
    const next = () => {
      const line = this.queue.shift();
      if (line) {
        this.tweens.add(this.text.reveal(delay, line, () => {
          this.time.addEvent({ delay: 250, callback: () => {
            this.text.progress = 0;
            this.time.addEvent({ delay: 250, callback: next });
          } });
        }));
      } else {
        this.registry.values.save.progress = 'library';
      }
    }
    this.scene.get('main').events.on('introduction', next);
  }

  update() {
    this.text.update(this.cameras.main.worldView);
  }
}
