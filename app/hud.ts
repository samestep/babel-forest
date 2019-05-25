/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import { Progress } from './save';
import * as story from './story';
import { Text } from './text';

const delay = 100;

export class HUD extends Phaser.Scene {
  text: Text;
  queue: [string, string][];

  create() {
    addEventListener('resize', () => {
      this.cameras.main.setSize(innerWidth, innerHeight);
    });

    this.text = new Text(this.add.text(10, 10, '', {
      fontFamily: 'sans',
      fontSize: '50px',
    }));

    this.sequence(story.introduction, 'introduction', 'library');
    this.sequence(story.library, 'library', 'move');
    this.sequence(story.move, 'move', 'waiting');
    this.coloredSequence(story.book1, 'book1', 'getting1');
    this.coloredSequence(story.book2, 'book2', 'getting2');
    this.coloredSequence(story.close, 'close', 'end');
  }

  update() {
    this.text.update(this.cameras.main.worldView);
  }

  coloredSequence(lines: [string, string][], event: string, progress: Progress) {
    const next = () => {
      const cline = this.queue.shift();
      if (cline) {
        const [color, line] = cline;
        this.tweens.add(this.text.reveal(delay, color, line, () => {
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

  sequence(lines: string[], event: string, progress: Progress) {
    const coloredLines: [string, string][] = lines.map(line => ['white', line]);
    this.coloredSequence(coloredLines, event, progress);
  }
}
