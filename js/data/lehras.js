// Lehras (nagmas): short repeating melodies, one taal cycle long, that tabla
// players practise and perform solos with. One entry per matra; a matra with
// several notes separates them with spaces, "-" holds the previous note.
const parse = (beats) => beats.map((b) => b.trim().split(/\s+/));

export const LEHRAS = {
  teentaal: { raag: 'yaman', bpm: 70, beats: parse(['.N', 'R G', 'm G', 'R S', '.N', 'R G', 'm D', 'N D', 'm G', 'R G', 'm', 'G R', 'S', '.N R', 'S', '-']) },
  ektaal: { raag: 'bhupali', bpm: 60, beats: parse(['S', 'R G', 'P', 'G R', 'S .D', 'S', 'G', 'P D', "S'", 'D P', 'G R', 'S']) },
  jhaptaal: { raag: 'bhupali', bpm: 80, beats: parse(['G', 'R S', '.D', 'S R', 'G', 'P', 'G R', 'S', '.D S', 'R']) },
  rupak: { raag: 'khamaj', bpm: 80, beats: parse(['G', 'M P', 'D', 'n D', 'P', 'M G', 'R']) },
  keherwa: { raag: 'kafi', bpm: 80, beats: parse(['S', 'R g', 'M', 'P', 'M g', 'R', 'g R', 'S']) },
  dadra: { raag: 'bhupali', bpm: 90, beats: parse(['G', 'P', 'D P', 'G', 'R', 'S']) },
  deepchandi: { raag: 'khamaj', bpm: 90, beats: parse(['G', 'M', '-', 'P', 'D', 'n', '-', 'D', 'P', '-', 'M', 'G', 'R', 'S']) },
};
