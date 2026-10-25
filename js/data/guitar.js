// Guitar course: from holding the guitar to barre chords and your first scale.
// Tab notes are "string:fret" (string 1 = high e, 6 = low E); join with "+" to play together.

export const guitar = {
  id: 'guitar',
  name: 'Guitar',
  icon: '🎸',
  tagline: 'From holding the guitar to chords, strumming, songs and solos',
  levels: [
    {
      title: 'Level 1 · Getting Started',
      lessons: [
        {
          id: 'guitar-meet',
          title: 'Know Your Guitar',
          minutes: 8,
          steps: [
            { type: 'text', title: 'Types of guitar', body: `
              <ul>
                <li><b>Acoustic</b> — steel strings, bright and loud. The most popular guitar for songs.</li>
                <li><b>Classical</b> — nylon strings, soft and warm, gentle on fingertips. Great for children.</li>
                <li><b>Electric</b> — thin steel strings, needs an amplifier.</li>
              </ul>
              <p>Everything in this course works on all three.</p>` },
            { type: 'text', title: 'Parts of the guitar', body: `
              <ul>
                <li><b>Headstock & tuning pegs</b> — turn these to tune the strings.</li>
                <li><b>Nut</b> — the small strip where the strings leave the headstock.</li>
                <li><b>Neck & fretboard</b> — where your fretting hand presses the strings.</li>
                <li><b>Frets</b> — the metal strips. Fret 1 is the one nearest the headstock.</li>
                <li><b>Body & sound hole</b> — make the sound loud.</li>
                <li><b>Bridge & saddle</b> — where the strings end on the body.</li>
              </ul>` },
            { type: 'text', title: 'The six strings', body: `
              <p>Strings are numbered from <b>6 (thickest, lowest)</b> to <b>1 (thinnest, highest)</b>. In standard tuning they are:</p>
              <p class="big-line">E &nbsp; A &nbsp; D &nbsp; G &nbsp; B &nbsp; E</p>
              <p>Remember it as: <b>E</b>ddie <b>A</b>te <b>D</b>ynamite, <b>G</b>ood <b>B</b>ye <b>E</b>ddie.</p>` },
            { type: 'strings', title: 'Hear each string' },
          ],
          quiz: [
            { q: 'Which is string number 1?', options: ['The thickest, low E', 'The thinnest, high E'], answer: 1, explain: 'String 1 is the thinnest; string 6 is the thickest.' },
            { q: 'Standard tuning from the 6th to the 1st string is…', options: ['E A D G B E', 'E B G D A E', 'A D G C E A'], answer: 0, explain: 'E A D G B E — Eddie Ate Dynamite, Good Bye Eddie.' },
            { q: 'Which fret is number 1?', options: ['The one nearest the headstock', 'The one nearest the body'], answer: 0, explain: 'Frets count up from the headstock.' },
          ],
        },
        {
          id: 'guitar-hold',
          title: 'Holding the Guitar & Pick',
          minutes: 10,
          steps: [
            { type: 'text', title: 'Posture', body: `
              <ul>
                <li>Sit on a chair without arms. Rest the guitar's waist on your right thigh (left thigh if left-handed).</li>
                <li>Hold the body close against you, neck pointing slightly upwards.</li>
                <li>Back straight. Tilt your head to look at the fretboard rather than leaning the guitar back.</li>
              </ul>` },
            { type: 'text', title: 'Fretting hand', body: `
              <ul>
                <li>Thumb rests behind the neck, roughly behind your middle finger.</li>
                <li>Fingers curved like holding a ball, pressing with the tips.</li>
                <li>Wrist relaxed and slightly forward — no sharp bend.</li>
              </ul>` },
            { type: 'text', title: 'Holding a pick', body: `
              <ul>
                <li>Hold the pick between the pad of your thumb and the side of your curled index finger.</li>
                <li>Only a small tip should show.</li>
                <li>Beginners do well with a thin or medium pick (0.5–0.7 mm). You can also strum with your thumb.</li>
                <li>Strum from the wrist, as if shaking water off your hand.</li>
              </ul>` },
            { type: 'metronome', title: 'Strum the open strings', label: 'Strum down across all six open strings on every click.', bpm: 60 },
          ],
          quiz: [
            { q: 'Where does your fretting-hand thumb usually rest?', options: ['Wrapped over the top of the neck', 'Behind the neck, around the middle finger', 'On the body'], answer: 1, explain: 'Thumb behind the neck gives your fingers freedom.' },
            { q: 'Strumming movement mostly comes from…', options: ['The wrist', 'The shoulder'], answer: 0, explain: 'A loose wrist gives a relaxed, even strum.' },
          ],
        },
        {
          id: 'guitar-tune',
          title: 'Tuning Your Guitar',
          minutes: 10,
          steps: [
            { type: 'text', title: 'Tune every time', body: `
              <p>Even perfect chords sound wrong on an out-of-tune guitar, so tune each time you pick it up.</p>
              <ul>
                <li><b>Tighten</b> a string → pitch goes <b>up</b>. <b>Loosen</b> → pitch goes <b>down</b>.</li>
                <li>Always finish by tuning <b>up</b> to the note. If a string is too high, loosen it below the note, then bring it up. It will stay in tune longer.</li>
              </ul>` },
            { type: 'tuner', title: 'Tuner', mode: 'guitar' },
            { type: 'strings', title: 'Reference tones', label: 'Or tune by ear: play a reference note and match your string to it.' },
            { type: 'tip', body: `<p><b>Tuning by ear (5th-fret method):</b> once the 6th string is right, the 5th fret of each string matches the next open string — except the G string, where you use the <b>4th</b> fret to match the open B.</p>` },
          ],
          quiz: [
            { q: 'To raise the pitch of a string you…', options: ['Tighten it', 'Loosen it'], answer: 0, explain: 'More tension = higher pitch.' },
            { q: 'Which fret of the G string matches the open B string?', options: ['5th', '4th', '3rd'], answer: 1, explain: 'G to B is only four frets, so use the 4th fret.' },
          ],
        },
        {
          id: 'guitar-read',
          title: 'Reading Chord Diagrams & Tabs',
          minutes: 10,
          steps: [
            { type: 'text', title: 'Chord diagrams', body: `
              <ul>
                <li>Imagine the guitar standing up facing you. <b>Vertical lines</b> are strings (low E on the left), <b>horizontal lines</b> are frets.</li>
                <li>The thick line at the top is the nut.</li>
                <li><b>Dots</b> show where to press. The number is the finger: <b>1</b> index, <b>2</b> middle, <b>3</b> ring, <b>4</b> little finger.</li>
                <li><b>○</b> above a string = play it open. <b>×</b> = do not play it.</li>
              </ul>` },
            { type: 'chords', title: 'Example: E minor', chords: ['Em'] },
            { type: 'text', title: 'Tabs', body: `
              <ul>
                <li>Tab has six lines, one per string. The <b>top line is the thin high e</b>; the bottom is the thick low E.</li>
                <li>A number tells you which fret to press. <b>0</b> means play the string open.</li>
                <li>Read from left to right.</li>
              </ul>` },
            { type: 'tab', title: 'The open strings in tab', notes: '6:0 5:0 4:0 3:0 2:0 1:0', bpm: 70 },
          ],
          quiz: [
            { q: 'In a chord diagram, × above a string means…', options: ['Play it open', 'Do not play it', 'Press hard'], answer: 1, explain: '× = mute or skip that string.' },
            { q: 'In tab, the top line is…', options: ['The thick low E', 'The thin high e'], answer: 1, explain: 'Tab shows the high e at the top.' },
            { q: 'Finger number 3 is your…', options: ['Index', 'Middle', 'Ring'], answer: 2, explain: '1 index, 2 middle, 3 ring, 4 little.' },
          ],
        },
        {
          id: 'guitar-fret',
          title: 'Fretting & the Spider Exercise',
          minutes: 12,
          steps: [
            { type: 'text', title: 'A clean note', body: `
              <ul>
                <li>Press with the very <b>tip</b> of your finger, just <b>behind</b> the fret wire — not on top of it, not in the middle.</li>
                <li>Use only as much pressure as you need.</li>
                <li><b>Buzzing?</b> Move closer to the fret or press a little harder. <b>Dull sound?</b> Another finger is touching the string.</li>
                <li>Fingertips will be sore for the first week or two. Short daily sessions build calluses.</li>
              </ul>` },
            { type: 'tab', title: 'Spider exercise (1-2-3-4)', label: 'One finger per fret: index on fret 1, middle 2, ring 3, little 4. Go string by string.', notes: '6:1 6:2 6:3 6:4 5:1 5:2 5:3 5:4 4:1 4:2 4:3 4:4 3:1 3:2 3:3 3:4 2:1 2:2 2:3 2:4 1:1 1:2 1:3 1:4', bpm: 60 },
            { type: 'timer', minutes: 5, tasks: [
              'Spider exercise at 60 BPM, every note clean',
              'Play it back from string 1 to string 6',
              'Keep fingers close to the strings when lifted',
            ] },
          ],
          quiz: [
            { q: 'Where should you press a string?', options: ['Right on top of the fret wire', 'Just behind the fret wire', 'In the middle between frets'], answer: 1, explain: 'Just behind the fret gives a clean note with least effort.' },
            { q: 'A note buzzes. What do you try first?', options: ['Move closer to the fret', 'Strum harder', 'Change strings'], answer: 0, explain: 'Most buzzes come from pressing too far from the fret.' },
          ],
        },
      ],
    },
    {
      title: 'Level 2 · First Chords & Strumming',
      lessons: [
        {
          id: 'guitar-em-am',
          title: 'First Chords: Em & Am',
          minutes: 12,
          steps: [
            { type: 'chords', title: 'Two easy chords', chords: ['Em', 'Am'] },
            { type: 'tip', body: `<p>Use <b>"String by string"</b> to check your chord: pick each string one at a time. If one sounds dead or buzzes, adjust that finger.</p>` },
            { type: 'progression', title: 'Change between them', chords: ['Em', 'Am'], pattern: 'D-D-D-D-', bpm: 60 },
          ],
          quiz: [
            { q: 'How many fingers does Em use?', options: ['One', 'Two', 'Three'], answer: 1, explain: 'Em uses two fingers on the 2nd fret.' },
            { q: 'Which string do you NOT play in Am?', options: ['6th (low E)', '1st (high e)', '3rd (G)'], answer: 0, explain: 'Am starts from the open 5th (A) string.' },
          ],
        },
        {
          id: 'guitar-e-a-d',
          title: 'E, A & D',
          minutes: 15,
          steps: [
            { type: 'chords', title: 'Three major chords', chords: ['E', 'A', 'D'] },
            { type: 'progression', title: 'A – D – E – A', chords: ['A', 'D', 'E', 'A'], pattern: 'D-D-D-D-', bpm: 60 },
          ],
          quiz: [
            { q: 'How many strings do you strum for D?', options: ['Four', 'Five', 'Six'], answer: 0, explain: 'D starts from the open 4th string.' },
            { q: 'E major is Em plus…', options: ['Index finger on the 1st fret of the G string', 'Little finger on the 3rd fret'], answer: 0, explain: 'Add finger 1 on G string, fret 1.' },
          ],
        },
        {
          id: 'guitar-changes',
          title: 'Changing Chords Smoothly',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Secrets of smooth changes', body: `
              <ul>
                <li><b>Look ahead</b> — know the next chord before you need it.</li>
                <li><b>Move as a shape</b> — lift all fingers together and land them together.</li>
                <li><b>Use anchors</b> — E and Am are the same shape, just moved one string. A finger that stays on the same string can slide instead of lifting.</li>
                <li><b>Lift only a little</b> — fingers hover just above the strings.</li>
              </ul>` },
            { type: 'text', title: 'One-minute changes', body: `
              <p>Pick two chords. Set the timer for one minute and count how many times you can switch cleanly between them. Write the number down and beat it tomorrow. Aim for 30 or more.</p>
              <p>Good pairs: <b>Em ↔ E</b>, <b>E ↔ Am</b>, <b>A ↔ D</b>, <b>D ↔ Em</b>.</p>` },
            { type: 'timer', title: 'One-minute changes', minutes: 1, tasks: ['Count your clean changes between two chords'] },
            { type: 'progression', title: 'One strum per bar', label: 'One strum, then three beats to change. Slowly speed up.', chords: ['E', 'Am'], pattern: 'D-------', bpm: 60 },
          ],
          quiz: [
            { q: 'Which two chords share the same finger shape?', options: ['E and Am', 'D and Em', 'A and G'], answer: 0, explain: 'Am is the E shape moved one string down.' },
            { q: 'When changing chords, fingers should…', options: ['Lift high off the strings', 'Hover just above and move together'], answer: 1, explain: 'Small, together movements are fastest.' },
          ],
        },
        {
          id: 'guitar-strum',
          title: 'Strumming Patterns',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Count and keep moving', body: `
              <p>Count each bar as <b>"1 & 2 & 3 & 4 &"</b>. Strum <b>down ↓</b> on the numbers and <b>up ↑</b> on the "&".</p>
              <p>Keep your hand moving down-up like a pendulum the whole time — even when you skip a strum. A <b>–</b> in a pattern means your hand moves but misses the strings. That keeps perfect time.</p>` },
            { type: 'strum', title: 'Pattern 1: all downs', chord: 'Em', pattern: 'D-D-D-D-', bpm: 70 },
            { type: 'strum', title: 'Pattern 2: add the up-strums', chord: 'Em', pattern: 'D-DUD-DU', bpm: 70 },
            { type: 'strum', title: 'Pattern 3: the classic', label: 'D – D U – U D U. This one strum fits thousands of songs.', chord: 'Em', chords: ['Em', 'Am', 'E', 'A', 'D'], pattern: 'D-DU-UDU', bpm: 70 },
          ],
          quiz: [
            { q: 'In the pattern D-DU-UDU, what does "–" mean?', options: ['Stop moving', 'Move the hand but miss the strings', 'Strum twice'], answer: 1, explain: 'The hand keeps moving to stay in time.' },
            { q: 'Up-strums usually fall on…', options: ['The numbers (1, 2, 3, 4)', 'The "&"s'], answer: 1, explain: 'Down on the beat, up on the "&".' },
          ],
        },
        {
          id: 'guitar-g-c',
          title: 'G & C',
          minutes: 15,
          steps: [
            { type: 'chords', title: 'Two essential chords', chords: ['G', 'C'] },
            { type: 'progression', title: 'G – C', chords: ['G', 'C'], pattern: 'D-DU-UDU', bpm: 70 },
          ],
          quiz: [
            { q: 'In C major, which open strings must ring clearly?', options: ['G and high e', 'Low E and A'], answer: 0, explain: 'Arch your fingers so the open G and high e ring.' },
            { q: 'How many strings do you strum for G?', options: ['Four', 'Five', 'Six'], answer: 2, explain: 'G uses all six strings.' },
          ],
        },
        {
          id: 'guitar-songs',
          title: 'Your First Songs',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Four chords, thousands of songs', body: `
              <p>A huge number of songs — pop, rock, Bollywood, Bengali — use the same few chord progressions. With <b>G, C, D, Em</b> you can play along with many of them.</p>
              <ul>
                <li><b>G – D – Em – C</b> (the "I–V–vi–IV" progression)</li>
                <li><b>G – Em – C – D</b> (the classic ballad progression)</li>
                <li><b>Em – C – G – D</b> (a moodier version)</li>
              </ul>
              <p>Search for "G D Em C songs" and play along!</p>` },
            { type: 'progression', title: 'G – D – Em – C', chords: ['G', 'D', 'Em', 'C'], pattern: 'D-DU-UDU', bpm: 72 },
            { type: 'progression', title: 'G – Em – C – D', chords: ['G', 'Em', 'C', 'D'], pattern: 'D-DU-UDU', bpm: 72 },
            { type: 'progression', title: 'Em – C – G – D', chords: ['Em', 'C', 'G', 'D'], pattern: 'D-DUD-DU', bpm: 72 },
            { type: 'timer', minutes: 10, tasks: [
              'Each progression at a slow tempo',
              'Play along with a song you love',
              'Sing the melody while you strum',
            ] },
          ],
          quiz: [
            { q: 'Which chords make the famous I–V–vi–IV progression in G?', options: ['G D Em C', 'A D E A', 'Am Dm E Am'], answer: 0, explain: 'G (I), D (V), Em (vi), C (IV).' },
          ],
        },
      ],
    },
    {
      title: 'Level 3 · Growing as a Player',
      lessons: [
        {
          id: 'guitar-dm-f',
          title: 'Dm & the Easy F',
          minutes: 15,
          steps: [
            { type: 'chords', title: 'Two new chords', chords: ['Dm', 'Fsmall'] },
            { type: 'tip', body: `<p>The easy F uses a <b>mini barre</b>: your index finger lies flat across the top two strings at the 1st fret. Press with the side of the finger, near the fret wire. It's your first step towards full barre chords.</p>` },
            { type: 'progression', title: 'C – Am – F – G', chords: ['C', 'Am', 'Fsmall', 'G'], pattern: 'D-DU-UDU', bpm: 70 },
            { type: 'progression', title: 'Am – Dm – E – Am', chords: ['Am', 'Dm', 'E', 'Am'], pattern: 'D-DU-UDU', bpm: 70 },
          ],
          quiz: [
            { q: 'What is a "mini barre"?', options: ['One finger pressing two strings at once', 'A capo', 'A very short strum'], answer: 0, explain: 'The index finger flattens across two strings.' },
          ],
        },
        {
          id: 'guitar-blues',
          title: 'The 12-Bar Blues',
          minutes: 15,
          steps: [
            { type: 'text', title: 'The most famous form in popular music', body: `
              <p>The 12-bar blues uses three chords — in the key of A they are <b>A7, D7 and E7</b> — in a fixed order:</p>
              <p class="big-line">A7 A7 A7 A7 | D7 D7 A7 A7 | E7 D7 A7 E7</p>
              <p>Rock 'n' roll, jazz and countless songs are built on it.</p>` },
            { type: 'chords', title: 'Seventh chords', chords: ['A7', 'D7', 'E7'] },
            { type: 'progression', title: '12-bar blues in A', chords: ['A7', 'A7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'E7'], pattern: 'D-DUD-DU', bpm: 90 },
          ],
          quiz: [
            { q: 'How many bars are in one blues cycle?', options: ['8', '12', '16'], answer: 1, explain: 'Twelve bars, then it repeats.' },
            { q: 'Which three chords make a blues in A?', options: ['A7 D7 E7', 'A D G', 'Am Dm Em'], answer: 0, explain: 'The I, IV and V chords: A7, D7, E7.' },
          ],
        },
        {
          id: 'guitar-power',
          title: 'Power Chords',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Two notes, big sound', body: `
              <p>A <b>power chord</b> is just the root note and the note five steps above it (plus the octave). It is written with a <b>5</b>, like <b>G5</b>. Neither major nor minor, power chords sound huge — the backbone of rock music.</p>
              <p>The best part: the shape is <b>movable</b>. Put your index finger on any fret of the 6th string and that fret names the chord.</p>` },
            { type: 'chords', title: 'Power chord shapes', chords: ['E5', 'A5', 'G5', 'C5'] },
            { type: 'progression', title: 'Rock progression', chords: ['E5', 'G5', 'A5', 'C5'], pattern: 'D-D-D-DD', bpm: 100 },
            { type: 'tab', title: 'Power chord riff', notes: '6:0+5:2 6:0+5:2 6:3+5:5 - 6:5+5:7 - 6:3+5:5 6:0+5:2', bpm: 100 },
          ],
          quiz: [
            { q: 'A power chord contains…', options: ['The root and the fifth', 'Every string open', 'Only the third'], answer: 0, explain: 'Root + fifth (and often the octave).' },
            { q: 'If your index finger is on the 3rd fret of the 6th string, which power chord is it?', options: ['E5', 'G5', 'A5'], answer: 1, explain: 'The 3rd fret of the low E string is G.' },
          ],
        },
        {
          id: 'guitar-pentatonic',
          title: 'Minor Pentatonic: Your First Scale',
          minutes: 15,
          steps: [
            { type: 'text', title: 'The soloist\'s scale', body: `
              <p>The <b>minor pentatonic</b> scale has five notes. In A, they are <b>A C D E G</b>. It is the scale behind most rock and blues solos — and, interestingly, it sounds close to many folk melodies around the world.</p>
              <p>Play "box 1" at the 5th fret: index finger on fret 5, ring finger on fret 7, little finger on fret 8.</p>` },
            { type: 'tab', title: 'A minor pentatonic — up', notes: '6:5 6:8 5:5 5:7 4:5 4:7 3:5 3:7 2:5 2:8 1:5 1:8', bpm: 70 },
            { type: 'tab', title: 'A minor pentatonic — down', notes: '1:8 1:5 2:8 2:5 3:7 3:5 4:7 4:5 5:7 5:5 6:8 6:5', bpm: 70 },
            { type: 'tip', body: `<p>Improvise! Put the 12-bar blues from the previous lesson on loop (or Am – G – F – G) and play any notes from this box. Start with just two or three notes and make little phrases.</p>` },
          ],
          quiz: [
            { q: 'How many notes are in a pentatonic scale?', options: ['5', '7', '12'], answer: 0, explain: '"Penta" means five.' },
            { q: 'A minor pentatonic box 1 starts on which fret?', options: ['3rd', '5th', '7th'], answer: 1, explain: 'The 5th fret of the low E string is A.' },
          ],
        },
        {
          id: 'guitar-barre',
          title: 'Barre Chords & Moving Shapes',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The full barre', body: `
              <ul>
                <li>Lay your index finger flat across <b>all six strings</b> right behind the fret.</li>
                <li>Roll it slightly onto its bony outer edge — the soft underside lets strings buzz.</li>
                <li>Thumb low behind the neck. Pull back gently with your arm instead of squeezing hard.</li>
                <li>Expect it to take weeks. Practise a minute or two each day.</li>
              </ul>` },
            { type: 'chords', title: 'Barre chords', chords: ['F', 'Bm', 'Gbarre'] },
            { type: 'text', title: 'One shape, every chord', body: `
              <p>The F shape is really an E chord with your index finger acting as a new nut. Slide it up: <b>fret 1 = F</b>, <b>fret 3 = G</b>, <b>fret 5 = A</b>, <b>fret 7 = B</b>. The Bm shape is Am moved up two frets — slide it for other minor chords.</p>` },
            { type: 'progression', title: 'F – C – G – Am', chords: ['F', 'C', 'G', 'Am'], pattern: 'D-DU-UDU', bpm: 70 },
          ],
          quiz: [
            { q: 'The F barre chord is the shape of which open chord?', options: ['E major', 'D major', 'C major'], answer: 0, explain: 'F is an E shape with the index finger as the nut.' },
            { q: 'The same barre shape at the 3rd fret gives…', options: ['F', 'G', 'A'], answer: 1, explain: 'Two frets above F is G.' },
          ],
        },
      ],
    },
  ],
};
