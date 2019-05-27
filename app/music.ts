import * as Tone from 'tone';

import { Save } from './save';

function line(synth, start: number, chords: [string[], string][]) {
  let runningTime = start;
  chords.forEach(([notes, duration]) => {
    notes.forEach(note => {
      synth.triggerAttackRelease(note, duration, runningTime);
    });
    runningTime += Tone.Time(duration);
  });
}

const bass1: [string[], string][] = [
  [['F2'], '4n'],
  [[], '8n'],
  [[], '4n'],
  [['F2'], '8n'],
  [[], '4n.'],
  [[], '4n'],
  [[], '8n'],

  [[], '4n'],
  [[], '8n'],
  [[], '4n'],
  [['Eb2'], '8n'],
  [[], '4n.'],
  [[], '4n'],
  [[], '8n'],

  [[], '4n'],
  [[], '8n'],
  [[], '4n'],
  [['Bb2'], '8n'],
  [[], '4n.'],
  [[], '4n'],
  [[], '8n'],

  [[], '4n'],
  [[], '8n'],
  [[], '4n'],
  [['Bb2'], '8n'],
  [[], '4n.'],
  [[], '4n'],
  [[], '8n'],
];

const bass2: [string[], string][] = [
  [['F2'], '4n'],
  [['C3'], '8n'],
  [[], '4n'],
  [['F2'], '8n'],
  [['C3'], '4n.'],
  [[], '4n'],
  [[], '8n'],

  [[], '4n'],
  [['G#2'], '8n'],
  [[], '4n'],
  [['Eb2'], '8n'],
  [['G#2'], '4n.'],
  [[], '4n'],
  [[], '8n'],

  [[], '4n'],
  [['Eb3'], '8n'],
  [[], '4n'],
  [['Bb2'], '8n'],
  [['Eb3'], '4n.'],
  [[], '4n'],
  [[], '8n'],

  [[], '4n'],
  [['D3'], '8n'],
  [[], '4n'],
  [['Bb2'], '8n'],
  [['D3'], '4n.'],
  [[], '4n'],
  [[], '8n'],
];

const bass3: [string[], string][] = [
  [['F2'], '4n'],
  [['C3'], '8n'],
  [[], '4n'],
  [['F2'], '8n'],
  [['C3'], '4n.'],
  [['C3'], '4n'],
  [['C3'], '8n'],

  [[], '4n'],
  [['G#2'], '8n'],
  [[], '4n'],
  [['Eb2'], '8n'],
  [['G#2'], '4n.'],
  [['G#2'], '4n'],
  [['G#2'], '8n'],

  [[], '4n'],
  [['Eb3'], '8n'],
  [[], '4n'],
  [['Bb2'], '8n'],
  [['Eb3'], '4n.'],
  [['Eb3'], '4n'],
  [['Eb3'], '8n'],

  [[], '4n'],
  [['D3'], '8n'],
  [[], '4n'],
  [['Bb2'], '8n'],
  [['D3'], '4n.'],
  [['D3'], '4n'],
  [['D3'], '8n'],
];

const treble1: [string[], string][] = [
  [['G#3'], '8n'],
  [['Bb3'], '4n'],
  [[], '4n.'],
  [[], '4n.'],
  [[], '8n'],
  [['C4'], '8n'],
  [[], '8n'],

  [['G#3'], '8n'],
  [['Bb3'], '8n'],
  [[], '8n'],
  [[], '4n.'],
  [['Eb4'], '4n'],
  [['C#4'], '8n'],
  [['G#3'], '8n'],
  [[], '4n'],

  [['F#4'], '8n'],
  [[], '8n'],
  [[], '4n'],
  [['Eb4'], '4n'],
  [['F4'], '4n'],
  [['C#4'], '8n'],
  [['Bb3'], '4n'],
  [[], '8n'],

  [['C4'], '4n'],
  [['Eb4'], '4n'],
  [[], '4n'],
  [['Bb3'], '4n.'],
  [[], '8n'],
  [[], '4n'],
];

const treble2: [string[], string][] = [
  [['G#3'], '8n'],
  [['Bb3'], '4n'],
  [[], '4n.'],
  [['F4'], '4n.'],
  [[], '8n'],
  [['C4'], '8n'],
  [[], '8n'],

  [['G#3'], '8n'],
  [['Bb3'], '8n'],
  [[], '8n'],
  [['Bb3'], '4n.'],
  [['Eb4'], '4n'],
  [['C#4'], '8n'],
  [['G#3'], '8n'],
  [['Eb4'], '4n'],

  [['F#4'], '8n'],
  [['G#3'], '8n'],
  [['G#4'], '4n'],
  [['Eb4'], '4n'],
  [['F4'], '4n'],
  [['C#4'], '8n'],
  [['Bb3'], '4n'],
  [[], '8n'],

  [['C4'], '4n'],
  [['Eb4'], '4n'],
  [['F4'], '4n'],
  [['Bb3'], '4n.'],
  [['D4'], '8n'],
  [[], '4n'],
];

const treble3: [string[], string][] = [
  [['G#3'], '8n'],
  [['Bb3'], '4n'],
  [['Bb3'], '4n.'],
  [['C4', 'Eb4', 'F4'], '4n.'],
  [[], '8n'],
  [['C4'], '8n'],
  [['Bb3'], '8n'],

  [['F3', 'G#3'], '8n'],
  [['Bb3'], '8n'],
  [['C4'], '8n'],
  [['Bb3'], '4n.'],
  [['C#4', 'Eb4'], '4n'],
  [['C#4'], '8n'],
  [['Bb3', 'G#3'], '8n'],
  [['Eb4'], '4n'],

  [['Eb4', 'F#4'], '8n'],
  [['G#3'], '8n'],
  [['G#4'], '4n'],
  [['Eb4'], '4n'],
  [['F4'], '4n'],
  [['C#4'], '8n'],
  [['Bb3'], '4n'],
  [['Bb3'], '8n'],

  [['C4'], '4n'],
  [['Eb4'], '4n'],
  [['F4'], '4n'],
  [['Bb3'], '4n.'],
  [['C4', 'D4'], '8n'],
  [['Bb3'], '4n'],
];

const high1: [string[], string][] = [
  [[], '4n.'],
  [[], '8n'],
  [['Eb5', 'G5', 'Bb5'], '4n'],
  [[], '8n'],
  [[], '8n'],
  [[], '8n'],
  [[], '4n.'],

  [[], '4n.'],
  [[], '8n'],
  [['C5', 'Eb5', 'G5'], '4n'],
  [[], '8n'],
  [[], '8n'],
  [[], '8n'],
  [[], '4n.'],

  [[], '4n.'],
  [[], '8n'],
  [['Bb4', 'C5', 'Eb5'], '4n'],
  [[], '8n'],
  [[], '8n'],
  [[], '8n'],
  [[], '4n.'],

  [[], '4n.'],
  [[], '8n'],
  [['C#5', 'Eb5', 'F5'], '4n'],
  [[], '8n'],
  [[], '8n'],
  [[], '8n'],
  [[], '4n.'],
];

const high2: [string[], string][] = [
  [[], '4n.'],
  [[], '8n'],
  [['Eb5', 'G5', 'Bb5'], '4n'],
  [[], '8n'],
  [[], '8n'],
  [['Eb5', 'F5', 'G#5'], '8n'],
  [[], '4n.'],

  [[], '4n.'],
  [[], '8n'],
  [['C5', 'Eb5', 'G5'], '4n'],
  [[], '8n'],
  [[], '8n'],
  [['C5', 'Eb5', 'F5'], '8n'],
  [[], '4n.'],

  [[], '4n.'],
  [[], '8n'],
  [['Bb4', 'C5', 'Eb5'], '4n'],
  [[], '8n'],
  [[], '8n'],
  [['Bb4', 'Eb5', 'F5'], '8n'],
  [[], '4n.'],

  [[], '4n.'],
  [[], '8n'],
  [['C#5', 'Eb5', 'F5'], '4n'],
  [[], '8n'],
  [[], '8n'],
  [['Eb5', 'G5'], '8n'],
  [[], '4n.'],
];

const high3: [string[], string][] = [
  [[], '4n.'],
  [['Eb5'], '8n'],
  [['Eb5', 'G5', 'Bb5'], '4n'],
  [[], '8n'],
  [['Eb5'], '8n'],
  [['Eb5', 'F5', 'G#5'], '8n'],
  [[], '4n.'],

  [[], '4n.'],
  [['C5'], '8n'],
  [['C5', 'Eb5', 'G5'], '4n'],
  [[], '8n'],
  [['C5'], '8n'],
  [['C5', 'Eb5', 'F5'], '8n'],
  [[], '4n.'],

  [[], '4n.'],
  [['Bb4'], '8n'],
  [['Bb4', 'C5', 'Eb5'], '4n'],
  [[], '8n'],
  [['Bb4'], '8n'],
  [['Bb4', 'Eb5', 'F5'], '8n'],
  [[], '4n.'],

  [[], '4n.'],
  [['C#5'], '8n'],
  [['C#5', 'Eb5', 'F5'], '4n'],
  [[], '8n'],
  [['Eb5'], '8n'],
  [['Eb5', 'G5'], '8n'],
  [[], '4n.'],
];

export function play(save: Save) {
  const bassSynth = new Tone.PolySynth().toMaster();
  const trebleSynth = new Tone.PolySynth().toMaster();
  const highSynth = new Tone.PolySynth().toMaster();
  highSynth.volume.value = -10;

  Tone.Transport.bpm.value = 180; // actually 120bpm, I think it thinks 4n = 4n.
  Tone.Transport.timeSignature = [12, 8];
  Tone.Transport.scheduleRepeat((time: number) => {
    switch (save.progress) {
      case 'sleeping':
        line(bassSynth, time, bass1);
        break;
      case 'library':
        line(bassSynth, time, bass2);
        break;
      case 'move':
        line(bassSynth, time, bass3);
        break;
      case 'waiting':
        line(bassSynth, time, bass3);
        break;
      case 'book1':
        line(bassSynth, time, bass3);
        line(trebleSynth, time, treble1);
        break;
      case 'getting1':
        line(bassSynth, time, bass3);
        line(trebleSynth, time, treble1);
        line(highSynth, time, high1);
        break;
      case 'found1':
        line(bassSynth, time, bass3);
        break;
      case 'book2':
        line(bassSynth, time, bass3);
        line(trebleSynth, time, treble2);
        break;
      case 'getting2':
        line(bassSynth, time, bass3);
        line(trebleSynth, time, treble2);
        line(highSynth, time, high2);
        break;
      case 'found2':
        line(bassSynth, time, bass3);
        break;
      case 'book3':
        line(bassSynth, time, bass3);
        line(trebleSynth, time, treble3);
        break;
      case 'getting3':
        line(bassSynth, time, bass3);
        line(trebleSynth, time, treble3);
        line(highSynth, time, high3);
        break;
      case 'found3':
        line(bassSynth, time, bass2);
        break;
      case 'book4':
        line(bassSynth, time, bass1);
        line(trebleSynth, time, treble2);
        break;
      case 'getting4':
        line(bassSynth, time, bass1);
        line(trebleSynth, time, treble2);
        line(highSynth, time, high2);
        break;
      case 'found4':
        line(bassSynth, time, bass1);
        break;
      case 'close':
        line(bassSynth, time, bass3);
        line(trebleSynth, time, treble3);
        break;
      case 'end':
        line(bassSynth, time, bass3);
        line(highSynth, time, high3);
        break;
    }
  }, '4m');
  Tone.Transport.start();
}
