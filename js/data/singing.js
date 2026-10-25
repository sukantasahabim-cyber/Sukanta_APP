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
  ],
};
