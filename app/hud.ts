/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import { Page } from './page';
import { Progress } from './save';
import * as story from './story';
import { Text } from './text';

const delay = 100;

export class HUD extends Phaser.Scene {
  graphics: Phaser.GameObjects.Graphics;
  text: Text;
  queue: [string, string][];
  page: Page;
  justClicked: boolean;
  opacity: number;

  create() {
    addEventListener('resize', () => {
      this.cameras.main.setSize(innerWidth, innerHeight);
    });

    this.graphics = this.add.graphics();

    this.text = new Text(this.add.text(10, 10, '', {
      fontFamily: 'sans-serif',
      fontSize: '50px',
    }));

    this.page = new Page(this.add.text(0, 0, ''), this.add.text(0, 0, ''));

    this.sequence(story.introduction, 'introduction', 'library');
    this.sequence(story.library, 'library', 'move');
    this.sequence(story.move, 'move', 'waiting');
    this.coloredSequence(story.book1, 'book1', 'getting1');
    this.coloredSequence(story.book2, 'book2', 'getting2');
    this.coloredSequence(story.close, 'close', 'end');

    this.showBook(story.books[0], 'found1', 'book2');
    this.showBook(story.books[1], 'found2', 'close');

    this.input.on('pointerdown', () => { this.justClicked = true; });

    this.opacity = 0;
    this.events.on('hud-end', () => {
      this.tweens.add({
        targets: this,
        opacity: 1,
        duration: 1000,
        onComplete: () => {
          const credits = this.add.text(100, 100, story.credits.join('\n'), {
            fontFamily: 'sans-serif',
            fontSize: '25px',
          });
          credits.setAlpha(0);
          this.tweens.add({
            targets: credits,
            alpha: 1,
            duration: 1000,
          })
        }
      });
    });

    if (this.registry.values.save.progress === 'end') {
      this.events.emit('hud-end');
    }
  }

  update() {
    if (this.justClicked) {
      this.justClicked = false;
      if (this.input.activePointer.x < this.cameras.main.worldView.centerX) {
        if (this.page.leftArrow) {
          this.page.pageNum--;
        }
      } else {
        if (this.page.rightArrow) {
          this.page.pageNum++;
        }
      }
    }

    this.text.update(this.cameras.main.worldView);
    this.page.update(
      this.cameras.main.worldView,
      () => this.add.graphics(),
      key => this.textures.remove(key),
    );

    this.graphics.clear();
    this.page.render(this.graphics);

    if (this.opacity > 0) {
      const { width, height } = this.cameras.main.worldView;
      this.graphics.fillStyle(0x000000, this.opacity);
      this.graphics.fillRect(0, 0, width, height);
    }
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

  showBook(paragraphs: string[], event: string, progress: Progress) {
    this.scene.get('main').events.on(`main-${event}`, () => {
      this.page.rebuild(
        paragraphs,
        () => this.add.graphics(),
        key => this.textures.remove(key),
      );
      this.tweens.add({
        targets: this.page,
        opacity: 1,
        duration: 1000,
        onComplete: () => {
          const escape = this.input.keyboard.addKey('ESC');
          escape.once('down', () => {
            this.tweens.add({
              targets: this.page,
              opacity: 0,
              duration: 1000,
              onComplete: () => {
                this.registry.values.save.progress = progress;
                this.events.emit(`hud-${progress}`);
              },
            });
          });
        },
      })
    });
  }
}
