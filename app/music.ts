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

const bass: [string[], string][] = [
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

const treble: [string[], string][] = [
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

export function play(save: Save) {
  const bassSynth = new Tone.PolySynth().toMaster();
  const trebleSynth = new Tone.PolySynth().toMaster();

  Tone.Transport.bpm.value = 180; // actually 120bpm, I think it thinks 4n = 4n.
  Tone.Transport.timeSignature = [12, 8];
  Tone.Transport.scheduleRepeat((time: number) => {
    line(bassSynth, time, bass);
    if (save.progress !== 'sleeping') {
      line(trebleSynth, time, treble);
    }
  }, '4m');
  Tone.Transport.start();
}
