// Tabla course: from knowing the drums to a first kaida and tihai.

export const tabla = {
  id: 'tabla',
  name: 'Tabla',
  icon: '🥁',
  tagline: 'From your very first stroke to theka, kaida and tihai',
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
  ],
};
