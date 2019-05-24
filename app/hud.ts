/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import { Progress } from './save';
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

    this.sequence(story.introduction, 'introduction', 'library');
    this.sequence(story.library, 'library', 'move');
  }

  update() {
    this.text.update(this.cameras.main.worldView);
  }

  sequence(lines: string[], event: string, progress: Progress) {
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
        this.registry.values.save.progress = progress;
        this.events.emit(`hud-${progress}`);
      }
    }
    const main = this.scene.get('main');
    main.events.on(`main-${event}`, () => {
      this.queue = lines;
      next();
    });
  }
}
