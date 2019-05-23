import * as t from 'io-ts';

const Save = t.interface({
  progress: t.keyof({ sleeping: null, library: null }),
  location: t.tuple([t.number, t.number]),
});

type Save = t.TypeOf<typeof Save>;

const defaultSave: Save = {
  progress: 'sleeping',
  location: [0, 0],
};

export function loadGame(): Save {
  const str = localStorage.getItem('babel-forest');
  try {
    const parsed = JSON.parse(str);
    const either = Save.decode(parsed);
    return either.getOrElse(defaultSave);
  } catch (e) {
    return defaultSave;
  }
}

export function saveGame(data: Save) {
  localStorage.setItem('babel-forest', JSON.stringify(data));
}
