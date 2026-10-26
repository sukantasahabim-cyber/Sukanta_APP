// Practical mode: exercises where the app listens through the microphone and
// marks what you play or sing as right or wrong. Keyed by lesson id.
//
// Exercise types:
//   hold   — sing one steady note (optionally a given swara) for `seconds`
//   range  — slide from your lowest to highest note; needs `minSemitones`
//   sing   — sing the swaras in `notes`, one after another
//   notes  — play single guitar notes from tab (`notes`, "string:fret")
//   chord  — play one chord; checked by strumming or string by string
//   changes — strum each chord in `chords` as it is shown, `rounds` times
//   rhythm — after a count-in, play `bols` (tabla, checks timing and stroke
//            sound) or a strum `pattern` (guitar, checks timing) at `bpm`.
//            "X" in bols = any stroke, "-" = rest.

export const PRACTICE = {
  // ---------- Singing ----------
  'sing-voice': [
    { type: 'hold', title: 'Hold a steady note', seconds: 3, label: 'Hum or sing "aa" on any comfortable note and keep it steady for 3 seconds.' },
  ],
  'sing-breath': [
    { type: 'hold', title: 'Long, steady breath', seconds: 8, label: 'Take a belly breath and sing one long "aa" for 8 seconds without wobbling.' },
  ],
  'sing-warmup': [
    { type: 'range', title: 'Siren: find your range', seconds: 15, minSemitones: 7, label: 'Slide slowly from your lowest comfortable note up to your highest and back down.' },
  ],
  'sing-find-sa': [
    { type: 'hold', title: 'Hold your Sa', note: 'S', seconds: 3, label: 'Sing Sa and hold it in tune for 3 seconds.' },
  ],
  'sing-sa-re-ga': [
    { type: 'sing', title: 'Sa Re Ga', notes: 'S R G' },
    { type: 'sing', title: 'Up and back', notes: 'S R G R S' },
  ],
  'sing-ma-pa': [
    { type: 'sing', title: 'Up to Pa', notes: 'S R G M P' },
    { type: 'sing', title: 'Down from Pa', notes: 'P M G R S' },
  ],
  'sing-dha-ni': [
    { type: 'sing', title: 'Up to high Sa', notes: "P D N S'" },
    { type: 'sing', title: 'Down from high Sa', notes: "S' N D P" },
  ],
  'sing-aroha': [
    { type: 'sing', title: 'Aroha', notes: "S R G M P D N S'" },
    { type: 'sing', title: 'Avaroha', notes: "S' N D P M G R S" },
  ],
  'sing-alankar-1': [
    { type: 'sing', title: 'Alankar 1', notes: "S R G M P D N S' S' N D P M G R S" },
    { type: 'sing', title: 'Alankar 2 (first half)', notes: 'S S R R G G M M', label: 'Re-sing each note clearly — say the sargam name twice.' },
  ],
  'sing-alankar-2': [
    { type: 'sing', title: 'Alankar 3', notes: 'S R G R G M G M P M P D' },
    { type: 'sing', title: 'Alankar 4', notes: 'S R G M R G M P G M P D' },
  ],
  'sing-alankar-taal': [
    { type: 'sing', title: 'Alankar 5', notes: "S G R M G P M D P N D S'" },
  ],
  'sing-komal-tivra': [
    { type: 'sing', title: 'Komal Re and komal Ga', notes: 'S r S g S' },
    { type: 'sing', title: 'Tivra Ma', notes: 'G m P m G' },
  ],
  'sing-bhupali': [
    { type: 'sing', title: 'Bhupali aroha', notes: "S R G P D S'" },
    { type: 'sing', title: 'Bhupali avaroha', notes: "S' D P G R S" },
    { type: 'sing', title: 'Bhupali pakad', notes: 'G R S .D S R G P G D P G R S' },
  ],
  'sing-yaman': [
    { type: 'sing', title: 'Yaman aroha', notes: ".N R G m D N S'" },
    { type: 'sing', title: 'Yaman avaroha', notes: "S' N D P m G R S" },
  ],
  'sing-riyaz': [
    { type: 'hold', title: 'Long Sa', note: 'S', seconds: 6, label: 'Hold Sa steadily for 6 seconds.' },
    { type: 'sing', title: 'Aroha and avaroha', notes: "S R G M P D N S' N D P M G R S" },
  ],

  // ---------- Tabla ----------
  'tabla-meet': [
    { type: 'rhythm', title: 'Four even strokes', bols: 'X X X X', bpm: 60, label: 'Play any stroke on any drum, once on each beat after the count-in.' },
  ],
  'tabla-posture': [
    { type: 'rhythm', title: 'Relaxed, even strokes', bols: 'X X X X X X X X', bpm: 60, label: 'Eight relaxed strokes, one per beat. Stay loose!' },
  ],
  'tabla-na': [
    { type: 'rhythm', title: 'Na on every beat', bols: 'Na Na Na Na Na Na Na Na', bpm: 60 },
  ],
  'tabla-tin-tu-ti': [
    { type: 'rhythm', title: 'Na and Tin', bols: 'Na Tin Na Tin Na Tin Na Tin', bpm: 60 },
    { type: 'rhythm', title: 'Closed and open', bols: 'Ti Ti Na - Ti Ti Na -', bpm: 60 },
  ],
  'tabla-ge-ke': [
    { type: 'rhythm', title: 'Ge Ge Ke', bols: 'Ge Ge Ke - Ge Ge Ke -', bpm: 60 },
    { type: 'rhythm', title: 'Alternate', bols: 'Ge Ke Ge Ke Ge Ke Ge Ke', bpm: 70 },
  ],
  'tabla-dha-dhin': [
    { type: 'rhythm', title: 'Dha and Ta', label: 'Bayan on, bayan off: the heart of khali.', bols: 'Dha Ta Dha Ta Dha Ta Dha Ta', bpm: 60 },
    { type: 'rhythm', title: 'Dha Dhin Dhin Dha', bols: 'Dha Dhin Dhin Dha Dha Dhin Dhin Dha', bpm: 60 },
  ],
  'tabla-taal-basics': [
    { type: 'rhythm', title: 'Clap Teentaal', label: 'Clap on beats 1, 5 and 13. Wave silently on 9, and count the other beats silently.', bols: 'X - - - X - - - - - - - X - - -', bpm: 80 },
  ],
  'tabla-keherwa': [
    { type: 'rhythm', title: 'Keherwa theka', bols: 'Dha Ge Na Ti Na Ka Dhi Na Dha Ge Na Ti Na Ka Dhi Na', bpm: 70 },
  ],
  'tabla-dadra': [
    { type: 'rhythm', title: 'Dadra theka', bols: 'Dha Dhi Na Dha Ti Na Dha Dhi Na Dha Ti Na', bpm: 80 },
  ],
  'tabla-teentaal': [
    { type: 'rhythm', title: 'Teentaal theka', bols: 'Dha Dhin Dhin Dha Dha Dhin Dhin Dha Dha Tin Tin Ta Ta Dhin Dhin Dha', bpm: 70 },
  ],
  'tabla-rupak-jhaptaal': [
    { type: 'rhythm', title: 'Rupak theka', bols: 'Tin Tin Na Dhi Na Dhi Na Tin Tin Na Dhi Na Dhi Na', bpm: 80 },
    { type: 'rhythm', title: 'Jhaptaal theka', bols: 'Dhi Na Dhi Dhi Na Ti Na Dhi Dhi Na', bpm: 80 },
  ],
  'tabla-laya': [
    { type: 'rhythm', title: 'Thah (1 bol per beat)', bols: 'Dha Dhin Dhin Dha Dha Dhin Dhin Dha', bpm: 60 },
    { type: 'rhythm', title: 'Dugun (2 bols per beat)', bols: 'Dha Dhin Dhin Dha Dha Dhin Dhin Dha', bpm: 60, perBeat: 2 },
  ],
  'tabla-tirakita': [
    { type: 'rhythm', title: 'TiRaKiTa, slowly', bols: 'Ti Ra Ki Ta Ti Ra Ki Ta', bpm: 60 },
  ],
  'tabla-kaida': [
    { type: 'rhythm', title: 'Kaida theme', bols: 'Dha Dha Ti Ta Dha Dha Tin Na Ta Ta Ti Ta Dha Dha Dhin Na', bpm: 70 },
  ],
  'tabla-tihai': [
    { type: 'rhythm', title: 'Theka + tihai to sam', label: 'The very last Dha is the next sam.', bols: 'Dha Dhin Dhin Dha Dha Dhin Ti Ta Dha - Ti Ta Dha - Ti Ta Dha', bpm: 70 },
  ],
  'tabla-accompany': [
    { type: 'rhythm', title: 'Steady Keherwa', bols: 'Dha Ge Na Ti Na Ka Dhi Na Dha Ge Na Ti Na Ka Dhi Na', bpm: 90 },
  ],

  // ---------- Guitar ----------
  'guitar-meet': [
    { type: 'notes', title: 'Pluck the open strings', notes: '6:0 5:0 4:0 3:0 2:0 1:0', label: 'Pluck each open string, from the thickest (6) to the thinnest (1).' },
  ],
  'guitar-hold': [
    { type: 'rhythm', title: 'Down-strums on the beat', pattern: 'D-D-D-D-D-D-D-D-', bpm: 60, label: 'Strum the open strings downwards on every beat.' },
  ],
  'guitar-tune': [
    { type: 'notes', title: 'Tuning check', notes: '6:0 5:0 4:0 3:0 2:0 1:0', tolerance: 10, label: 'Pluck each open string. Each must be within 10 cents of perfect.' },
  ],
  'guitar-read': [
    { type: 'notes', title: 'Read this tab', notes: '6:0 6:3 5:0 5:2 4:0 4:2' },
  ],
  'guitar-fret': [
    { type: 'notes', title: 'Spider on strings 6 and 5', notes: '6:1 6:2 6:3 6:4 5:1 5:2 5:3 5:4' },
  ],
  'guitar-em-am': [
    { type: 'chord', title: 'Em', chord: 'Em' },
    { type: 'chord', title: 'Am', chord: 'Am' },
    { type: 'changes', title: 'Em ↔ Am', chords: ['Em', 'Am'], rounds: 2 },
  ],
  'guitar-e-a-d': [
    { type: 'chord', title: 'E', chord: 'E' },
    { type: 'chord', title: 'A', chord: 'A' },
    { type: 'chord', title: 'D', chord: 'D' },
    { type: 'changes', title: 'A – D – E – A', chords: ['A', 'D', 'E', 'A'], rounds: 1 },
  ],
  'guitar-changes': [
    { type: 'changes', title: 'E ↔ Am', chords: ['E', 'Am'], rounds: 3 },
    { type: 'changes', title: 'A ↔ D', chords: ['A', 'D'], rounds: 3 },
  ],
  'guitar-strum': [
    { type: 'rhythm', title: 'All downs', pattern: 'D-D-D-D-D-D-D-D-', bpm: 70 },
    { type: 'rhythm', title: 'D – D U – U D U', pattern: 'D-DU-UDUD-DU-UDU', bpm: 70, label: 'Hold Em and play the classic pattern twice.' },
  ],
  'guitar-g-c': [
    { type: 'chord', title: 'G', chord: 'G' },
    { type: 'chord', title: 'C', chord: 'C' },
    { type: 'changes', title: 'G ↔ C', chords: ['G', 'C'], rounds: 2 },
  ],
  'guitar-songs': [
    { type: 'changes', title: 'G – D – Em – C', chords: ['G', 'D', 'Em', 'C'], rounds: 2 },
  ],
  'guitar-dm-f': [
    { type: 'chord', title: 'Dm', chord: 'Dm' },
    { type: 'chord', title: 'Easy F', chord: 'Fsmall' },
    { type: 'changes', title: 'C – Am – F – G', chords: ['C', 'Am', 'Fsmall', 'G'], rounds: 1 },
  ],
  'guitar-blues': [
    { type: 'chord', title: 'A7', chord: 'A7' },
    { type: 'chord', title: 'E7', chord: 'E7' },
    { type: 'changes', title: 'Blues changes', chords: ['A7', 'D7', 'A7', 'E7'], rounds: 1 },
  ],
  'guitar-power': [
    { type: 'chord', title: 'G5', chord: 'G5' },
    { type: 'changes', title: 'E5 – G5 – A5 – C5', chords: ['E5', 'G5', 'A5', 'C5'], rounds: 1 },
  ],
  'guitar-pentatonic': [
    { type: 'notes', title: 'A minor pentatonic, up', notes: '6:5 6:8 5:5 5:7 4:5 4:7 3:5 3:7 2:5 2:8 1:5 1:8' },
  ],
  'guitar-barre': [
    { type: 'chord', title: 'F barre', chord: 'F' },
    { type: 'chord', title: 'Bm barre', chord: 'Bm' },
    { type: 'changes', title: 'F – C – G – Am', chords: ['F', 'C', 'G', 'Am'], rounds: 1 },
  ],
};
