// Singing course (Hindustani sargam based): breath, Sa, the seven swaras, alankars and first raags.
// Swara notation: see parseSwara() in music.js.

export const singing = {
  id: 'singing',
  name: 'Singing',
  icon: '🎤',
  tagline: 'Breath, Sa, sargam, alankars and your first raags',
  levels: [
    {
      title: 'Level 1 · Voice Foundations',
      lessons: [
        {
          id: 'sing-voice',
          title: 'How Your Voice Works',
          minutes: 8,
          steps: [
            { type: 'text', title: 'Three parts of the voice', body: `
              <ul>
                <li><b>Power — breath.</b> Air from your lungs, controlled by the diaphragm, drives the voice.</li>
                <li><b>Source — vocal folds.</b> Two small folds in your throat (larynx) vibrate hundreds of times a second. Faster vibration = higher pitch.</li>
                <li><b>Resonance — your body.</b> Throat, mouth and nose shape and colour the sound, like the body of a guitar.</li>
              </ul>` },
            { type: 'text', title: 'Look after your voice', body: `
              <ul>
                <li>Drink plenty of water at room temperature.</li>
                <li>Always warm up before singing.</li>
                <li>Never shout or strain. If it hurts, stop and rest.</li>
                <li>Sleep well; avoid harsh throat-clearing. Steam inhalation helps a tired voice.</li>
              </ul>` },
            { type: 'tip', body: `<p><b>Anyone can learn to sing in tune.</b> Pitch is a skill trained by listening and practice, not a gift you either have or don't. This course gives you a microphone pitch checker so you can see exactly how close you are.</p>` },
          ],
          quiz: [
            { q: 'What makes the actual sound of your voice?', options: ['The vocal folds vibrating', 'The tongue', 'The lungs alone'], answer: 0, explain: 'Breath makes the vocal folds vibrate; resonance shapes it.' },
            { q: 'Singing starts to hurt your throat. You should…', options: ['Push through it', 'Stop and rest'], answer: 1, explain: 'Pain is a warning sign — rest your voice.' },
          ],
        },
        {
          id: 'sing-breath',
          title: 'Posture & Breathing',
          minutes: 10,
          steps: [
            { type: 'text', title: 'Posture', body: `
              <ul>
                <li><b>Standing:</b> feet shoulder-width apart, knees soft, spine tall, shoulders relaxed and down, chin level.</li>
                <li><b>Sitting</b> (as in classical riyaz): cross-legged, spine straight, hands resting on your knees.</li>
              </ul>` },
            { type: 'text', title: 'Belly breathing', body: `
              <p>Put one hand on your belly. Breathe in through your nose: your <b>belly expands</b> and your shoulders stay still. Breathe out slowly with a steady <b>"sssss"</b> sound, like a tyre losing air.</p>` },
            { type: 'breath', title: 'Breathing exercise 4 – 4 – 8', inhale: 4, hold: 4, exhale: 8, rounds: 5 },
            { type: 'tip', body: `<p><b>The hiss test:</b> breathe in and hiss "sss" as long and evenly as you can. Time it. Over a few weeks, aim for 20 seconds or more.</p>` },
          ],
          quiz: [
            { q: 'When you breathe in correctly for singing…', options: ['Your shoulders rise', 'Your belly expands'], answer: 1, explain: 'Deep, low breathing uses the diaphragm.' },
            { q: 'In the 4-4-8 exercise you breathe out for…', options: ['4 counts', '8 counts'], answer: 1, explain: 'A long, controlled exhale trains breath support.' },
          ],
        },
        {
          id: 'sing-warmup',
          title: 'Warm-ups',
          minutes: 10,
          steps: [
            { type: 'text', title: 'Five gentle warm-ups', body: `
              <ol>
                <li><b>Humming</b> — lips closed, "mmm", feel the buzz on your lips and nose.</li>
                <li><b>Lip trills</b> — blow through loose lips ("brrr") while sliding up and down.</li>
                <li><b>Sirens</b> — on "ng" or "woo", glide smoothly from low to high and back.</li>
                <li><b>Yawn-sigh</b> — yawn, then sigh from high to low. Opens the throat.</li>
                <li><b>Jaw & tongue</b> — let the jaw hang loose; stretch the tongue out and in.</li>
              </ol>` },
            { type: 'drone', title: 'Hum along with the tanpura', label: 'Start the tanpura and hum softly on its main note (Sa).' },
            { type: 'timer', minutes: 5, tasks: ['Humming', 'Lip trills', 'Sirens', 'Yawn-sigh', 'Jaw & tongue release'] },
          ],
          quiz: [
            { q: 'Why do singers warm up?', options: ['To prepare the voice and avoid strain', 'Only to look professional'], answer: 0, explain: 'Like stretching before sport, warm-ups protect your voice.' },
          ],
        },
        {
          id: 'sing-find-sa',
          title: 'Find Your Sa',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Sa: your home note', body: `
              <p>In Indian music, <b>Sa</b> is the home note (the tonic). Unlike western music, you <b>choose Sa to suit your voice</b>, and all other notes are measured from it.</p>
              <p>Typical starting points:</p>
              <ul>
                <li><b>Men:</b> around C3 – D3</li>
                <li><b>Women:</b> around G3 – A#3</li>
                <li><b>Children:</b> around C4 – D4</li>
              </ul>
              <p>A good Sa lets you sing comfortably about four or five notes below it and a full octave above it.</p>` },
            { type: 'sapicker', title: 'Choose your Sa' },
            { type: 'drone', title: 'Sing Sa with the tanpura', label: 'Sing a long "aaa" on Sa. Let your voice melt into the drone.' },
          ],
          quiz: [
            { q: 'What is Sa?', options: ['A fixed note, always C', 'The home note you choose to suit your voice', 'The highest note you can sing'], answer: 1, explain: 'Sa is the tonic; you choose it for your voice.' },
          ],
        },
      ],
    },
    {
      title: 'Level 2 · The Seven Swaras',
      lessons: [
        {
          id: 'sing-sa-re-ga',
          title: 'Sa, Re, Ga',
          minutes: 12,
          steps: [
            { type: 'text', title: 'The swaras', body: `
              <p>The seven notes (<b>swaras</b>) of an octave (<b>saptak</b>) are:</p>
              <p class="big-line">Sa Re Ga Ma Pa Dha Ni</p>
              <p>Their full names are Shadja, Rishabh, Gandhar, Madhyam, Pancham, Dhaivat and Nishad. They are like <i>Do Re Mi Fa So La Ti</i> in western music.</p>
              <p>Today we learn the first three.</p>` },
            { type: 'keyboard', title: 'Tap to hear', notes: 'S R G' },
            { type: 'sargam', title: 'Listen and sing', notes: 'S R G R S -', bpm: 60 },
            { type: 'ear', title: 'Ear training: Sa, Re or Ga?', label: 'You will hear Sa first, then the mystery note.', kind: 'swara', options: ['S', 'R', 'G'] },
          ],
          quiz: [
            { q: 'What comes after Re?', options: ['Ma', 'Ga', 'Pa'], answer: 1, explain: 'Sa Re Ga Ma Pa Dha Ni.' },
            { q: 'How many swaras are in a saptak?', options: ['5', '7', '8'], answer: 1, explain: 'Seven swaras; the eighth note is Sa again, higher.' },
          ],
        },
        {
          id: 'sing-ma-pa',
          title: 'Ma & Pa',
          minutes: 12,
          steps: [
            { type: 'text', title: 'The steady fifth', body: `
              <p><b>Pa</b> is the fifth note and, after Sa, the most stable. Sa and Pa are called <b>achal swaras</b> (immovable) — they are never made flat or sharp. That is why the tanpura plays Sa and Pa.</p>` },
            { type: 'keyboard', notes: 'S R G M P' },
            { type: 'sargam', title: 'Up to Pa and back', notes: 'S R G M P - P M G R S -', bpm: 60 },
            { type: 'ear', title: 'Ear training: name the swara', label: 'Sa first, then the mystery note.', kind: 'swara', options: ['R', 'G', 'M', 'P'] },
          ],
          quiz: [
            { q: 'Which swaras are "achal" (never altered)?', options: ['Sa and Pa', 'Re and Ga', 'Ma and Ni'], answer: 0, explain: 'Sa and Pa are fixed.' },
          ],
        },
        {
          id: 'sing-dha-ni',
          title: 'Dha, Ni & High Sa',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Completing the octave', body: `
              <p>After Ni comes Sa again — but higher. This is <b>taar Sa</b>, exactly double the frequency of your Sa.</p>
              <ul>
                <li><b>Mandra saptak</b> — the lower octave, shown with a dot <b>below</b> the note.</li>
                <li><b>Madhya saptak</b> — the middle octave, no dot.</li>
                <li><b>Taar saptak</b> — the upper octave, shown with a dot <b>above</b> the note.</li>
              </ul>` },
            { type: 'keyboard', notes: "S R G M P D N S'" },
            { type: 'sargam', title: 'The top half', notes: "P D N S' - S' N D P -", bpm: 60 },
            { type: 'ear', title: 'Ear training: the whole saptak', label: 'Sa first, then the mystery note.', kind: 'swara', options: ['R', 'G', 'M', 'P', 'D', 'N'], rounds: 8 },
          ],
          quiz: [
            { q: 'A dot above a swara means…', options: ['Lower octave', 'Upper octave (taar)', 'Sing it loudly'], answer: 1, explain: 'Dot above = taar saptak.' },
            { q: 'Taar Sa has… the frequency of Sa', options: ['the same', 'double', 'half'], answer: 1, explain: 'Each octave up doubles the frequency.' },
          ],
        },
        {
          id: 'sing-aroha',
          title: 'Aroha & Avaroha',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Up and down', body: `
              <p><b>Aroha</b> is the ascending scale; <b>avaroha</b> is the descending scale. Sing them slowly with the tanpura, every note steady and full.</p>` },
            { type: 'sargam', title: 'Aroha', notes: "S R G M P D N S'", bpm: 60 },
            { type: 'sargam', title: 'Avaroha', notes: "S' N D P M G R S", bpm: 60 },
            { type: 'sargam', title: 'Long notes', label: 'Hold each note for four beats — this builds a steady voice.', notes: 'S - - - R - - - G - - - M - - - P - - -', bpm: 80 },
          ],
          quiz: [
            { q: 'Aroha means…', options: ['Ascending scale', 'Descending scale', 'A rhythm'], answer: 0, explain: 'Aroha goes up, avaroha comes down.' },
          ],
        },
      ],
    },
    {
      title: 'Level 3 · Alankars',
      lessons: [
        {
          id: 'sing-alankar-1',
          title: 'Alankars 1 & 2',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Practice patterns', body: `
              <p><b>Alankars</b> (also called paltas) are note patterns that train pitch, agility and breath. The rules:</p>
              <ul>
                <li>Always sing with the tanpura.</li>
                <li>Start slow. Speed only when every note is in tune.</li>
                <li>First sing the note names (sargam), then the same pattern on "aa" (aakar).</li>
              </ul>` },
            { type: 'sargam', title: 'Alankar 1', notes: "S R G M P D N S' S' N D P M G R S", bpm: 70, group: 8 },
            { type: 'sargam', title: 'Alankar 2 — double notes', notes: "S S R R G G M M P P D D N N S' S' S' S' N N D D P P M M G G R R S S", bpm: 90, group: 2 },
            { type: 'timer', minutes: 10, tasks: ['Alankar 1 in sargam', 'Alankar 1 in aakar', 'Alankar 2 in sargam', 'Alankar 2 in aakar'] },
          ],
          quiz: [
            { q: 'What is "aakar"?', options: ['Singing on the vowel "aa"', 'Singing very fast', 'A type of drum'], answer: 0, explain: 'Aakar means singing the pattern on "aa".' },
          ],
        },
        {
          id: 'sing-alankar-2',
          title: 'Alankars 3 & 4',
          minutes: 15,
          steps: [
            { type: 'sargam', title: 'Alankar 3 — groups of three', notes: "S R G R G M G M P M P D P D N D N S' S' N D N D P D P M P M G M G R G R S", bpm: 80, group: 3 },
            { type: 'sargam', title: 'Alankar 4 — groups of four', notes: "S R G M R G M P G M P D M P D N P D N S' S' N D P N D P M D P M G P M G R M G R S", bpm: 80, group: 4 },
            { type: 'tip', body: `<p>Groups of three and four teach your voice to move up and down while still climbing. Feel the first note of each group slightly stronger.</p>` },
          ],
          quiz: [
            { q: 'Alankar 3 starts S R G, R G M… What comes next?', options: ['G M P', 'M P D', 'S R G'], answer: 0, explain: 'Each group starts one note higher.' },
          ],
        },
        {
          id: 'sing-alankar-taal',
          title: 'Alankar 5 & Singing with Taal',
          minutes: 15,
          steps: [
            { type: 'sargam', title: 'Alankar 5 — skipping notes', notes: "S G R M G P M D P N D S' S' D N P D M P G M R G S", bpm: 70, group: 2 },
            { type: 'text', title: 'Sing with the tabla', body: `
              <p>Now sing the aroha and avaroha with <b>Keherwa</b> on the tabla — one swara for each matra. Turn off the guide notes when you feel confident and sing on your own.</p>` },
            { type: 'sargam', title: 'Aroha–avaroha in Keherwa', notes: "S R G M P D N S' S' N D P M G R S", bpm: 80, tabla: 'keherwa', group: 4 },
          ],
          quiz: [
            { q: 'Alankar 5 skips one note: S G, R M, … What comes next?', options: ['G P', 'P D', 'S R'], answer: 0, explain: 'S G, R M, G P, M D…' },
          ],
        },
      ],
    },
    {
      title: 'Level 4 · Toward Raag',
      lessons: [
        {
          id: 'sing-komal-tivra',
          title: 'Komal & Tivra Swaras',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Twelve swaras', body: `
              <p>Five swaras have a second form, giving <b>12 notes</b> in total:</p>
              <ul>
                <li><b>Komal</b> (soft, lower by a half-step): Re, Ga, Dha, Ni — written with a line <u>underneath</u>.</li>
                <li><b>Tivra</b> (sharp, higher by a half-step): only Ma — written with a mark above.</li>
                <li>Sa and Pa never change.</li>
              </ul>
              <p>The pure forms are called <b>shuddha</b>. Every raag chooses its own set of these 12 notes.</p>` },
            { type: 'keyboard', title: 'All twelve swaras', notes: "S r R g G M m P d D n N S'" },
            { type: 'sargam', title: 'Listen slowly', notes: "S r R g G M m P d D n N S'", bpm: 50 },
            { type: 'ear', title: 'Ear training: shuddha or komal / tivra?', label: 'Sa first, then the mystery note.', kind: 'swara', options: ['R', 'r', 'G', 'g', 'M', 'm'], rounds: 8 },
          ],
          quiz: [
            { q: 'Which swara has a tivra form?', options: ['Re', 'Ma', 'Pa'], answer: 1, explain: 'Only Ma can be tivra.' },
            { q: 'Komal swaras are…', options: ['Lower by a half-step', 'Higher by a half-step'], answer: 0, explain: 'Komal = soft / lower.' },
          ],
        },
        {
          id: 'sing-bhupali',
          title: 'Raag Bhupali',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Your first raag', body: `
              <p>A <b>raag</b> is more than a scale: it has its own notes, its own movements and its own mood.</p>
              <p><b>Raag Bhupali</b> uses only five notes — <b>Sa Re Ga Pa Dha</b> (no Ma, no Ni). It is peaceful and devotional and is sung in the first part of the night. Its most important notes are <b>Ga</b> (vadi) and <b>Dha</b> (samvadi).</p>` },
            { type: 'keyboard', notes: "S R G P D S'" },
            { type: 'sargam', title: 'Aroha', notes: "S R G P D S'", bpm: 60 },
            { type: 'sargam', title: 'Avaroha', notes: "S' D P G R S", bpm: 60 },
            { type: 'sargam', title: 'Pakad (signature phrase)', notes: 'G R S .D S R G - P G - D P G R S -', bpm: 60 },
          ],
          quiz: [
            { q: 'Which notes are left out of Bhupali?', options: ['Ma and Ni', 'Re and Dha', 'Ga and Pa'], answer: 0, explain: 'Bhupali = S R G P D.' },
          ],
        },
        {
          id: 'sing-yaman',
          title: 'Raag Yaman',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The evening raag', body: `
              <p><b>Raag Yaman</b> uses all seven notes, with one special change: <b>tivra Ma</b>. It is sung in the evening and is often the first full raag students learn. Its vadi is <b>Ga</b> and samvadi is <b>Ni</b>.</p>
              <p>Yaman often begins its climb from the lower Ni (.N), skipping Sa.</p>` },
            { type: 'keyboard', notes: ".N S R G m P D N S'" },
            { type: 'sargam', title: 'Aroha', notes: ".N R G m D N S'", bpm: 60 },
            { type: 'sargam', title: 'Avaroha', notes: "S' N D P m G R S", bpm: 60 },
            { type: 'sargam', title: 'Pakad', notes: '.N R G R - .N R S - P m G R .N R S -', bpm: 60 },
          ],
          quiz: [
            { q: 'Which Ma does Yaman use?', options: ['Shuddha Ma', 'Tivra Ma'], answer: 1, explain: 'Tivra Ma gives Yaman its bright colour.' },
            { q: 'When is Yaman traditionally sung?', options: ['Early morning', 'Evening', 'Noon'], answer: 1, explain: 'Yaman is an evening raag.' },
          ],
        },
        {
          id: 'sing-riyaz',
          title: 'Your Daily Riyaz',
          minutes: 30,
          steps: [
            { type: 'text', title: 'A 30-minute practice plan', body: `
              <ol>
                <li><b>5 min</b> — warm-ups (humming, lip trills, sirens)</li>
                <li><b>5 min</b> — breathing and long notes on Sa with the tanpura</li>
                <li><b>10 min</b> — alankars, slow then faster</li>
                <li><b>10 min</b> — a raag (aroha, avaroha, pakad) or a song</li>
              </ol>
              <p><b>Consistency beats length:</b> 20 minutes every day is better than 3 hours once a week. Record yourself once a week and listen back — you will be surprised how fast you improve.</p>` },
            { type: 'drone' },
            { type: 'timer', minutes: 30, tasks: ['Warm-ups', 'Breathing & long Sa', 'Alankars', 'Raag or song'] },
          ],
          quiz: [
            { q: 'Which is better for improving?', options: ['A short practice every day', 'One very long practice per week'], answer: 0, explain: 'Daily practice builds skill fastest.' },
          ],
        },
      ],
    },
    {
      title: 'Level 5 · Raags of the Day',
      lessons: [
        {
          id: 'sing-bhairav',
          title: 'Raag Bhairav (dawn)',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The raag of sunrise', body: `
              <p>In Hindustani music, every raag has its own <b>time of day</b>. <b>Raag Bhairav</b> belongs to dawn: serious, devotional and full of quiet strength. It is named after a form of Lord Shiva and is the parent of a whole family of morning raags (the Bhairav <i>thaat</i>).</p>
              <ul>
                <li><b>Notes:</b> Sa, <u>komal Re</u>, Ga, Ma, Pa, <u>komal Dha</u>, Ni</li>
                <li><b>Vadi / samvadi</b> (most important notes): komal Dha and komal Re</li>
                <li><b>Special touch:</b> komal Re and komal Dha are sung with a slow, gentle sway called <b>andolan</b>.</li>
              </ul>` },
            { type: 'keyboard', notes: "S r G M P d N S'" },
            { type: 'sargam', title: 'Aroha', notes: "S r G M P d N S'", bpm: 55 },
            { type: 'sargam', title: 'Avaroha', notes: "S' N d P M G r S", bpm: 55 },
            { type: 'sargam', title: 'Pakad', notes: 'G M d - P - G M r - S -', bpm: 50 },
            { type: 'tip', body: '<p><b>Andolan:</b> hold komal Dha and let it sway very slightly, as if it leans towards Pa and back. Do not shake it fast — it should feel like a slow breath.</p>' },
          ],
          quiz: [
            { q: 'When is Raag Bhairav sung?', options: ['At dawn', 'At noon', 'Late at night'], answer: 0, explain: 'Bhairav is a sunrise raag.' },
            { q: 'Which notes are komal in Bhairav?', options: ['Re and Dha', 'Ga and Ni', 'Only Ni'], answer: 0, explain: 'Bhairav uses komal Re and komal Dha.' },
            { q: 'What is andolan?', options: ['A fast taan', 'A slow, gentle sway on a note', 'A drum stroke'], answer: 1, explain: 'Andolan is a slow oscillation, typical of Bhairav\'s komal Re and Dha.' },
          ],
        },
        {
          id: 'sing-kafi',
          title: 'Raag Kafi (folk & Holi)',
          minutes: 20,
          steps: [
            { type: 'text', title: 'A raag close to folk music', body: `
              <p><b>Raag Kafi</b> sounds warm and familiar because many folk songs, Holi songs and bhajans are built on it. It is sung late at night, but its tunes are heard at any time.</p>
              <ul>
                <li><b>Notes:</b> Sa, Re, <u>komal Ga</u>, Ma, Pa, Dha, <u>komal Ni</u></li>
                <li><b>Vadi / samvadi:</b> Pa and Sa</li>
                <li><b>Mood:</b> playful and romantic — the colours of spring and Holi.</li>
              </ul>` },
            { type: 'keyboard', notes: "S R g M P D n S'" },
            { type: 'sargam', title: 'Aroha', notes: "S R g M P D n S'", bpm: 60 },
            { type: 'sargam', title: 'Avaroha', notes: "S' n D P M g R S", bpm: 60 },
            { type: 'sargam', title: 'Pakad', notes: 'S S R R g g M M P -', bpm: 60 },
          ],
          quiz: [
            { q: 'Which notes are komal in Kafi?', options: ['Ga and Ni', 'Re and Dha', 'Ma'], answer: 0, explain: 'Kafi uses komal Ga and komal Ni.' },
            { q: 'Kafi is close to which kind of music?', options: ['Folk and Holi songs', 'Western opera', 'Dhrupad only'], answer: 0, explain: 'Many folk and Holi songs use the notes of Kafi.' },
          ],
        },
        {
          id: 'sing-khamaj',
          title: 'Raag Khamaj (light classical)',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The raag of thumri', body: `
              <p><b>Raag Khamaj</b> is sweet and romantic, and is a favourite for <b>thumri, dadra and light classical songs</b>. It is sung in the second part of the night.</p>
              <ul>
                <li><b>Going up</b> it skips Re and uses shuddha (natural) Ni: S G M P D N S'</li>
                <li><b>Coming down</b> it uses <u>komal Ni</u>: S' n D P M G R S</li>
                <li><b>Vadi / samvadi:</b> Ga and Ni</li>
              </ul>
              <p>Using both Ni's — one going up, one coming down — gives Khamaj its charm.</p>` },
            { type: 'keyboard', notes: "S R G M P D n N S'" },
            { type: 'sargam', title: 'Aroha', notes: "S G M P D N S'", bpm: 60 },
            { type: 'sargam', title: 'Avaroha', notes: "S' n D P M G R S", bpm: 60 },
            { type: 'sargam', title: 'Pakad', notes: 'n D - M P D - M G -', bpm: 55 },
          ],
          quiz: [
            { q: 'Which Ni does Khamaj use coming down?', options: ['Shuddha Ni', 'Komal Ni', 'No Ni'], answer: 1, explain: 'Khamaj uses komal Ni in the avaroha.' },
            { q: 'Which note does Khamaj skip going up?', options: ['Re', 'Pa', 'Dha'], answer: 0, explain: 'The aroha is S G M P D N S\'.' },
          ],
        },
        {
          id: 'sing-durga',
          title: 'Raag Durga (five notes)',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Bright and joyful', body: `
              <p>Like Bhupali, <b>Raag Durga</b> uses only <b>five notes</b> (an <i>audav</i> raag) — but a different five: <b>Sa Re Ma Pa Dha</b>. There is no Ga and no Ni.</p>
              <ul>
                <li><b>Vadi / samvadi:</b> Ma and Sa</li>
                <li><b>Time:</b> night</li>
                <li><b>Mood:</b> bright, joyful and full of energy.</li>
              </ul>
              <p>Try singing Bhupali (S R G P D) and then Durga (S R M P D): one small change gives a completely different feeling.</p>` },
            { type: 'keyboard', notes: "S R M P D S'" },
            { type: 'sargam', title: 'Aroha', notes: "S R M P D S'", bpm: 60 },
            { type: 'sargam', title: 'Avaroha', notes: "S' D P M R S", bpm: 60 },
            { type: 'sargam', title: 'Pakad', notes: 'R M P D - M R - .D S -', bpm: 55 },
            { type: 'ear', title: 'Ear training: Ga or Ma?', label: 'Sa first, then the mystery note.', kind: 'swara', options: ['G', 'M', 'P', 'D'], rounds: 6 },
          ],
          quiz: [
            { q: 'Which notes does Durga leave out?', options: ['Ga and Ni', 'Ma and Ni', 'Re and Dha'], answer: 0, explain: 'Durga = S R M P D.' },
            { q: 'Bhupali and Durga both have…', options: ['Five notes', 'Seven notes', 'Komal swaras'], answer: 0, explain: 'Both are audav (five-note) raags.' },
          ],
        },
      ],
    },
    {
      title: 'Level 6 · Voice Skills & Ornaments',
      lessons: [
        {
          id: 'sing-alankars-more',
          title: 'More Alankars & Merukhand',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Patterns that train your voice', body: `
              <p>Alankars are the gym of Indian singing. Each pattern trains a different skill: accuracy, agility, and the ability to jump between notes cleanly.</p>
              <ul>
                <li><b>Alankar 6</b> — groups of three that climb step by step</li>
                <li><b>Alankar 7</b> — touch a note, go up one, come back</li>
                <li><b>Alankar 8</b> — leaps of a third: Sa Ga Pa, Re Ma Dha…</li>
                <li><b>Merukhand</b> — every possible order of a few notes. Singers use it to explore a raag deeply.</li>
              </ul>
              <p>Sing each one slowly in akaar ("aa") and in sargam, then gradually increase the speed.</p>` },
            { type: 'sargam', title: 'Alankar 6 · groups of three', notes: "S R G R G M G M P M P D P D N D N S'", bpm: 70, group: 3 },
            { type: 'sargam', title: 'Alankar 7 · up one and back', notes: "S R S R G R G M G M P M P D P D N D N S' N S'", bpm: 70, group: 3 },
            { type: 'sargam', title: 'Alankar 8 · leaps', notes: "S G P R M D G P N M D S'", bpm: 60, group: 3 },
            { type: 'sargam', title: 'Merukhand of Sa Re Ga', label: 'All six orders of three notes.', notes: 'S R G S G R R S G R G S G S R G R S', bpm: 60, group: 3 },
          ],
          quiz: [
            { q: 'What is merukhand?', options: ['Singing every possible order of a few notes', 'A fast taan', 'A type of taal'], answer: 0, explain: 'Merukhand explores all orders (permutations) of a group of notes.' },
            { q: 'How should you practise alankars?', options: ['As fast as possible from the start', 'Slowly first, then gradually faster'], answer: 1, explain: 'Accuracy first, speed later.' },
          ],
        },
        {
          id: 'sing-meend-kan',
          title: 'Meend & Kan: Glides and Grace Notes',
          minutes: 15,
          steps: [
            { type: 'text', title: 'The beauty between the notes', body: `
              <p>Indian music lives not only <i>on</i> the notes but also <i>between</i> them.</p>
              <ul>
                <li><b>Meend</b> — a smooth, unbroken glide from one note to another, like a slide on a sitar string. For example, glide from Pa down to Ga without any steps in between.</li>
                <li><b>Kan</b> (kan swar) — a tiny touch of a neighbouring note just before the main note, like a grace note. For example, a quick touch of Ga before landing on Re.</li>
              </ul>
              <p>These ornaments are what make a raag sound like a raag rather than a scale.</p>` },
            { type: 'tip', body: '<p><b>Practising meend:</b> start on Sa, and slide up to Pa as slowly as you can — take five full seconds. Keep the volume steady and do not let the voice break. Then slide back down.</p>' },
            { type: 'tuner', mode: 'voice', title: 'Watch your glide', label: 'Sing a slow meend from Sa to Pa: the swara shown should change smoothly, Sa → Re → Ga → Ma → Pa, without jumps.' },
            { type: 'sargam', title: 'Hear the two notes of the meend', notes: 'S - - - P - - -', bpm: 60 },
          ],
          quiz: [
            { q: 'Meend is…', options: ['A smooth glide between notes', 'A drum stroke', 'A fast repetition'], answer: 0, explain: 'Meend is an unbroken glide.' },
            { q: 'A kan swar is…', options: ['A long held note', 'A quick touch of a neighbouring note before the main note', 'A pause'], answer: 1, explain: 'Kan is a grace note.' },
          ],
        },
        {
          id: 'sing-murki-taan',
          title: 'Murki & Taan: Fast Phrases',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Speed with clarity', body: `
              <ul>
                <li><b>Murki</b> — a quick, delicate cluster of two or three notes around a main note, very common in thumri, ghazal and film songs.</li>
                <li><b>Taan</b> — a fast run of notes, usually sung in akaar ("aa"). Taans show the singer's agility and come near the end of a performance.</li>
                <li><b>Sapaat taan</b> — the simplest taan: straight up the scale and straight back down.</li>
              </ul>
              <p>The secret of a good taan is that every note stays clear and in tune, even at speed. Practise slowly with the sargam names first.</p>` },
            { type: 'sargam', title: 'A murki around Sa', notes: 'S - N S R S N S S - - -', bpm: 120, group: 4 },
            { type: 'sargam', title: 'Sapaat taan (slow, then faster)', notes: "S R G M P D N S' N D P M G R S -", bpm: 100, group: 8 },
            { type: 'sargam', title: 'Alankar taan', notes: "S R G R G M G M P M P D P D N D N S' S' - - -", bpm: 110, group: 3 },
            { type: 'timer', minutes: 10, tasks: [
              'Sapaat taan in sargam, slowly',
              'Same taan in akaar ("aa")',
              'Alankar taan, slowly then faster',
              'Murkis around Sa, Pa and high Sa',
            ] },
          ],
          quiz: [
            { q: 'A taan is usually sung…', options: ['Very slowly on one note', 'As a fast run, often in akaar', 'Without any notes'], answer: 1, explain: 'Taans are fast runs, usually on "aa".' },
            { q: 'What is a sapaat taan?', options: ['Straight up and down the scale', 'A taan that skips every note', 'A drum pattern'], answer: 0, explain: 'Sapaat = straight.' },
          ],
        },
        {
          id: 'sing-sargam-geet',
          title: 'Your First Sargam Geet',
          minutes: 20,
          steps: [
            { type: 'text', title: 'A song made of notes', body: `
              <p>A <b>sargam geet</b> is a little composition sung with the names of the notes instead of words. It teaches a raag's movements and how to sing in a taal at the same time.</p>
              <p>This one is in <b>Raag Bhupali</b> (S R G P D) and <b>Teentaal</b> (16 beats). It has two parts:</p>
              <ul>
                <li><b>Sthayi</b> — the first part, which stays mostly in the middle octave.</li>
                <li><b>Antara</b> — the second part, which rises to the upper Sa and beyond, then returns.</li>
              </ul>
              <p>Each box is one beat. A dash means: hold the previous note.</p>` },
            { type: 'sargam', title: 'Sthayi', notes: "G - R S .D S R G P G D P G R S - S R G P D S' D P G P D P G R S -", bpm: 70, tabla: 'teentaal', group: 4 },
            { type: 'sargam', title: 'Antara', notes: "P - D S' S' - R' S' D S' R' G' R' S' D P G P D S' D P G R G - R S .D S R G", bpm: 70, tabla: 'teentaal', group: 4 },
            { type: 'tip', body: '<p><b>How to learn it:</b> first sing along with the guide voice, then switch the guide off and sing alone with only the tabla. Clap Teentaal (clap, clap, wave, clap) if the tabla is off.</p>' },
          ],
          quiz: [
            { q: 'A sargam geet is sung with…', options: ['Poetry', 'The names of the notes', 'Only "aa"'], answer: 1, explain: 'Sargam geet uses the note names as its words.' },
            { q: 'Which part of a composition rises to the upper octave?', options: ['Sthayi', 'Antara'], answer: 1, explain: 'The antara rises to the upper Sa and beyond.' },
          ],
        },
      ],
    },
    {
      title: 'Level 7 · Afternoon & Night Raags',
      lessons: [
        {
          id: 'sing-bhimpalasi',
          title: 'Raag Bhimpalasi (afternoon)',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Longing in the afternoon', body: `
              <p><b>Raag Bhimpalasi</b> is sung in the late afternoon. Its mood is gentle longing and devotion.</p>
              <ul>
                <li><b>Notes:</b> Sa, Re, <u>komal Ga</u>, Ma, Pa, Dha, <u>komal Ni</u></li>
                <li><b>Going up</b> it skips Re and Dha: .n S g M P n S'</li>
                <li><b>Coming down</b> it uses all seven: S' n D P M g R S</li>
                <li><b>Vadi / samvadi:</b> Ma and Sa — Ma is the resting place of this raag.</li>
              </ul>` },
            { type: 'keyboard', notes: "S R g M P D n S'" },
            { type: 'sargam', title: 'Aroha', notes: ".n S g M P n S'", bpm: 60 },
            { type: 'sargam', title: 'Avaroha', notes: "S' n D P M g R S", bpm: 60 },
            { type: 'sargam', title: 'Pakad', notes: '.n S M - M g P M g - M g R S -', bpm: 55 },
          ],
          quiz: [
            { q: 'When is Bhimpalasi sung?', options: ['Dawn', 'Late afternoon', 'Midnight'], answer: 1, explain: 'Bhimpalasi is an afternoon raag.' },
            { q: 'Which notes are left out going up?', options: ['Re and Dha', 'Ga and Ni', 'Ma and Pa'], answer: 0, explain: 'Aroha: .n S g M P n S\'.' },
          ],
        },
        {
          id: 'sing-bageshree',
          title: 'Raag Bageshree (night)',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The raag of waiting', body: `
              <p><b>Raag Bageshree</b> is a night raag full of tenderness — the feeling of waiting for a loved one.</p>
              <ul>
                <li><b>Notes:</b> Sa, Re, <u>komal Ga</u>, Ma, Dha, <u>komal Ni</u>; Pa is used very little</li>
                <li><b>Aroha:</b> S g M D n S'</li>
                <li><b>Avaroha:</b> S' n D M g R S</li>
                <li><b>Vadi / samvadi:</b> Ma and Sa</li>
              </ul>
              <p>The phrase <b>Ma Dha Ni Dha</b> is the heart of Bageshree.</p>` },
            { type: 'keyboard', notes: "S R g M D n S'" },
            { type: 'sargam', title: 'Aroha', notes: "S g M D n S'", bpm: 60 },
            { type: 'sargam', title: 'Avaroha', notes: "S' n D M g R S", bpm: 60 },
            { type: 'sargam', title: 'Pakad', notes: 'S .n .D S M g - M D n D - M g R S -', bpm: 55 },
          ],
          quiz: [
            { q: 'Which note is used very little in Bageshree?', options: ['Pa', 'Ma', 'Sa'], answer: 0, explain: 'Pa is almost absent in Bageshree.' },
            { q: 'Which phrase is the heart of Bageshree?', options: ['Ma Dha Ni Dha', 'Sa Re Ga', 'Pa Dha Pa'], answer: 0, explain: 'M D n D is its most typical phrase.' },
          ],
        },
        {
          id: 'sing-malkauns',
          title: 'Raag Malkauns (late night)',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Deep and meditative', body: `
              <p><b>Raag Malkauns</b> is one of the oldest and most serious raags, sung late at night. It is deep, still and meditative.</p>
              <ul>
                <li><b>Five notes:</b> Sa, <u>komal Ga</u>, Ma, <u>komal Dha</u>, <u>komal Ni</u> — no Re and no Pa</li>
                <li>The same five notes going up and coming down</li>
                <li><b>Vadi / samvadi:</b> Ma and Sa</li>
              </ul>
              <p>Because there is no Pa, the singer leans on Ma and Sa for stability.</p>` },
            { type: 'keyboard', notes: "S g M d n S'" },
            { type: 'sargam', title: 'Aroha', notes: "S g M d n S'", bpm: 55 },
            { type: 'sargam', title: 'Avaroha', notes: "S' n d M g S", bpm: 55 },
            { type: 'sargam', title: 'Pakad', notes: 'M g M d n d M - g M g S -', bpm: 55 },
          ],
          quiz: [
            { q: 'Which notes does Malkauns leave out?', options: ['Re and Pa', 'Ga and Ni', 'Ma and Dha'], answer: 0, explain: 'Malkauns = S g M d n.' },
            { q: 'When is Malkauns sung?', options: ['Morning', 'Late at night', 'Noon'], answer: 1, explain: 'It is a late-night raag.' },
          ],
        },
        {
          id: 'sing-des',
          title: 'Raag Des (rainy season)',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The raag of the monsoon', body: `
              <p><b>Raag Des</b> is loved for its sweetness and is linked with the rainy season. Many patriotic and devotional songs use it.</p>
              <ul>
                <li><b>Aroha</b> (skips Ga and Dha, uses shuddha Ni): S R M P N S'</li>
                <li><b>Avaroha</b> (uses komal Ni, and all notes): S' n D P M G R S</li>
                <li><b>Vadi / samvadi:</b> Re and Pa</li>
              </ul>
              <p>Like Khamaj, Des uses shuddha Ni going up and komal Ni coming down — but Des leans on Re, which gives it a different colour.</p>` },
            { type: 'keyboard', notes: "S R G M P D n N S'" },
            { type: 'sargam', title: 'Aroha', notes: "S R M P N S'", bpm: 60 },
            { type: 'sargam', title: 'Avaroha', notes: "S' n D P M G R S", bpm: 60 },
            { type: 'sargam', title: 'Pakad', notes: 'R M P - n D P - M G R - G .N S -', bpm: 55 },
          ],
          quiz: [
            { q: 'Raag Des is linked with…', options: ['The rainy season', 'Winter mornings', 'Holi'], answer: 0, explain: 'Des is a monsoon raag.' },
            { q: 'Which note is vadi in Des?', options: ['Re', 'Ga', 'Ni'], answer: 0, explain: 'Re is the vadi, Pa the samvadi.' },
          ],
        },
      ],
    },
    {
      title: 'Level 8 · Khayal',
      lessons: [
        {
          id: 'sing-khayal',
          title: 'Khayal: Bandish, Sthayi and Antara',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The main form of Hindustani singing', body: `
              <p><b>Khayal</b> ("imagination") is the main form of Hindustani classical singing. A performance usually has two compositions in the same raag:</p>
              <ul>
                <li><b>Bada khayal</b> — slow (<i>vilambit</i>), in Ektaal, Jhoomra or Tilwada, where the raag unfolds at length.</li>
                <li><b>Chhota khayal</b> — faster (<i>madhya</i> or <i>drut</i>), often in Teentaal, full of taans.</li>
              </ul>
              <p>Each composition, a <b>bandish</b>, has two parts: the <b>sthayi</b>, which stays around the lower and middle octave, and the <b>antara</b>, which rises to taar Sa. The <b>mukhda</b> is the opening phrase of the sthayi: after every improvisation the singer returns to it and lands on sam together with the tabla.</p>` },
            { type: 'sargam', title: 'A short sthayi in Raag Yaman', label: 'An original sthayi in Teentaal: two cycles of sixteen beats.', notes: ".N R G - R G m - P - m G - R S - G m D - N - S' - N D P - m G R S", bpm: 90, tabla: 'teentaal', group: 8 },
            { type: 'tip', body: `<p><b>Feel the sam.</b> Clap the taal while you sing the sthayi. Every time you come back to its first note, you should arrive exactly with the tabla's sam (beat 1).</p>` },
          ],
          quiz: [
            { q: 'What are the two parts of a bandish?', options: ['Sthayi and antara', 'Alaap and taan', 'Sam and khali'], answer: 0, explain: 'The sthayi stays low and middle; the antara rises to taar Sa.' },
            { q: 'Bada khayal is sung…', options: ['Slowly (vilambit)', 'Very fast'], answer: 0, explain: 'Bada khayal is the slow composition; chhota khayal is faster.' },
          ],
        },
        {
          id: 'sing-alaap',
          title: 'Alaap and Badhat',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Unfolding a raag', body: `
              <p><b>Alaap</b> is the slow unfolding of a raag on "aa" (<i>aakar</i>) or on syllables. In khayal the singer develops the raag note by note — this is called <b>badhat</b> ("growth"):</p>
              <ol>
                <li>First, phrases around Sa and the lower octave.</li>
                <li>Then one new note at a time — Re, then Ga, then Ma… — each phrase reaching one step higher and returning home.</li>
                <li>The singer rests on important notes (<b>nyas</b>), above all the vadi and samvadi.</li>
              </ol>
              <p>The raag grows like a building, floor by floor, until the whole octave is shown.</p>` },
            { type: 'sargam', title: 'Badhat 1: around Sa', notes: 'S - .N - .D - .N - R - S - - - - -', bpm: 40 },
            { type: 'sargam', title: 'Badhat 2: reaching Ga', notes: '.N R G - - - R G R - S - - - - -', bpm: 40 },
            { type: 'sargam', title: 'Badhat 3: up to Pa', notes: 'G m P - - - m G R - G - R S - -', bpm: 40 },
            { type: 'tip', body: `<p><b>Slow does not mean still.</b> Keep every long note steady but alive, and glide gently (meend) between notes. Each phrase should sound like a question or an answer.</p>` },
          ],
          quiz: [
            { q: 'In badhat the raag is developed…', options: ['Note by note, step by step', 'With all its notes at once'], answer: 0, explain: 'Each phrase adds one more note.' },
            { q: 'A note the singer rests on is called…', options: ['Nyas', 'Taan', 'Tihai'], answer: 0, explain: 'Nyas swaras are the resting points of a raag.' },
          ],
        },
        {
          id: 'sing-taan-advanced',
          title: 'Taans: Sapaat, Alankarik and Bol-taans',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Kinds of taan', body: `
              <ul>
                <li><b>Sapaat taan</b> — straight runs up and down the raag.</li>
                <li><b>Alankarik taan</b> — patterned taans built like alankars (Sa Re Ga, Re Ga Ma…).</li>
                <li><b>Kut taan</b> — zigzag taans with the notes out of order.</li>
                <li><b>Bol-taan</b> — the words of the bandish sung at taan speed.</li>
                <li><b>Gamak taan</b> — every note shaken with force from the breath.</li>
              </ul>
              <p>Learn each taan at half speed with the metronome, then double it. Speed is useless without clarity: every note must be heard.</p>` },
            { type: 'sargam', title: 'Sapaat taan in Yaman', notes: "S R G m P D N S' S' N D P m G R S", bpm: 80, group: 8 },
            { type: 'sargam', title: 'Alankarik taan in threes', notes: "S R G R G m G m P m P D P D N D N S'", bpm: 80, group: 6 },
            { type: 'sargam', title: 'Kut taan', notes: "S G R m G P m D P N D S'", bpm: 80, group: 6 },
          ],
          quiz: [
            { q: 'A sapaat taan…', options: ['Runs straight up and down', 'Shakes every note'], answer: 0, explain: 'Sapaat means flat or straight.' },
            { q: 'In a bol-taan the singer uses…', options: ['The words of the bandish', 'Only "aa"'], answer: 0, explain: 'Bol = word: the lyric is sung at taan speed.' },
          ],
        },
        {
          id: 'sing-layakari',
          title: 'Layakari and Tihai in Singing',
          minutes: 18,
          steps: [
            { type: 'text', title: 'Playing with rhythm', body: `
              <p><b>Layakari</b> is playing with rhythm against the steady taal. A phrase can be sung in <b>barabar</b> (one note per beat), <b>dugun</b> (two), <b>tigun</b> (three) or <b>chaugun</b> (four), while the tabla keeps the same tempo.</p>
              <p>Singers also finish phrases with a <b>tihai</b> — a phrase sung three times that lands exactly on sam, just like a tabla tihai.</p>` },
            { type: 'sargam', title: 'Barabar: one note per beat', notes: 'S R G m P m G R', bpm: 60 },
            { type: 'sargam', title: 'Dugun: two notes per beat', notes: 'S R G m P m G R S R G m P m G R', bpm: 120 },
            { type: 'sargam', title: 'A sung tihai', label: 'Re Ga Ma Pa three times — the loop restarts on Sa, the sam.', notes: 'S - R G m P - R G m P - R G m P', bpm: 70, tabla: 'teentaal', group: 8 },
          ],
          quiz: [
            { q: 'Dugun means…', options: ['Two notes per beat', 'Two beats per note'], answer: 0, explain: 'Dugun doubles the density against the same beat.' },
            { q: 'A tihai is a phrase…', options: ['Sung three times, landing on sam', 'Sung once, very slowly'], answer: 0, explain: 'The last note of the third time falls on sam.' },
          ],
        },
        {
          id: 'sing-tarana',
          title: 'Tarana',
          minutes: 15,
          steps: [
            { type: 'text', title: 'A song of syllables', body: `
              <p>A <b>tarana</b> is sung on syllables instead of words — <i>ta, na, de, re, dir, tom, tanom, odani…</i> Tradition credits Amir Khusrau (13th–14th century) with the form.</p>
              <p>Because the syllables are rhythmic like tabla bols, the voice almost becomes a drum. Taranas are usually sung fast, at the end of a khayal performance, full of energy and joy.</p>` },
            { type: 'sargam', title: 'A tarana phrase in Yaman', label: 'Sing it on "ta – na – de – re – na", lightly and crisply.', notes: 'S R G R S .N .D .N R G m G R S - -', bpm: 100, tabla: 'teentaal', group: 8 },
            { type: 'tip', body: `<p><b>Light jaw, light syllables.</b> Let the tongue do the work and keep the jaw loose. Learn it slowly; the speed comes by itself.</p>` },
          ],
          quiz: [
            { q: 'A tarana is sung on…', options: ['Syllables such as ta, na, de, re', 'Poems about the seasons'], answer: 0, explain: 'The syllables give it a drum-like rhythm.' },
          ],
        },
      ],
    },
    {
      title: 'Level 9 · Master Raags & Light Classical',
      lessons: [
        {
          id: 'sing-bhairavi',
          title: 'Raag Bhairavi (morning; concert finale)',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The queen of raags', body: `
              <p><b>Raag Bhairavi</b> is a morning raag and, by tradition, the last piece of a concert. Its mood is devotional and tender.</p>
              <ul>
                <li><b>Swaras:</b> Sa, <u>komal Re</u>, <u>komal Ga</u>, Ma, Pa, <u>komal Dha</u>, <u>komal Ni</u></li>
                <li><b>Vadi / samvadi:</b> Ma and Sa</li>
              </ul>
              <p>In light-classical Bhairavi, singers often touch other notes too for colour — but its heart is these four komal swaras.</p>` },
            { type: 'keyboard', notes: "S r g M P d n S'" },
            { type: 'sargam', title: 'Aroha', notes: "S r g M P d n S'", bpm: 55 },
            { type: 'sargam', title: 'Avaroha', notes: "S' n d P M g r S", bpm: 55 },
            { type: 'sargam', title: 'Pakad', notes: 'M g S r S - .d .n S -', bpm: 55 },
          ],
          quiz: [
            { q: 'Which swaras are komal in Bhairavi?', options: ['Re, Ga, Dha and Ni', 'Only Ni', 'Only Ma'], answer: 0, explain: 'Bhairavi uses komal Re, Ga, Dha and Ni.' },
            { q: 'Bhairavi is traditionally sung…', options: ['As the last piece of a concert', 'Only at noon'], answer: 0, explain: 'It closes concerts and is also a morning raag.' },
          ],
        },
        {
          id: 'sing-todi',
          title: 'Raag Todi (late morning)',
          minutes: 20,
          steps: [
            { type: 'text', title: 'Serious and deeply moving', body: `
              <p><b>Miyan ki Todi</b> is one of the most important and most challenging morning raags.</p>
              <ul>
                <li><b>Swaras:</b> Sa, <u>komal Re</u>, <u>komal Ga</u>, tivra Ma, Pa, <u>komal Dha</u>, shuddha Ni</li>
                <li>Pa is weak and is usually left out going up.</li>
                <li><b>Vadi / samvadi:</b> komal Dha and komal Ga</li>
              </ul>
              <p>Komal Re and komal Ga are sung a shade lower than usual, which gives Todi its intense, pleading colour.</p>` },
            { type: 'keyboard', notes: "S r g m P d N S'" },
            { type: 'sargam', title: 'Aroha', notes: "S r g m d N S'", bpm: 50 },
            { type: 'sargam', title: 'Avaroha', notes: "S' N d P m g r S", bpm: 50 },
            { type: 'sargam', title: 'Pakad', notes: '.d .N S r g - r S -', bpm: 50 },
          ],
          quiz: [
            { q: 'Which Ma does Todi use?', options: ['Tivra Ma', 'Shuddha Ma'], answer: 0, explain: 'Todi uses tivra Ma with komal Re, Ga and Dha.' },
            { q: 'Going up, Todi usually leaves out…', options: ['Pa', 'Sa', 'Ni'], answer: 0, explain: 'Pa is weak in Todi and skipped in the aroha.' },
          ],
        },
        {
          id: 'sing-darbari',
          title: 'Raag Darbari Kanada (midnight)',
          minutes: 22,
          steps: [
            { type: 'text', title: 'The raag of the royal court', body: `
              <p><b>Darbari Kanada</b> is grave and majestic, sung around midnight.</p>
              <ul>
                <li><b>Swaras:</b> Sa, Re, <u>komal Ga</u>, Ma, Pa, <u>komal Dha</u>, <u>komal Ni</u></li>
                <li>Komal Ga and komal Dha are sung with a slow, wide oscillation called <b>andolan</b>.</li>
                <li>The movement is crooked (<i>vakra</i>): Ga Ma Re Sa, and Dha Ni Pa.</li>
                <li><b>Vadi / samvadi:</b> Re and Pa. The lower octave is very important.</li>
              </ul>` },
            { type: 'keyboard', notes: "S R g M P d n S'" },
            { type: 'sargam', title: 'Aroha', notes: "S R g M P d n S'", bpm: 50 },
            { type: 'sargam', title: 'Avaroha', notes: "S' d n P M P g M R S", bpm: 50 },
            { type: 'sargam', title: 'Pakad', notes: 'g - M R S - - .d - .n .P - .n S - -', bpm: 50 },
            { type: 'tip', body: `<p><b>Andolan is a sway, not a note.</b> Let komal Ga swing slowly and gently around its pitch. Listening to great singers of Darbari is the best teacher.</p>` },
          ],
          quiz: [
            { q: 'Darbari\'s komal Ga is sung with…', options: ['A slow oscillation (andolan)', 'A fast taan'], answer: 0, explain: 'Andolan is the signature of Darbari.' },
            { q: 'Darbari is sung…', options: ['Around midnight', 'At dawn'], answer: 0, explain: 'It is a deep night raag.' },
          ],
        },
        {
          id: 'sing-marwa',
          title: 'Raag Marwa (sunset)',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The restless dusk', body: `
              <p><b>Raag Marwa</b> captures the restless, yearning mood of sunset.</p>
              <ul>
                <li><b>Swaras:</b> Sa, <u>komal Re</u>, Ga, tivra Ma, Dha, Ni — <b>no Pa</b></li>
                <li>Sa is used sparingly; the phrases circle around Ni, Re, Ga, Ma and Dha.</li>
                <li><b>Vadi / samvadi:</b> komal Re and Dha</li>
              </ul>` },
            { type: 'keyboard', notes: "S r G m D N S'" },
            { type: 'sargam', title: 'Aroha', notes: ".N r G m D N S'", bpm: 50 },
            { type: 'sargam', title: 'Avaroha', notes: "S' N D m G r S", bpm: 50 },
            { type: 'sargam', title: 'Pakad', notes: '.D .N r G m G r - -', bpm: 50 },
          ],
          quiz: [
            { q: 'Which note is left out of Marwa?', options: ['Pa', 'Re', 'Dha'], answer: 0, explain: 'Marwa has no Pa.' },
            { q: 'Marwa belongs to…', options: ['Sunset', 'Midnight'], answer: 0, explain: 'It is the classic sunset raag.' },
          ],
        },
        {
          id: 'sing-thumri',
          title: 'Thumri, Dadra and Bhajan: Light Classical',
          minutes: 18,
          steps: [
            { type: 'text', title: 'Expression first', body: `
              <p><b>Thumri</b> is a romantic and devotional light-classical form from Lucknow and Banaras. Here expression matters more than strict raag grammar.</p>
              <ul>
                <li><b>Bol-banav:</b> one line of the lyric is sung in many melodic ways to bring out its feeling.</li>
                <li><b>Raags:</b> Khamaj, Pilu, Kafi, Bhairavi, Des and others; shuddha and komal forms of a note may both appear.</li>
                <li><b>Taals:</b> Deepchandi (14 beats), Jat and Addha; at the end the tabla breaks into a playful <i>laggi</i>.</li>
                <li><b>Dadra</b> is lighter still, in Dadra or Keherwa; <b>bhajans</b> are devotional songs.</li>
              </ul>` },
            { type: 'sargam', title: 'A thumri phrase in Khamaj, with Deepchandi', notes: 'G M P D - n D P - M G - S -', bpm: 70, tabla: 'deepchandi' },
            { type: 'tip', body: `<p><b>Try bol-banav.</b> Sing the same line three ways: plainly, with a murki on the long note, and with a slow meend into the last note.</p>` },
          ],
          quiz: [
            { q: 'Bol-banav means…', options: ['Expressing the words in many melodic ways', 'Fast taans on "aa"'], answer: 0, explain: 'It is the heart of thumri singing.' },
            { q: 'Which taal is common in thumri?', options: ['Deepchandi', 'Dhamar'], answer: 0, explain: 'Deepchandi, with 14 beats, is the classic thumri taal.' },
          ],
        },
        {
          id: 'sing-concert',
          title: 'Building a Performance',
          minutes: 20,
          steps: [
            { type: 'text', title: 'The shape of a concert', body: `
              <ol>
                <li>A short <b>alaap</b> to set the raag.</li>
                <li><b>Bada khayal</b> (vilambit) with badhat.</li>
                <li><b>Chhota khayal</b> (drut) with taans and layakari.</li>
                <li>A <b>tarana</b>.</li>
                <li>A light piece — <b>thumri, dadra or bhajan</b>.</li>
                <li><b>Bhairavi</b> to close.</li>
              </ol>
              <p>Choose raags for the time of day, tune the tanpura to your Sa, agree on tempos with your tabla and harmonium players, and rehearse the whole programme at least once.</p>` },
            { type: 'tip', body: `<p><b>Record and review.</b> Use the Sing-along Studio or "Sing with your own track" to record full run-throughs. Listen the next day with fresh ears.</p>` },
            { type: 'timer', title: 'Concert run-through', minutes: 30, tasks: ['Alaap', 'Bada khayal', 'Chhota khayal and taans', 'Tarana', 'Light piece', 'Bhairavi'] },
          ],
          quiz: [
            { q: 'What usually comes first in a khayal performance?', options: ['The slow bada khayal', 'The tarana'], answer: 0, explain: 'Slow comes first; the tarana comes near the end.' },
          ],
        },
      ],
    },
  ],
};
