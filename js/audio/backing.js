// Backing tracks for SurTaal's own songs: tabla, tanpura and (optionally) the
// melody on harmonium, rendered to audio so they can be downloaded or sung
// over on the "Sing with your own track" page.
import { renderOffline } from './engine.js';
import { playNote, tanpuraDrone } from './voice.js';
import { playBol } from './tabla.js';
import { songNotes } from '../analysis/singalong.js';
import { TAALS } from '../data/taals.js';

const TAIL = 3;   // seconds after the last note, for the sound to die away

// When everything plays, in seconds. One taal cycle of tabla and tanpura
// comes first, so the singer can settle in before the song starts on sam.
export function backingPlan(song, bpm = song.bpm) {
  const taal = TAALS[song.taal];
  const beat = 60 / bpm;
  const { notes, totalBeats } = songNotes(song);
  const intro = taal.matras;
  const beats = intro + totalBeats;
  return {
    beat,
    intro,
    beats,
    songStart: intro * beat,
    duration: beats * beat + TAIL,
    strokes: Array.from({ length: beats }, (_, b) => {
      const bols = taal.bols[b % taal.matras];
      return bols.map((bol, k) => ({ bol, time: (b + k / bols.length) * beat })).filter((s) => s.bol !== '-');
    }).flat(),
    notes: notes.map((n) => ({ semitone: n.semitone, time: (intro + n.start) * beat, dur: n.beats * beat * 0.95 })),
  };
}

export function renderBacking(song, { saMidi, bpm = song.bpm, guide = true, tabla = true, tanpura = true }) {
  const plan = backingPlan(song, bpm);
  return renderOffline(plan.duration, () => {
    if (tanpura) tanpuraDrone(0, plan.duration - TAIL, saMidi, 0.7);
    if (tabla) plan.strokes.forEach((s) => playBol(s.bol, s.time, 0.7));
    if (guide) plan.notes.forEach((n) => playNote(saMidi + n.semitone, n.time, n.dur, 0.16));
  });
}
