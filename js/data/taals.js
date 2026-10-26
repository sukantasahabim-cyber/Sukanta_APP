// Taal definitions. `bols` lists one entry per matra (beat); a matra holding
// several strokes separates them with spaces, e.g. "Ti Ra Ki Ta".
// `marks` label each vibhag: X = sam (clap), numbers = taali (clap), 0 = khali (wave).

const parse = (s) => s.split(',').map((beat) => beat.trim().split(/\s+/));

export const TAALS = {
  dadra: {
    name: 'Dadra', matras: 6, vibhags: [3, 3], marks: ['X', '0'], bpm: 90,
    bols: parse('Dha, Dhi, Na, Dha, Ti, Na'),
    use: 'Light classical, bhajans, folk and songs with a 3-feel',
  },
  keherwa: {
    name: 'Keherwa', matras: 8, vibhags: [4, 4], marks: ['X', '0'], bpm: 80,
    bols: parse('Dha, Ge, Na, Ti, Na, Ka, Dhi, Na'),
    use: 'Bhajans, folk, ghazals and most film songs',
  },
  rupak: {
    name: 'Rupak', matras: 7, vibhags: [3, 2, 2], marks: ['0', '1', '2'], bpm: 80,
    bols: parse('Tin, Tin, Na, Dhi, Na, Dhi, Na'),
    use: 'Songs and light classical; its sam falls on khali',
  },
  jhaptaal: {
    name: 'Jhaptaal', matras: 10, vibhags: [2, 3, 2, 3], marks: ['X', '2', '0', '3'], bpm: 80,
    bols: parse('Dhi, Na, Dhi, Dhi, Na, Ti, Na, Dhi, Dhi, Na'),
    use: 'Khayal and bhajan in medium tempo',
  },
  ektaal: {
    name: 'Ektaal', matras: 12, vibhags: [2, 2, 2, 2, 2, 2], marks: ['X', '0', '2', '0', '3', '4'], bpm: 60,
    bols: parse('Dhin, Dhin, Dha Ge, Ti Ra Ki Ta, Tu, Na, Kat, Ta, Dha Ge, Ti Ra Ki Ta, Dhi, Na'),
    use: 'Slow (vilambit) and fast khayal',
  },
  deepchandi: {
    name: 'Deepchandi', matras: 14, vibhags: [3, 4, 3, 4], marks: ['X', '2', '0', '3'], bpm: 90,
    bols: parse('Dha, Dhin, -, Dha, Dha, Tin, -, Ta, Tin, -, Dha, Dha, Dhin, -'),
    use: 'Thumri, dadra, bhajans and Holi songs, with a lilting swing',
  },
  dhamar: {
    name: 'Dhamar', matras: 14, vibhags: [5, 2, 3, 4], marks: ['X', '2', '0', '3'], bpm: 80,
    bols: parse('Ka, Dhi, Ta, Dhi, Ta, Dha, -, Ga, Ti, Ta, Ti, Ta, Ta, -'),
    use: 'Dhrupad-style Holi songs (dhamar), strong and majestic',
  },
  tilwada: {
    name: 'Tilwada', matras: 16, vibhags: [4, 4, 4, 4], marks: ['X', '2', '0', '3'], bpm: 50,
    bols: parse('Dha, Ti Ra Ki Ta, Dhin, Dhin, Dha, Dha, Tin, Tin, Ta, Ti Ra Ki Ta, Dhin, Dhin, Dha, Dha, Dhin, Dhin'),
    use: 'Slow (vilambit) khayal',
  },
  jhoomra: {
    name: 'Jhoomra', matras: 14, vibhags: [3, 4, 3, 4], marks: ['X', '2', '0', '3'], bpm: 45,
    bols: parse('Dhin, - Dha, Ti Ra Ki Ta, Dhin, Dhin, Dha Ge, Ti Ra Ki Ta, Tin, - Ta, Ti Ra Ki Ta, Dhin, Dhin, Dha Ge, Ti Ra Ki Ta'),
    use: 'Slow (vilambit) khayal, with a swaying feel',
  },
  teentaal: {
    name: 'Teentaal', matras: 16, vibhags: [4, 4, 4, 4], marks: ['X', '2', '0', '3'], bpm: 80,
    bols: parse('Dha, Dhin, Dhin, Dha, Dha, Dhin, Dhin, Dha, Dha, Tin, Tin, Ta, Ta, Dhin, Dhin, Dha'),
    use: 'The most important taal of Hindustani classical music',
  },
};

// Index of the vibhag each matra belongs to, and whether it starts that vibhag.
export function vibhagOf(taal, matra) {
  let start = 0;
  for (let v = 0; v < taal.vibhags.length; v++) {
    if (matra < start + taal.vibhags[v]) return { index: v, first: matra === start, mark: taal.marks[v] };
    start += taal.vibhags[v];
  }
  return null;
}
