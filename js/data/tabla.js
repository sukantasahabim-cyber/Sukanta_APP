// Tabla course: from knowing the drums to a first kaida and tihai.

export const tabla = {
  id: 'tabla',
  name: 'Tabla',
  icon: '🥁',
  tagline: 'From your very first stroke to kaidas, relas and rare taals',
  levels: [
    {
      title: 'Level 1 · Foundations',
      lessons: [
        {
          id: 'tabla-meet',
          title: 'Meet the Tabla',
          minutes: 8,
          steps: [
            { type: 'text', title: 'Two drums, one instrument', body: `
              <p>The tabla is a <b>pair</b> of hand drums played together.</p>
              <ul>
                <li><b>Dayan</b> (also just called "tabla") — the smaller wooden drum, played with your stronger hand (usually the right). It is tuned to an exact pitch: the <i>Sa</i> of the music.</li>
                <li><b>Bayan</b> (also "dagga") — the larger metal or clay drum, played with the other hand. It makes the deep bass, and you can bend its pitch with the heel of your palm.</li>
              </ul>` },
            { type: 'text', title: 'Parts of the drum', body: `
              <ul>
                <li><b>Syahi</b> — the black circle. A hardened paste of iron filings that gives the tabla its bell-like ring.</li>
                <li><b>Maidan / Sur</b> — the open skin between the syahi and the edge.</li>
                <li><b>Kinar / Chanti</b> — the thin outer ring of skin at the very edge.</li>
                <li><b>Gajra</b> — the braided rim that holds the skin.</li>
                <li><b>Baddhi</b> — the leather straps that hold the tension.</li>
                <li><b>Gatta</b> — wooden blocks under the dayan's straps, moved up or down to tune it.</li>
              </ul>` },
            { type: 'bols', title: 'Hear what the tabla can do', bols: [
              { bol: 'Na', hand: 'Dayan', how: 'A bright ringing stroke on the dayan.' },
              { bol: 'Ge', hand: 'Bayan', how: 'The deep, booming bass of the bayan.' },
              { bol: 'Dha', hand: 'Both', how: 'Both drums together — the most important sound in tabla.' },
            ] },
            { type: 'tip', body: `<p><b>Care of your tabla:</b> keep the syahi dry (never wipe it with water), use a little talcum powder on your hands, keep the drums covered, and only tap the <i>gajra</i> with the tuning hammer — never the skin.</p>` },
          ],
          quiz: [
            { q: 'Which drum is played with your stronger hand?', options: ['Bayan', 'Dayan', 'Either one'], answer: 1,
              explain: 'The small wooden dayan is played with the stronger hand; it is tuned to Sa.' },
            { q: 'What is the black circle on the drum called?', options: ['Kinar', 'Syahi', 'Gajra'], answer: 1,
              explain: 'The syahi is the black paste that gives the tabla its ringing tone.' },
            { q: 'Which drum gives the deep bass sound?', options: ['Dayan', 'Bayan'], answer: 1,
              explain: 'The bayan is the bass drum; its pitch can be bent with the palm.' },
          ],
        },
        {
          id: 'tabla-posture',
          title: 'Posture & Hand Position',
          minutes: 10,
          steps: [
            { type: 'text', title: 'Sitting', body: `
              <ol>
                <li>Sit cross-legged on the floor (sukhasana) on a firm cushion or mat. A chair with a tabla stand also works.</li>
                <li>Keep your back straight and shoulders relaxed — not hunched over the drums.</li>
                <li>Place the dayan in front of your right knee and the bayan in front of your left (reverse if left-handed).</li>
                <li>Tilt the dayan slightly away from you so its face is easy to reach. Rest the bayan on its ring, tilted a little towards the dayan.</li>
              </ol>` },
            { type: 'text', title: 'Hands', body: `
              <ul>
                <li>Tabla strokes come from the <b>wrist and fingers</b>, not from the shoulder or elbow.</li>
                <li>Keep fingers relaxed and slightly curved, and your nails short.</li>
                <li>The right forearm rests lightly so the hand hovers over the dayan, wrist near the edge.</li>
                <li>The heel of the left palm rests on the bayan's skin at the edge nearest you.</li>
              </ul>` },
            { type: 'timer', title: 'Relaxation drill', minutes: 3, tasks: [
              'Shake out both hands loosely for 30 seconds',
              'Let each finger drop onto your knee like a raindrop: index, middle, ring',
              'Tap index fingers on your thighs, slowly then faster — stay relaxed',
              'Check: shoulders down, breathing easy',
            ] },
          ],
          quiz: [
            { q: 'Where should the power of a stroke mainly come from?', options: ['The shoulder', 'The wrist and fingers', 'The elbow'], answer: 1,
              explain: 'Relaxed wrist and finger movement gives a clear sound without tiring you.' },
            { q: 'What length should your nails be?', options: ['Long, for a sharper sound', 'Short'], answer: 1,
              explain: 'Long nails click on the skin and can damage the syahi.' },
          ],
        },
        {
          id: 'tabla-na',
          title: 'Your First Bol: Na',
          minutes: 10,
          steps: [
            { type: 'text', title: 'Bols — the language of tabla', body: `
              <p>Every tabla stroke has a spoken syllable called a <b>bol</b>. Tabla players <i>speak</i> their bols as well as play them — this is called <b>padhant</b>. Always say the bol out loud while practising.</p>
              <p>Our first bol is <b>Na</b> (also called <b>Ta</b> — in most styles they are the same stroke).</p>` },
            { type: 'bols', bols: [
              { bol: 'Na', hand: 'Dayan · index finger', how: 'Rest the ring finger lightly on the inner edge of the syahi. Flick the tip of the index finger onto the kinar (the outer rim) and lift it straight away. The skin rings like a bell.' },
            ] },
            { type: 'text', title: 'Step by step', body: `
              <ol>
                <li>Place the ring finger so it just touches the edge of the syahi.</li>
                <li>Raise your index finger slightly.</li>
                <li>Flick it down onto the kinar and let it bounce off immediately.</li>
                <li>Listen for a clear "naaa" that rings on.</li>
              </ol>
              <p><b>Common mistakes:</b> pressing the ring finger too hard (dead sound), leaving the index finger on the skin (muffled), hitting the syahi instead of the rim.</p>` },
            { type: 'sequence', title: 'Play along', label: 'Play Na on every beat and say "Na" aloud.', bols: 'Na Na Na Na', bpm: 60 },
            { type: 'timer', title: 'Practice', minutes: 5, tasks: [
              'Na at 60 BPM for two minutes',
              'Say the bol aloud with every stroke',
              'Try 80 BPM only if every stroke still rings clearly',
            ] },
          ],
          quiz: [
            { q: 'Where does the index finger strike for Na?', options: ['Centre of the syahi', 'The kinar (outer rim)', 'The bayan'], answer: 1,
              explain: 'Na is a ringing stroke on the kinar.' },
            { q: 'What does the ring finger do during Na?', options: ['Rests lightly on the syahi edge', 'Strikes the centre', 'Stays in the air'], answer: 0,
              explain: 'The ring finger lightly damps the syahi so the rim rings with a clear pitch.' },
            { q: 'What is "padhant"?', options: ['Tuning the tabla', 'Speaking the bols aloud', 'A fast taal'], answer: 1,
              explain: 'Padhant means reciting the bols; it trains your rhythm and memory.' },
          ],
        },
        {
          id: 'tabla-tin-tu-ti',
          title: 'Tin, Tu & Ti',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Open and closed strokes', body: `
              <p>Tabla strokes are either <b>open</b> (khula — the skin rings) or <b>closed</b> (band — the skin is damped). Learning to tell them apart is the key to a clean sound.</p>` },
            { type: 'bols', bols: [
              { bol: 'Tin', hand: 'Dayan · open', how: 'Keep the ring finger resting on the syahi edge, as for Na. Strike the sur — the open skin between syahi and rim — with the index finger and bounce off. Softer and rounder than Na.' },
              { bol: 'Tu', hand: 'Dayan · open', how: 'Strike the syahi near its centre with the flat of the index finger and lift at once. No other finger touches the skin. A deep, singing tone.' },
              { bol: 'Ti', hand: 'Dayan · closed', how: 'Strike the centre of the syahi with the middle and ring fingers together and leave them pressed on the skin. A short, dry sound.' },
            ] },
            { type: 'sequence', title: 'Na and Tin', label: 'Hear the difference between the rim (Na) and the sur (Tin).', bols: 'Na Tin Na Tin', bpm: 60 },
            { type: 'sequence', title: 'Tu and Na', bols: 'Tu Na Tu Na', bpm: 60 },
            { type: 'sequence', title: 'Ti with Na', label: 'Closed then open: keep Ti short and dry.', bols: 'Ti Ti Na -', bpm: 60 },
            { type: 'ear', title: 'Ear training: which stroke?', kind: 'bol', options: ['Na', 'Tu', 'Ti'] },
          ],
          quiz: [
            { q: 'Which of these is a closed (damped) stroke?', options: ['Tu', 'Ti', 'Tin'], answer: 1,
              explain: 'For Ti the fingers stay on the syahi, so the sound stops at once.' },
            { q: 'Where is Tin played?', options: ['On the sur, between syahi and rim', 'On the kinar', 'On the bayan'], answer: 0,
              explain: 'Tin is played on the sur while the ring finger rests on the syahi.' },
          ],
        },
        {
          id: 'tabla-ge-ke',
          title: 'The Bayan: Ge & Ke',
          minutes: 12,
          steps: [
            { type: 'bols', title: 'Two bayan strokes', bols: [
              { bol: 'Ge', hand: 'Bayan · open', how: 'Rest the heel of your palm on the bayan near the edge closest to you. With middle and index fingers together, strike the maidan just above the syahi and lift. The bass booms. Slide the heel forward while it rings to make the pitch rise.' },
              { bol: 'Ke', hand: 'Bayan · closed', how: 'Lay your flat palm and fingers onto the bayan with a light slap and keep them down. A short, dry sound with no ring.' },
            ] },
            { type: 'tip', body: `<p>The rising "woooom" of Ge is called <b>gamak</b> or <b>meend</b>. Push the heel of your hand forward slowly after the stroke and listen to the pitch glide up.</p>` },
            { type: 'sequence', title: 'Ge and Ke', bols: 'Ge Ge Ke -', bpm: 60 },
            { type: 'sequence', title: 'Alternate', bols: 'Ge Ke Ge Ke', bpm: 70 },
            { type: 'ear', title: 'Ear training: Ge or Ke?', kind: 'bol', options: ['Ge', 'Ke'] },
          ],
          quiz: [
            { q: 'Which bayan stroke rings?', options: ['Ge', 'Ke'], answer: 0, explain: 'Ge is open; Ke is a closed slap.' },
            { q: 'How do you raise the pitch of Ge while it rings?', options: ['Hit harder', 'Push the heel of the palm forward', 'Lift the whole hand'], answer: 1,
              explain: 'Pressure from the heel of the palm stretches the skin and raises the pitch.' },
          ],
        },
        {
          id: 'tabla-dha-dhin',
          title: 'Both Hands: Dha & Dhin',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Combined bols', body: `
              <p>Combined bols are two strokes played at <b>exactly the same moment</b>, one on each drum:</p>
              <ul>
                <li><b>Dha</b> = Na (dayan) + Ge (bayan)</li>
                <li><b>Dhin</b> = Tin (dayan) + Ge (bayan)</li>
              </ul>
              <p>If you hear two sounds ("ta-dum") instead of one, one hand is early. Go slowly until they land together.</p>` },
            { type: 'bols', bols: [
              { bol: 'Ta', hand: 'Dayan only', how: 'Same as Na.' },
              { bol: 'Dha', hand: 'Both', how: 'Na + Ge together.' },
              { bol: 'Tin', hand: 'Dayan only', how: 'Tin on the sur.' },
              { bol: 'Dhin', hand: 'Both', how: 'Tin + Ge together.' },
            ] },
            { type: 'sequence', title: 'Dha on every beat', bols: 'Dha Dha Dha Dha', bpm: 60 },
            { type: 'sequence', title: 'Dha Dhin Dhin Dha', label: 'This little phrase is the heart of Teentaal.', bols: 'Dha Dhin Dhin Dha', bpm: 60 },
            { type: 'tip', body: `<p>The <b>"h"</b> in Dha and Dhin tells you the bayan is ringing. Take the bayan away and Dha becomes Ta, Dhin becomes Tin. This is the secret of <i>khali</i>, which you will meet in the next level.</p>` },
            { type: 'timer', minutes: 5, tasks: [
              'Dha Dha Dha Dha — both hands exactly together',
              'Dha Dhin Dhin Dha, speaking the bols',
              'Alternate Dha and Ta to feel the bayan come and go',
            ] },
            { type: 'ear', title: 'Ear training: is the bayan ringing?', kind: 'bol', options: ['Dha', 'Ta', 'Ge'] },
          ],
          quiz: [
            { q: 'Dha is made of…', options: ['Na + Ge', 'Tin + Ke', 'Na + Ke'], answer: 0, explain: 'Dha = Na on the dayan + Ge on the bayan.' },
            { q: 'Dhin is made of…', options: ['Tu + Ke', 'Tin + Ge', 'Ti + Ge'], answer: 1, explain: 'Dhin = Tin + Ge.' },
            { q: 'Remove the bayan from Dha and you get…', options: ['Ge', 'Ta', 'Dhin'], answer: 1, explain: 'Without the bayan, Dha becomes Ta (Na).' },
          ],
        },
      ],
    },
    {
      title: 'Level 2 · Rhythm & Taal',
      lessons: [
        {
          id: 'tabla-taal-basics',
          title: 'What is a Taal?',
          minutes: 12,
          steps: [
            { type: 'text', title: 'The words of rhythm', body: `
              <ul>
                <li><b>Taal</b> — a repeating rhythmic cycle.</li>
                <li><b>Matra</b> — one beat of the cycle.</li>
                <li><b>Vibhag</b> — a section of the cycle (a group of matras).</li>
                <li><b>Sam</b> — the first beat, marked <b>X</b>. The most important beat: music comes home here.</li>
                <li><b>Taali</b> — a clap that marks a stressed vibhag (numbered 2, 3…).</li>
                <li><b>Khali</b> — "empty", marked <b>0</b>: a wave of the hand instead of a clap. On tabla, the bayan goes quiet in this vibhag.</li>
                <li><b>Theka</b> — the standard bol pattern that identifies a taal.</li>
                <li><b>Avartan</b> — one complete cycle.</li>
                <li><b>Laya</b> — tempo: vilambit (slow), madhya (medium), drut (fast).</li>
              </ul>` },
            { type: 'text', title: 'Count Teentaal with your hands', body: `
              <p>Teentaal has 16 matras in 4 vibhags of 4: <b>X 2 0 3</b>.</p>
              <ol>
                <li>Beat 1: <b>clap</b> (sam). Beats 2–4: tap fingers on your palm.</li>
                <li>Beat 5: <b>clap</b>. Beats 6–8: tap.</li>
                <li>Beat 9: <b>wave</b> (khali). Beats 10–12: tap.</li>
                <li>Beat 13: <b>clap</b>. Beats 14–16: tap. Then back to sam!</li>
              </ol>` },
            { type: 'theka', title: 'Hand counting', taal: 'teentaal', bpm: 70, mode: 'hands' },
          ],
          quiz: [
            { q: 'What is sam?', options: ['The first beat of the cycle', 'A fast tempo', 'The last beat'], answer: 0, explain: 'Sam (X) is beat 1, where the cycle begins and resolves.' },
            { q: 'How is khali shown with the hands?', options: ['A clap', 'A wave', 'A finger tap'], answer: 1, explain: 'Khali (0) is shown with a wave of the hand.' },
            { q: 'How many matras are there in Teentaal?', options: ['8', '12', '16'], answer: 2, explain: 'Teentaal = 16 matras, 4 + 4 + 4 + 4.' },
          ],
        },
        {
          id: 'tabla-keherwa',
          title: 'Keherwa — 8 Beats',
          minutes: 15,
          steps: [
            { type: 'text', title: 'The song taal', body: `
              <p><b>Keherwa</b> has 8 matras in two vibhags of 4 (<b>X 0</b>). It is the taal you will hear in most bhajans, folk songs, ghazals and film songs.</p>
              <p><b>Theka:</b> Dha Ge Na Ti | Na Ka Dhi Na</p>
              <p>Here <b>Ti</b> is the closed dayan stroke, <b>Ka</b> is the flat bayan slap (Ke) and <b>Dhi</b> is the same as Dhin.</p>` },
            { type: 'theka', title: 'Keherwa theka', taal: 'keherwa', bpm: 70 },
            { type: 'timer', minutes: 10, tasks: [
              'Speak the theka while counting with your hands — 4 cycles',
              'Play it at 60 BPM',
              'Play it at 80 BPM',
              'Play it at 100 BPM, staying relaxed',
            ] },
          ],
          quiz: [
            { q: 'How many matras does Keherwa have?', options: ['6', '8', '16'], answer: 1, explain: 'Keherwa has 8 matras.' },
            { q: 'On which beat is khali in Keherwa?', options: ['Beat 3', 'Beat 5', 'Beat 7'], answer: 1, explain: 'The second vibhag (beats 5–8) is khali.' },
          ],
        },
        {
          id: 'tabla-dadra',
          title: 'Dadra — 6 Beats',
          minutes: 12,
          steps: [
            { type: 'text', title: 'A rhythm in threes', body: `
              <p><b>Dadra</b> has 6 matras in two vibhags of 3 (<b>X 0</b>). It has a lilting, swinging feel — perfect for light classical songs, bhajans and folk tunes.</p>
              <p><b>Theka:</b> Dha Dhi Na | Dha Ti Na</p>` },
            { type: 'theka', title: 'Dadra in hand counting', taal: 'dadra', bpm: 80, mode: 'hands' },
            { type: 'theka', title: 'Dadra theka', taal: 'dadra', bpm: 80 },
            { type: 'ear', title: 'Ear training: Keherwa or Dadra?', kind: 'taal', options: ['keherwa', 'dadra'], rounds: 4 },
          ],
          quiz: [
            { q: 'How are Dadra\'s 6 beats divided?', options: ['3 + 3', '2 + 4', '4 + 2'], answer: 0, explain: 'Dadra = 3 + 3, marked X 0.' },
            { q: 'Which is the Dadra theka?', options: ['Dha Ge Na Ti Na Ka Dhi Na', 'Dha Dhi Na Dha Ti Na', 'Tin Tin Na Dhi Na Dhi Na'], answer: 1, explain: 'Dha Dhi Na | Dha Ti Na.' },
          ],
        },
        {
          id: 'tabla-teentaal',
          title: 'Teentaal — 16 Beats',
          minutes: 15,
          steps: [
            { type: 'text', title: 'The king of taals', body: `
              <p><b>Teentaal</b> ("three claps") is the most important taal in Hindustani classical music.</p>
              <p><b>Theka:</b><br>Dha Dhin Dhin Dha | Dha Dhin Dhin Dha | Dha Tin Tin Ta | Ta Dhin Dhin Dha</p>
              <p>Look at the third vibhag: Dhin becomes <b>Tin</b> and Dha becomes <b>Ta</b>. The bayan is silent — that is <b>khali</b>. On beat 13 the bayan returns with Dhin Dhin Dha, leading you back to sam.</p>` },
            { type: 'theka', title: 'Teentaal theka', taal: 'teentaal', bpm: 70 },
            { type: 'timer', minutes: 10, tasks: [
              'Speak the theka with hand counting',
              'Play two cycles slowly, then rest',
              'Feel the bayan disappear in the khali vibhag',
              'Land firmly on sam each cycle',
            ] },
          ],
          quiz: [
            { q: 'Which vibhag of Teentaal is khali?', options: ['First (beats 1–4)', 'Third (beats 9–12)', 'Fourth (beats 13–16)'], answer: 1, explain: 'Beats 9–12 (Dha Tin Tin Ta) are khali.' },
            { q: 'What are the Teentaal markings?', options: ['X 2 0 3', 'X 0', '0 1 2'], answer: 0, explain: 'X 2 0 3 — three claps and one wave.' },
          ],
        },
        {
          id: 'tabla-rupak-jhaptaal',
          title: 'Rupak & Jhaptaal',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Rupak — 7 beats', body: `
              <p><b>Rupak</b> has 7 matras: 3 + 2 + 2. It is unusual: its <b>sam is also khali</b>, so the cycle starts with a wave, not a clap.</p>
              <p><b>Theka:</b> Tin Tin Na | Dhi Na | Dhi Na</p>` },
            { type: 'theka', title: 'Rupak', taal: 'rupak', bpm: 80 },
            { type: 'text', title: 'Jhaptaal — 10 beats', body: `
              <p><b>Jhaptaal</b> has 10 matras: 2 + 3 + 2 + 3, marked X 2 0 3.</p>
              <p><b>Theka:</b> Dhi Na | Dhi Dhi Na | Ti Na | Dhi Dhi Na</p>` },
            { type: 'theka', title: 'Jhaptaal', taal: 'jhaptaal', bpm: 80 },
            { type: 'ear', title: 'Ear training: name the taal', kind: 'taal', options: ['keherwa', 'dadra', 'rupak', 'jhaptaal'], rounds: 4 },
          ],
          quiz: [
            { q: 'What is special about Rupak?', options: ['It has no khali', 'Its sam is khali', 'It has 16 beats'], answer: 1, explain: 'Rupak begins on khali, shown with a wave.' },
            { q: 'How is Jhaptaal divided?', options: ['2 + 3 + 2 + 3', '4 + 4 + 2', '5 + 5'], answer: 0, explain: 'Jhaptaal = 2 + 3 + 2 + 3 = 10.' },
          ],
        },
      ],
    },
    {
      title: 'Level 3 · Building Skill',
      lessons: [
        {
          id: 'tabla-laya',
          title: 'Laya: Thah, Dugun, Chaugun',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Playing faster without rushing', body: `
              <p><b>Layakari</b> is playing more bols in the same beat while the beat itself stays steady:</p>
              <ul>
                <li><b>Thah</b> — one bol per beat (1×)</li>
                <li><b>Dugun</b> — two bols per beat (2×)</li>
                <li><b>Chaugun</b> — four bols per beat (4×)</li>
              </ul>
              <p>Keep the click steady and let only your bols change speed.</p>` },
            { type: 'sequence', title: 'Change the speed', label: 'Switch between thah, dugun and chaugun while the click stays the same.', bols: 'Dha Dhin Dhin Dha', bpm: 60, speeds: [1, 2, 4] },
            { type: 'timer', minutes: 8, tasks: [
              'Clap the beat and speak the bols in thah',
              'Keep clapping, speak in dugun',
              'Keep clapping, speak in chaugun',
              'Now play each speed on the tabla',
            ] },
          ],
          quiz: [
            { q: 'Dugun means…', options: ['Half speed', 'Two bols per beat', 'Four bols per beat'], answer: 1, explain: 'Dugun = 2 bols per beat.' },
            { q: 'In chaugun, the beat itself…', options: ['Gets four times faster', 'Stays the same', 'Stops'], answer: 1, explain: 'Only the density of bols changes; the beat stays steady.' },
          ],
        },
        {
          id: 'tabla-tirakita',
          title: 'TiRaKiTa & Ektaal',
          minutes: 15,
          steps: [
            { type: 'bols', title: 'Four quick strokes', bols: [
              { bol: 'Ti', hand: 'Dayan · closed', how: 'Middle and ring fingers press onto the syahi centre.' },
              { bol: 'Ra', hand: 'Dayan · closed', how: 'Index finger presses onto the syahi centre.' },
              { bol: 'Ki', hand: 'Bayan · closed', how: 'Flat left hand on the bayan (like Ke).' },
              { bol: 'Ta', hand: 'Dayan · open', how: 'Na on the rim.' },
            ] },
            { type: 'sequence', title: 'Slow first', label: 'Start in thah. Only move to dugun and chaugun when every stroke is even.', bols: 'Ti Ra Ki Ta', bpm: 60, speeds: [1, 2, 4] },
            { type: 'text', title: 'Ektaal — 12 beats', body: `
              <p>TiRaKiTa appears in <b>Ektaal</b> (12 matras, six vibhags of 2: X 0 2 0 3 4).</p>
              <p><b>Theka:</b> Dhin Dhin | DhaGe TiRaKiTa | Tu Na | Kat Ta | DhaGe TiRaKiTa | Dhi Na</p>
              <p><b>Kat</b> is a firm Ke on the bayan.</p>` },
            { type: 'theka', title: 'Ektaal', taal: 'ektaal', bpm: 60 },
            { type: 'ear', title: 'Ear training: open, closed or bayan?', kind: 'bol', options: ['Na', 'Ti', 'Ke', 'Dha'] },
          ],
          quiz: [
            { q: 'In TiRaKiTa, which stroke is on the bayan?', options: ['Ti', 'Ra', 'Ki'], answer: 2, explain: 'Ki is the closed bayan stroke.' },
            { q: 'How many matras does Ektaal have?', options: ['10', '12', '14'], answer: 1, explain: 'Ektaal has 12 matras.' },
          ],
        },
        {
          id: 'tabla-kaida',
          title: 'Your First Kaida',
          minutes: 20,
          steps: [
            { type: 'text', title: 'What is a kaida?', body: `
              <p>A <b>kaida</b> ("rule") is a theme that you develop with variations called <b>paltas</b>. Its rules:</p>
              <ul>
                <li>Variations use only the bols of the theme.</li>
                <li>The second half mirrors the first in <b>khali</b> form (bayan removed), returning to the bayan just before sam.</li>
                <li>It finishes with a <b>tihai</b>.</li>
              </ul>` },
            { type: 'sequence', title: 'Theme', label: 'Bhari (with bayan): Dha Dha Ti Ta | Dha Dha Tin Na · Khali: Ta Ta Ti Ta | Dha Dha Dhin Na', bols: 'Dha Dha Ti Ta Dha Dha Tin Na Ta Ta Ti Ta Dha Dha Dhin Na', bpm: 80 },
            { type: 'sequence', title: 'Palta 1', label: 'Repeat the opening phrase, then resolve.', bols: 'Dha Dha Ti Ta Dha Dha Ti Ta Dha Dha Ti Ta Dha Dha Tin Na Ta Ta Ti Ta Ta Ta Ti Ta Dha Dha Ti Ta Dha Dha Dhin Na', bpm: 80 },
            { type: 'timer', minutes: 10, tasks: [
              'Speak the theme with hand counting (Teentaal)',
              'Play the theme in thah four times',
              'Play the theme in dugun',
              'Play Palta 1, then the theme again',
            ] },
          ],
          quiz: [
            { q: 'Kaida variations are called…', options: ['Paltas', 'Thekas', 'Matras'], answer: 0, explain: 'Paltas are the variations of a kaida.' },
            { q: 'The second half of a kaida is played in…', options: ['Khali form, without the bayan', 'Double speed', 'Silence'], answer: 0, explain: 'It mirrors the first half without bayan, returning to it before sam.' },
          ],
        },
        {
          id: 'tabla-tihai',
          title: 'Tihai: The Grand Finish',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Three times to sam', body: `
              <p>A <b>tihai</b> is a phrase played <b>three times</b> so that its very last stroke lands exactly on <b>sam</b>. It is how tabla players end a piece with a flourish.</p>
              <p>Our example in Teentaal: play the theka for beats 1–6, then from beat 7 play <b>Ti Ta Dha –</b> three times. The third Dha falls on the next sam.</p>
              <p>Beats 7–16: Ti Ta Dha – | Ti Ta Dha – | Ti Ta … <b>Dha!</b> (sam)</p>` },
            { type: 'sequence', title: 'Theka + tihai', label: 'Beats 1–6 theka, beats 7–16 tihai. The loop restarts on sam with the final Dha.', bols: 'Dha Dhin Dhin Dha Dha Dhin Ti Ta Dha - Ti Ta Dha - Ti Ta', bpm: 70 },
          ],
          quiz: [
            { q: 'How many times is a tihai phrase played?', options: ['Two', 'Three', 'Four'], answer: 1, explain: '"Tihai" comes from "teen" — three.' },
            { q: 'Where must the last stroke of a tihai land?', options: ['On khali', 'On sam', 'Anywhere'], answer: 1, explain: 'A tihai resolves on sam.' },
          ],
        },
        {
          id: 'tabla-accompany',
          title: 'Accompanying Songs & Daily Riyaz',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Playing with a singer', body: `
              <ul>
                <li><b>Follow</b> the singer's tempo — never pull it faster.</li>
                <li>The <b>theka is your home</b>. Keep it steady and simple.</li>
                <li>Add small fills (laggi) only at the end of lines, and land back on sam.</li>
                <li>Finish with a tihai.</li>
              </ul>
              <p><b>Which taal?</b> A song that feels like 1-2-3-4 → Keherwa. A swinging 1-2-3 feel → Dadra. A 7-beat feel → Rupak. Classical khayal → Teentaal or Ektaal.</p>` },
            { type: 'text', title: 'Your 30-minute riyaz', body: `
              <ol>
                <li>5 min — single strokes: Na, Tin, Tu, Ti, Ge, Ke</li>
                <li>10 min — theka practice (Keherwa, Dadra, Teentaal) with the tanpura or a lehra</li>
                <li>10 min — kaida in thah, dugun and chaugun</li>
                <li>5 min — padhant: speak everything you played</li>
              </ol>` },
            { type: 'theka', title: 'Practise with any taal', taal: 'keherwa', bpm: 80, choose: true },
            { type: 'timer', minutes: 30, tasks: [
              'Single strokes warm-up',
              'Theka practice',
              'Kaida in three speeds',
              'Padhant',
            ] },
          ],
          quiz: [
            { q: 'A song has a swinging 1-2-3, 1-2-3 feel. Which taal fits?', options: ['Teentaal', 'Dadra', 'Jhaptaal'], answer: 1, explain: 'Dadra (3 + 3) fits a 3-feel.' },
            { q: 'When accompanying, who sets the tempo?', options: ['The tabla player', 'The singer / main artist'], answer: 1, explain: 'Accompanists follow the main artist.' },
          ],
        },
      ],
    },
    {
      title: 'Level 4 · Kaidas & Relas',
      lessons: [
        {
          id: 'tabla-kaida-dhati',
          title: 'Kaida: Dha Ti Dha Ge',
          minutes: 20,
          steps: [
            { type: 'text', title: 'A classic Delhi kaida', body: `
              <p>This kaida comes from the <b>Delhi gharana</b>, the oldest school of tabla, known for crisp strokes played near the edge with two fingers.</p>
              <p>The theme fills one cycle of <b>Teentaal</b> with two bols in each beat (dugun):</p>
              <ul>
                <li><b>Bhari</b> (with bayan): Dha Ti Dha Ge · Na Dha Ti Na · Dha Ti Dha Ge · Tin Na Ke Na</li>
                <li><b>Khali</b> (bayan off): Ta Ti Ta Ke · Na Ta Ti Na · Dha Ti Dha Ge · Dhin Na Ge Na</li>
              </ul>
              <p>Notice how the khali half turns <b>Dha</b> into <b>Ta</b> and <b>Ge</b> into <b>Ke</b> — and how the bayan comes back for the last four beats, to lead you home to sam.</p>` },
            { type: 'sequence', title: 'Theme (one Teentaal cycle)', label: 'Two bols per beat. Listen for the bayan dropping out in the second half.', bols: 'Dha Ti Dha Ge Na Dha Ti Na Dha Ti Dha Ge Tin Na Ke Na Ta Ti Ta Ke Na Ta Ti Na Dha Ti Dha Ge Dhin Na Ge Na', bpm: 60, perBeat: 2, group: 4 },
            { type: 'sequence', title: 'Palta 1: repeat the opening', label: 'The first phrase is played three times before the theme continues. The whole palta takes two cycles.', bols: 'Dha Ti Dha Ge Na Dha Ti Na Dha Ti Dha Ge Na Dha Ti Na Dha Ti Dha Ge Na Dha Ti Na Dha Ti Dha Ge Tin Na Ke Na Ta Ti Ta Ke Na Ta Ti Na Ta Ti Ta Ke Na Ta Ti Na Dha Ti Dha Ge Na Dha Ti Na Dha Ti Dha Ge Dhin Na Ge Na', bpm: 60, perBeat: 2, group: 4 },
            { type: 'sequence', title: 'Palta 2: turn it around', label: 'Start from the middle of the phrase (Na Dha Ti Na) — a favourite way to build variations.', bols: 'Na Dha Ti Na Dha Ti Dha Ge Na Dha Ti Na Tin Na Ke Na Na Ta Ti Na Ta Ti Ta Ke Na Dha Ti Na Dhin Na Ge Na', bpm: 60, perBeat: 2, group: 4 },
            { type: 'sequence', title: 'Tihai to finish', label: '"Dha Ti Dha Ge Na Dha Ti Na Dha" three times, with a short rest between. The final Dha is the next sam.', bols: 'Dha Ti Dha Ge Na Dha Ti Na Dha - - - Dha Ti Dha Ge Na Dha Ti Na Dha - - - Dha Ti Dha Ge Na Dha Ti Na', bpm: 60, perBeat: 2, group: 4 },
            { type: 'timer', minutes: 10, tasks: [
              'Speak the theme with Teentaal hand counting (padhant)',
              'Play the theme slowly, four times without a break',
              'Theme → Palta 1 → theme → Palta 2',
              'Finish with the tihai, landing on sam',
            ] },
          ],
          quiz: [
            { q: 'Which gharana does this kaida come from?', options: ['Delhi', 'Banaras', 'Punjab'], answer: 0, explain: 'Dha Ti Dha Ge is a classic Delhi-gharana kaida.' },
            { q: 'In the khali half, Dha becomes…', options: ['Dhin', 'Ta', 'Ge'], answer: 1, explain: 'Without the bayan, Dha becomes Ta (and Ge becomes Ke).' },
            { q: 'Why does the bayan return in the last four beats?', options: ['To lead back to sam', 'Because the khali is over', 'It is optional'], answer: 0, explain: 'The bayan returning signals the way home to sam.' },
          ],
        },
        {
          id: 'tabla-kaida-tirakita',
          title: 'Kaida with TiRaKiTa',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Fast fingers, clear sound', body: `
              <p>This kaida is built on <b>TiRaKiTa</b> — four quick strokes that must sound even, like a single rolling word.</p>
              <ul>
                <li><b>Bhari:</b> Dha TiRaKiTa · Dha TiRaKiTa · Dha Ge Tin Na · Ke Na</li>
                <li><b>Khali:</b> Ta TiRaKiTa · Ta TiRaKiTa · Dha Ge Dhin Na · Ge Na</li>
              </ul>
              <p>Practise it slowly first. Speed comes from relaxed fingers, not from force.</p>` },
            { type: 'sequence', title: 'Theme', label: 'Start in thah. Move to dugun only when every Ti, Ra, Ki and Ta sounds equally loud.', bols: 'Dha Ti Ra Ki Ta Dha Ti Ra Ki Ta Dha Ge Tin Na Ke Na Ta Ti Ra Ki Ta Ta Ti Ra Ki Ta Dha Ge Dhin Na Ge Na', bpm: 60, speeds: [1, 2, 4], group: 4 },
            { type: 'sequence', title: 'Palta: double the TiRaKiTa', bols: 'Dha Ti Ra Ki Ta Ti Ra Ki Ta Dha Ti Ra Ki Ta Dha Ge Tin Na Ke Na Ta Ti Ra Ki Ta Ti Ra Ki Ta Ta Ti Ra Ki Ta Dha Ge Dhin Na Ge Na', bpm: 60, speeds: [1, 2, 4], group: 4 },
            { type: 'tip', body: '<p><b>Clean TiRaKiTa:</b> Ti (middle + ring fingers) and Ra (index) both close on the syahi of the dayan; Ki is a flat left hand on the bayan; Ta is a ringing Na. If one stroke is louder, slow down until they match.</p>' },
            { type: 'ear', title: 'Ear training: which stroke?', kind: 'bol', options: ['Ti', 'Ke', 'Na', 'Dha'], rounds: 8 },
          ],
          quiz: [
            { q: 'Where does real speed in TiRaKiTa come from?', options: ['Hitting harder', 'Relaxed, even fingers', 'Skipping strokes'], answer: 1, explain: 'Relaxed fingers and even volume make fast playing possible.' },
            { q: 'Which stroke of TiRaKiTa is on the bayan?', options: ['Ti', 'Ra', 'Ki'], answer: 2, explain: 'Ki is the closed flat-hand stroke on the bayan.' },
          ],
        },
        {
          id: 'tabla-rela',
          title: 'Rela: The Rolling Stream',
          minutes: 20,
          steps: [
            { type: 'text', title: 'What makes a rela?', body: `
              <p>A <b>rela</b> is a composition meant to be played <b>fast</b>, so that the strokes blur into a continuous, rolling sound — like a stream of water. Like a kaida, it has a theme, variations and khali, but its bols are chosen to flow easily at high speed.</p>
              <p>Our rela uses <b>Te Te</b>: two quick closed strokes on the dayan, played with alternating fingers.</p>
              <ul>
                <li><b>Bhari:</b> Dha Te Te · Dha Te Te · Dha Dha Te Te · Dha Ge Tin Na Ke Na</li>
                <li><b>Khali:</b> Ta Te Te · Ta Te Te · Ta Ta Te Te · Dha Ge Dhin Na Ge Na</li>
              </ul>` },
            { type: 'sequence', title: 'Rela theme', label: 'Four bols per beat when you are ready (chaugun). The full theme takes eight beats, so play it twice for one Teentaal cycle.', bols: 'Dha Te Te Dha Te Te Dha Dha Te Te Dha Ge Tin Na Ke Na Ta Te Te Ta Te Te Ta Ta Te Te Dha Ge Dhin Na Ge Na', bpm: 60, speeds: [1, 2, 4], group: 4 },
            { type: 'sequence', title: 'Variation', bols: 'Dha Te Te Dha Te Te Dha Te Te Dha Te Te Dha Ge Tin Na Ta Te Te Ta Te Te Ta Te Te Ta Te Te Dha Ge Dhin Na', bpm: 60, speeds: [1, 2, 4], group: 4 },
            { type: 'timer', minutes: 10, tasks: [
              'Te Te alone: alternate fingers, 2 minutes, slowly',
              'Rela theme in thah, then dugun',
              'Rela theme in chaugun — stay relaxed',
              'Theme and variation, back to back',
            ] },
          ],
          quiz: [
            { q: 'A rela is designed to be played…', options: ['Very slowly', 'Fast, as a rolling stream of sound', 'Only on the bayan'], answer: 1, explain: 'Rela bols are chosen to flow at high speed.' },
            { q: 'How is "Te Te" played?', options: ['With alternating fingers on the dayan', 'With both palms', 'On the bayan rim'], answer: 0, explain: 'Alternating fingers make fast Te Te possible.' },
          ],
        },
        {
          id: 'tabla-tukda-mukhda',
          title: 'Mukhda & Tukda',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Small compositions with a big finish', body: `
              <ul>
                <li><b>Mukhda</b> ("face") — a short phrase played just before sam, in place of the end of the theka. It decorates the arrival at sam.</li>
                <li><b>Tukda</b> ("piece") — a short composition, usually ending with a tihai, played between rounds of theka. It is a little showpiece.</li>
              </ul>
              <p>Both must land exactly on <b>sam</b>, so count carefully!</p>` },
            { type: 'sequence', title: 'Mukhda: theka for 12 beats, then a flourish', label: 'Each box is one beat. Beats 13–16 are replaced by "TiRaKiTa Dha – TiRaKiTa Dha – TiRaKiTa", and the next Dha falls on sam.', bols: 'Dha - - - Dhin - - - Dhin - - - Dha - - - Dha - - - Dhin - - - Dhin - - - Dha - - - Dha - - - Tin - - - Tin - - - Ta - - - Ti Ra Ki Ta Dha - Ti Ra Ki Ta Dha - Ti Ra Ki Ta', bpm: 60, perBeat: 4, group: 4 },
            { type: 'sequence', title: 'Tukda in Teentaal', label: 'Two bols per beat. Beats 1–8: theka in dugun. Beats 9–16: the tukda — "Ti Ra Ki Ta Ta Ka" then a tihai of "Dha Ti Dha", ending on the next sam.', bols: 'Dha Dhin Dhin Dha Dha Dhin Dhin Dha Dha Tin Tin Ta Ta Dhin Dhin Dha Ti Ra Ki Ta Ta Ka Dha Ti Dha - Dha Ti Dha - Dha Ti', bpm: 60, perBeat: 2, group: 4 },
            { type: 'theka', title: 'Play along: Teentaal', taal: 'teentaal', bpm: 70 },
          ],
          quiz: [
            { q: 'Where does a mukhda lead?', options: ['To khali', 'To sam', 'To silence'], answer: 1, explain: 'A mukhda decorates the arrival at sam.' },
            { q: 'A tukda usually ends with…', options: ['A tihai', 'A pause', 'A new taal'], answer: 0, explain: 'A tukda is a short piece that usually finishes with a tihai.' },
          ],
        },
      ],
    },
    {
      title: 'Level 5 · More Taals',
      lessons: [
        {
          id: 'tabla-deepchandi-dhamar',
          title: 'Deepchandi & Dhamar (14 beats)',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Two taals of 14 beats', body: `
              <p><b>Deepchandi</b> (also called Chanchar) has 14 matras: 3 + 4 + 3 + 4. It is used for <b>thumri, dadra, bhajans and Holi songs</b>, and has a lilting, swinging feel because of its gaps.</p>
              <p><b>Theka:</b> Dha Dhin – | Dha Dha Tin – | Ta Tin – | Dha Dha Dhin –</p>
              <p><b>Dhamar</b> also has 14 matras, but divided 5 + 2 + 3 + 4. It is the taal of <b>dhrupad-style Holi songs (dhamar)</b> and has a strong, majestic feel.</p>
              <p><b>Theka:</b> Ka Dhi Ta Dhi Ta | Dha – | Ga Ti Ta | Ti Ta Ta –</p>` },
            { type: 'theka', title: 'Deepchandi', taal: 'deepchandi', bpm: 90 },
            { type: 'theka', title: 'Dhamar', taal: 'dhamar', bpm: 80 },
            { type: 'ear', title: 'Ear training: name the taal', kind: 'taal', options: ['deepchandi', 'dhamar', 'rupak', 'keherwa'], rounds: 4 },
          ],
          quiz: [
            { q: 'How is Deepchandi divided?', options: ['3 + 4 + 3 + 4', '5 + 2 + 3 + 4', '4 + 4 + 4 + 2'], answer: 0, explain: 'Deepchandi = 3 + 4 + 3 + 4 = 14.' },
            { q: 'Dhamar is the taal of…', options: ['Film songs', 'Dhrupad-style Holi songs', 'Fast khayal'], answer: 1, explain: 'Dhamar accompanies dhamar compositions about Holi.' },
          ],
        },
        {
          id: 'tabla-tilwada-jhoomra',
          title: 'Tilwada & Jhoomra (slow khayal)',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Taals for slow, deep singing', body: `
              <p>In <b>vilambit</b> (very slow) khayal, each beat can last 3–5 seconds. These taals fill the long beats with rich bols.</p>
              <p><b>Tilwada</b> — 16 matras, 4 + 4 + 4 + 4, like Teentaal but heavier:</p>
              <p>Dha TiRaKiTa Dhin Dhin | Dha Dha Tin Tin | Ta TiRaKiTa Dhin Dhin | Dha Dha Dhin Dhin</p>
              <p><b>Jhoomra</b> — 14 matras, 3 + 4 + 3 + 4, a swaying ("jhoom") slow taal:</p>
              <p>Dhin –Dha TiRaKiTa | Dhin Dhin DhaGe TiRaKiTa | Tin –Ta TiRaKiTa | Dhin Dhin DhaGe TiRaKiTa</p>` },
            { type: 'theka', title: 'Tilwada', taal: 'tilwada', bpm: 50 },
            { type: 'theka', title: 'Jhoomra', taal: 'jhoomra', bpm: 45 },
            { type: 'tip', body: '<p><b>Counting slow taals:</b> at very slow tempos, quietly count the subdivisions ("1-and-2-and") so that you never lose your place between beats.</p>' },
          ],
          quiz: [
            { q: 'Tilwada and Jhoomra are mainly used for…', options: ['Vilambit (slow) khayal', 'Fast folk dances', 'Film songs'], answer: 0, explain: 'Both are slow taals for vilambit khayal.' },
            { q: 'How many matras does Jhoomra have?', options: ['12', '14', '16'], answer: 1, explain: 'Jhoomra has 14 matras: 3 + 4 + 3 + 4.' },
          ],
        },
        {
          id: 'tabla-laggi',
          title: 'Laggi for Bhajans & Folk',
          minutes: 15,
          steps: [
            { type: 'text', title: 'The fast, happy groove', body: `
              <p>In bhajans, kirtans, qawwali and folk music, the tabla player often switches from the theka to a <b>laggi</b> — a fast, bouncy variation of Keherwa (or Dadra) that lifts the energy at the end of a song.</p>
              <p>A laggi keeps the feel of the taal (bayan on the first half, off in the second), but packs in more strokes. Always come back to the theka smoothly.</p>` },
            { type: 'sequence', title: 'Keherwa theka', bols: 'Dha Ge Na Ti Na Ka Dhi Na', bpm: 80 },
            { type: 'sequence', title: 'A simple laggi (Keherwa)', label: 'Two bols per beat: one Keherwa cycle, bayan in the first half and lighter in the second.', bols: 'Dha Ge Na Dhi Na Ge Dhi Na Ta Ke Na Ti Na Ge Dhi Na', bpm: 80, perBeat: 2, group: 4 },
            { type: 'sequence', title: 'Dadra laggi', label: 'Two bols per beat, one Dadra cycle.', bols: 'Dha Ge Dhi Na Dhi Na Ta Ke Ti Na Dhi Na', bpm: 90, perBeat: 2, group: 6 },
          ],
          quiz: [
            { q: 'When is a laggi usually played?', options: ['At the start of a khayal', 'To lift the energy in bhajans and folk songs', 'Only in solos'], answer: 1, explain: 'Laggi brings energy, often near the end of a light song.' },
          ],
        },
      ],
    },
    {
      title: 'Level 6 · Performance',
      lessons: [
        {
          id: 'tabla-peshkar',
          title: 'Peshkar: Opening a Solo',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The graceful beginning', body: `
              <p>A tabla solo traditionally opens with a <b>peshkar</b> ("presentation"). It is slow, spacious and full of open, resonant strokes, and it shows the sound of the instrument before the fast compositions begin.</p>
              <p>Unlike a kaida, a peshkar is allowed to <b>improvise freely</b> with rhythm: bols are stretched, delayed and shifted, always returning to the theka feel.</p>
              <p>Here is a simple peshkar-style theme in Teentaal (two bols per beat):</p>
              <ul>
                <li><b>Bhari:</b> Dhin – Ka Dha · Dhin Dha Dha Dhin · Dha Dhin Dha Dhin · Dha Ge Tin Na</li>
                <li><b>Khali:</b> Tin – Ka Ta · Tin Ta Ta Tin · Dha Dhin Dha Dhin · Dha Ge Dhin Na</li>
              </ul>` },
            { type: 'sequence', title: 'Peshkar theme', label: 'Play it slowly and let every Dhin ring.', bols: 'Dhin - Ka Dha Dhin Dha Dha Dhin Dha Dhin Dha Dhin Dha Ge Tin Na Tin - Ka Ta Tin Ta Ta Tin Dha Dhin Dha Dhin Dha Ge Dhin Na', bpm: 50, perBeat: 2, group: 4 },
            { type: 'tip', body: '<p><b>Resonance:</b> in a peshkar, lift your fingers off the dayan immediately after Dhin and Tin so the drum rings freely, and keep the bayan Ge round and open.</p>' },
          ],
          quiz: [
            { q: 'Where does a peshkar come in a tabla solo?', options: ['At the very end', 'At the beginning', 'Only in accompaniment'], answer: 1, explain: 'The peshkar traditionally opens the solo.' },
            { q: 'Compared with a kaida, a peshkar…', options: ['Allows more free rhythmic improvisation', 'Must be played very fast', 'Has no khali'], answer: 0, explain: 'A peshkar is spacious and freely improvised.' },
          ],
        },
        {
          id: 'tabla-tigun',
          title: 'Tigun: Three in a Beat',
          minutes: 15,
          steps: [
            { type: 'text', title: 'A new kind of speed', body: `
              <p>You know thah (1×), dugun (2×) and chaugun (4×). <b>Tigun</b> fits <b>three bols in every beat</b>. It feels rolling and triplet-like, and it is harder because the strong stroke no longer always lands on the beat.</p>
              <p>Played in tigun, the 16-bol Teentaal theka takes 5⅓ beats — so it fits exactly <b>three times</b> in one cycle and lands perfectly on sam.</p>` },
            { type: 'sequence', title: 'Teentaal theka in four speeds', label: 'Keep the click steady and switch between the speeds.', bols: 'Dha Dhin Dhin Dha Dha Dhin Dhin Dha Dha Tin Tin Ta Ta Dhin Dhin Dha', bpm: 50, speeds: [1, 2, 3, 4] },
            { type: 'tip', body: '<p><b>Counting tigun:</b> say "ta-ki-ta" on every beat while clapping. Once that feels natural, replace the syllables with the bols.</p>' },
          ],
          quiz: [
            { q: 'How many bols per beat in tigun?', options: ['Two', 'Three', 'Four'], answer: 1, explain: 'Tigun = three bols per beat.' },
            { q: 'In tigun, how many times does the Teentaal theka fit in one cycle?', options: ['Twice', 'Three times', 'Four times'], answer: 1, explain: '16 beats × 3 = 48 bols = three thekas.' },
          ],
        },
        {
          id: 'tabla-chakradar',
          title: 'Chakradar: A Tihai of Tihais',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The most exciting finish', body: `
              <p>A <b>chakradar</b> ("with wheels") is a composition that already ends in a tihai — and the whole thing is played <b>three times</b>, so that the very last Dha of the third round lands on sam. It is the most thrilling ending in tabla.</p>
              <p>Our chakradar (two bols per beat): the phrase <b>Ti Ra Ki Ta Ta Ka</b> followed by a small tihai <b>Dha – Dha – Dha</b> is 11 bols long. Played three times it takes 33 bols: one full cycle of 32, plus the final Dha on the next sam.</p>
              <p>Below, one cycle of theka (in dugun) is followed by the chakradar.</p>` },
            { type: 'sequence', title: 'Theka + chakradar', label: 'Cycle 1: theka. Cycle 2: the chakradar. Its last Dha is the sam where the loop starts again.', bols: 'Dha Dhin Dhin Dha Dha Dhin Dhin Dha Dha Tin Tin Ta Ta Dhin Dhin Dha Dha Dhin Dhin Dha Dha Dhin Dhin Dha Dha Tin Tin Ta Ta Dhin Dhin Dha Ti Ra Ki Ta Ta Ka Dha - Dha - Dha Ti Ra Ki Ta Ta Ka Dha - Dha - Dha Ti Ra Ki Ta Ta Ka Dha - Dha -', bpm: 60, perBeat: 2, group: 4 },
            { type: 'tip', body: '<p><b>Check the maths:</b> (phrase length × 3) + gaps must equal the number of bols to sam plus one. Here: 11 × 3 = 33 = 32 + 1. Every chakradar and tihai is built on this kind of counting.</p>' },
          ],
          quiz: [
            { q: 'A chakradar is…', options: ['A tihai played three times', 'A slow theka', 'A type of drum'], answer: 0, explain: 'A chakradar is a phrase ending in a tihai, played three times.' },
            { q: 'Where must the last Dha of a chakradar land?', options: ['On khali', 'On sam', 'Anywhere'], answer: 1, explain: 'Like every tihai, it lands on sam.' },
          ],
        },
        {
          id: 'tabla-solo',
          title: 'Building a Teentaal Solo',
          minutes: 25,
          steps: [
            { type: 'text', title: 'The shape of a solo', body: `
              <p>A tabla solo (<i>swatantra vadan</i>) follows a traditional order, from slow and open to fast and dazzling:</p>
              <ol>
                <li><b>Peshkar</b> — slow, spacious opening</li>
                <li><b>Kaidas</b> — theme and variations, in increasing speed</li>
                <li><b>Relas</b> — fast, rolling compositions</li>
                <li><b>Tukdas and gats</b> — short fixed compositions</li>
                <li><b>Chakradars</b> — the grand finishes</li>
              </ol>
              <p>Throughout the solo, a melody called the <b>lehra</b> (or nagma) repeats one cycle of the taal on harmonium or sarangi, so that the listener can always follow the beat. Between items, the player returns briefly to the theka.</p>` },
            { type: 'text', title: 'A 10-minute practice solo', body: `
              <ol>
                <li>Teentaal theka, 4 cycles</li>
                <li>Peshkar theme, 2 cycles</li>
                <li>Kaida Dha Ti Dha Ge: theme, paltas, tihai</li>
                <li>Rela: theme in dugun, then chaugun</li>
                <li>Tukda</li>
                <li>Chakradar to finish</li>
              </ol>` },
            { type: 'lehra', title: 'Play your solo with a lehra', taal: 'teentaal' },
            { type: 'timer', minutes: 10, tasks: ['Theka and peshkar', 'Kaida with paltas and tihai', 'Rela', 'Tukda and chakradar'] },
          ],
          quiz: [
            { q: 'What usually opens a tabla solo?', options: ['Chakradar', 'Peshkar', 'Rela'], answer: 1, explain: 'The peshkar opens the solo.' },
            { q: 'What is the lehra?', options: ['A repeating melody that marks the taal cycle', 'A type of kaida', 'A tuning hammer'], answer: 0, explain: 'The lehra (nagma) helps everyone follow the cycle.' },
          ],
        },
        {
          id: 'tabla-gharanas',
          title: 'The Six Gharanas of Tabla',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Schools of style', body: `
              <p>A <b>gharana</b> is a family or school of musicians who share a style, passed from teacher to student over generations. Tabla has six main gharanas:</p>
              <ul>
                <li><b>Delhi</b> — the oldest; crisp, delicate strokes near the edge, famous for kaidas.</li>
                <li><b>Ajrada</b> — grew from Delhi; known for complex kaidas in odd groupings and strong use of the bayan.</li>
                <li><b>Lucknow</b> — developed alongside kathak dance; open, resonant strokes and powerful compositions.</li>
                <li><b>Farukhabad</b> — grew from Lucknow; known for a huge variety of gats and elegant compositions.</li>
                <li><b>Benaras</b> — powerful, resonant and full-handed, with a strong tradition of solo playing and accompaniment for dance.</li>
                <li><b>Punjab</b> — influenced by the pakhawaj; bold, open sound and long, intricate compositions.</li>
              </ul>
              <p>Today most players learn from more than one gharana, but knowing the styles helps you understand what you hear.</p>` },
            { type: 'tip', body: '<p><b>Listen actively:</b> when you listen to great tabla players, notice how they open the solo, how they use the bayan, and how they build to the end. Try to guess the style.</p>' },
            { type: 'ear', title: 'Ear training: name the taal', kind: 'taal', options: ['teentaal', 'ektaal', 'jhaptaal', 'rupak'], rounds: 4 },
          ],
          quiz: [
            { q: 'What is a gharana?', options: ['A school of style passed down through generations', 'A kind of drum', 'A fast composition'], answer: 0, explain: 'A gharana is a musical lineage with its own style.' },
            { q: 'Which is the oldest tabla gharana?', options: ['Delhi', 'Punjab', 'Benaras'], answer: 0, explain: 'Delhi is considered the oldest.' },
          ],
        },
      ],
    },
  ],
};
