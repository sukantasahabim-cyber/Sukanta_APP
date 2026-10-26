// World Singing: singing for everyone, everywhere — voice technique, Do Re Mi
// (movable-do solfège), intervals, scales, reading music, harmony and
// performance, from the first note to an advanced level.
// Notes use the same swara tokens as every course (see parseSwara in
// music.js): S R G M P D N = Do Re Mi Fa Sol La Ti; r g d n = Ra Me Le Te;
// m = Fi. Melodies are original exercises or traditional tunes in the
// public domain.

export const voice = {
  id: 'voice',
  name: 'World Singing',
  icon: '🌍',
  tagline: 'Do Re Mi, voice technique, reading music and harmony — for every singer',
  levels: [
    {
      title: 'Level 1 · Your Voice',
      lessons: [
        {
          id: 'voice-start',
          title: 'How Singing Works',
          minutes: 8,
          steps: [
            { type: 'text', title: 'Your voice is an instrument', body: `
              <p>Every instrument has three parts, and so does your voice:</p>
              <ul>
                <li><b>Power — your breath.</b> Air from the lungs, controlled by the muscles of your belly, ribs and back.</li>
                <li><b>Source — your vocal folds.</b> Two small folds in the larynx (voice box) vibrate when air flows past them: about 110 times a second for a low man's note, about 440 for a woman's A. Faster = higher.</li>
                <li><b>Resonance — your throat, mouth and nose.</b> They shape the buzz of the folds into a full, ringing tone, the way the body of a violin shapes its strings.</li>
              </ul>
              <p>Good singing is these three working together: steady breath, free folds, open resonance.</p>` },
            { type: 'text', title: 'What this course teaches', body: `
              <ol>
                <li>Breath, warm-ups and singing in tune.</li>
                <li><b>Do Re Mi</b> — the note names singers use all over the world.</li>
                <li>Intervals and ear training.</li>
                <li>Major, minor, pentatonic and blues scales.</li>
                <li>Reading music from a staff.</li>
                <li>Technique: registers, resonance, diction, dynamics, vibrato and agility.</li>
                <li>Harmony, learning songs, performing and keeping your voice healthy.</li>
              </ol>
              <p>Every lesson has a <b>Practical</b>: the app listens through your microphone and shows you exactly which notes were in tune.</p>` },
            { type: 'tuner', title: 'See your voice', mode: 'voice', label: 'Sing or hum any note and watch the meter follow your pitch.' },
            { type: 'tip', body: `<p><b>Singing in tune is a skill, not a gift.</b> Almost everyone who thinks they are "tone-deaf" simply hasn't practised listening and adjusting. With the pitch meter you can see what your ear is still learning to hear.</p>` },
          ],
          quiz: [
            { q: 'What actually makes the sound of your voice?', options: ['The vocal folds vibrating', 'The tongue', 'The lungs on their own'], answer: 0, explain: 'Breath sets the vocal folds vibrating; resonance shapes the sound.' },
            { q: 'A higher note means the vocal folds vibrate…', options: ['More slowly', 'Faster'], answer: 1, explain: 'Pitch is the number of vibrations per second.' },
          ],
        },
        {
          id: 'voice-posture-breath',
          title: 'Posture & Breath Support',
          minutes: 10,
          steps: [
            { type: 'text', title: 'A singer\'s posture', body: `
              <ul>
                <li>Feet hip-width apart, weight balanced, knees soft (never locked).</li>
                <li>Tall spine, as if a thread lifts the top of your head.</li>
                <li>Shoulders relaxed and down; arms loose.</li>
                <li>Chin level — don't reach up for high notes or tuck down for low ones.</li>
              </ul>
              <p>Sitting is fine too: sit near the front of the chair with both feet on the floor and the same tall spine.</p>` },
            { type: 'text', title: 'Low, wide breath', body: `
              <p>Breathe in through your nose or mouth and let the air go <b>low</b>: your belly, lower ribs and back widen. Your shoulders and chest stay still.</p>
              <p>Breathing out while singing, keep the ribs gently open for as long as you can. This steady, controlled outflow is called <b>breath support</b> (singers also call it <i>appoggio</i>). It keeps long notes steady and in tune.</p>` },
            { type: 'breath', title: 'Breathing exercise 4 – 4 – 8', inhale: 4, hold: 4, exhale: 8, rounds: 5 },
            { type: 'tip', body: `<p><b>The hiss test:</b> breathe in low, then hiss "sssss" as evenly as you can while timing it. Most beginners manage 15 seconds; with daily practice you can reach 30 or more.</p>` },
          ],
          quiz: [
            { q: 'When you breathe in well for singing…', options: ['The shoulders lift', 'The belly and lower ribs widen'], answer: 1, explain: 'A low, wide breath gives the most controllable air.' },
            { q: 'For a high note you should…', options: ['Lift your chin', 'Keep your chin level'], answer: 1, explain: 'Reaching up tightens the throat; stay level and let the breath do the work.' },
          ],
        },
        {
          id: 'voice-warmups',
          title: 'Warm-ups That Work',
          minutes: 10,
          steps: [
            { type: 'text', title: 'Why warm up?', body: `
              <p>Your vocal folds are muscles covered by a soft, flexible lining. A few minutes of gentle sound makes them supple, brings blood flow and reminds your breath to cooperate — exactly like stretching before sport.</p>` },
            { type: 'text', title: 'Five warm-ups used by singers everywhere', body: `
              <ol>
                <li><b>Lip trills</b> — blow through loose lips ("brrr") and glide up and down. If your lips won't buzz, press a finger gently into each cheek.</li>
                <li><b>Straw phonation</b> — hum through a drinking straw, sliding up and down. It balances breath and folds with almost no effort.</li>
                <li><b>Humming</b> — "mmm" on comfortable notes; feel the buzz on your lips and nose.</li>
                <li><b>Sirens</b> — on "ng" (as at the end of "sing") or "woo", glide from low to high and back like a siren.</li>
                <li><b>Five-note scales</b> — Do Re Mi Fa Sol Fa Mi Re Do on "ah", "oh" and "oo", moving a little higher each time.</li>
              </ol>` },
            { type: 'sargam', title: 'A five-note warm-up scale', notes: 'S R G M P M G R S - - -', bpm: 80 },
            { type: 'timer', minutes: 5, tasks: ['Lip trills', 'Straw or humming', 'Sirens on "ng"', 'Five-note scales on "ah"'] },
          ],
          quiz: [
            { q: 'Which warm-up uses a drinking straw?', options: ['Straw phonation', 'Lip trills', 'Sirens'], answer: 0, explain: 'Humming through a straw balances air and vocal folds gently.' },
            { q: 'A siren is…', options: ['A smooth glide up and down', 'A loud shout'], answer: 0, explain: 'Gliding smoothly connects your low and high notes.' },
          ],
        },
        {
          id: 'voice-pitch-match',
          title: 'Matching Pitch',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Find your key note: Do', body: `
              <p>In this course, notes are named by <b>Do Re Mi</b>. <b>Do</b> is your home note, and it can be <i>any</i> pitch — so you place it where your voice is comfortable. Everything else is measured from it.</p>
              <ul>
                <li><b>Lower voices</b> (most men): around C3 – D3</li>
                <li><b>Higher voices</b> (most women): around G3 – A♯3</li>
                <li><b>Children:</b> around C4 – D4</li>
              </ul>
              <p>A good Do lets you sing a few notes below it and a whole octave above it without strain.</p>` },
            { type: 'sapicker', title: 'Choose your Do' },
            { type: 'text', title: 'How to match a note', body: `
              <ol>
                <li><b>Listen first.</b> Hear the note, then hum it quietly in your head.</li>
                <li><b>Hum it softly.</b> Quiet humming is easier to tune than loud singing.</li>
                <li><b>Slide to it.</b> If you are off, glide slowly up or down until the sound "locks" with the note — you will feel the buzz smooth out.</li>
                <li><b>Check with the meter.</b> The needle shows if you are high or low.</li>
              </ol>` },
            { type: 'tuner', title: 'Pitch meter', mode: 'voice', label: 'Hear your Do above, then sing it and centre the needle.' },
          ],
          quiz: [
            { q: 'In movable Do, Do is…', options: ['Always C', 'The home note, placed to suit your voice'], answer: 1, explain: 'Do moves with the key, so you can choose it.' },
            { q: 'Your note is a little low. You should…', options: ['Slide up slowly until it locks', 'Sing louder'], answer: 0, explain: 'Pitch is fixed by small slides, not by volume.' },
          ],
        },
      ],
    },
    {
      title: 'Level 2 · Do Re Mi',
      lessons: [
        {
          id: 'voice-do-re-mi',
          title: 'Do, Re, Mi',
          minutes: 12,
          steps: [
            { type: 'text', title: 'The solfège syllables', body: `
              <p>Singers around the world name the seven notes of a scale with these syllables:</p>
              <p class="big-line">Do Re Mi Fa Sol La Ti Do</p>
              <p>This is called <b>solfège</b>. Because Do moves with the key, the syllables describe how notes <i>relate</i> to each other — that is what your ear hears. Indian music uses the same idea with <b>Sa Re Ga Ma Pa Dha Ni</b>; you can switch the names in Progress → Settings → Note names.</p>
              <p>Today: the first three notes.</p>` },
            { type: 'keyboard', title: 'Tap to hear', notes: 'S R G' },
            { type: 'sargam', title: 'Listen, then sing along', notes: 'S R G R S - - -', bpm: 72 },
            { type: 'ear', title: 'Ear training: Do, Re or Mi?', label: 'You will hear Do first, then the mystery note.', kind: 'swara', options: ['S', 'R', 'G'] },
          ],
          quiz: [
            { q: 'Which note comes after Re?', options: ['Fa', 'Mi', 'Do'], answer: 1, explain: 'Do Re Mi Fa Sol La Ti.' },
            { q: 'Why can Do be any pitch?', options: ['Because solfège names the relationships between notes', 'Because it is not a real note'], answer: 0, explain: 'Movable Do follows the key, so the same song always uses the same syllables.' },
          ],
        },
        {
          id: 'voice-fa-sol',
          title: 'Fa and Sol',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Five notes', body: `
              <p><b>Fa</b> sits just a small step above Mi — the closest neighbours so far. <b>Sol</b> is a strong, stable note: after Do it is the most important note of the scale.</p>
              <p>Do Re Mi Fa Sol are the five notes of countless children's songs and folk tunes from every continent.</p>` },
            { type: 'keyboard', title: 'Tap to hear', notes: 'S R G M P' },
            { type: 'sargam', title: 'Up to Sol and back', notes: 'S R G M P - P M G R S -', bpm: 72 },
            { type: 'ear', title: 'Ear training: which note?', label: 'Do is played first.', kind: 'swara', options: ['S', 'G', 'M', 'P'] },
          ],
          quiz: [
            { q: 'Which two notes are the closest neighbours?', options: ['Do and Re', 'Mi and Fa', 'Fa and Sol'], answer: 1, explain: 'Mi–Fa is a half step; the others are whole steps.' },
            { q: 'After Do, the most stable note of the scale is…', options: ['Sol', 'Re'], answer: 0, explain: 'Sol, the fifth note, is the scale\'s second pillar.' },
          ],
        },
        {
          id: 'voice-la-ti-do',
          title: 'La, Ti and High Do',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Completing the scale', body: `
              <p><b>La</b> and <b>Ti</b> take us to <b>high Do</b>, an octave above our Do. An octave sounds like "the same note, higher" — its vibrations are exactly twice as fast.</p>
              <p><b>Ti</b> is a half step below high Do and pulls strongly upward. Musicians call it the <b>leading note</b>: sing Ti and stop, and you will feel your ear wanting Do.</p>` },
            { type: 'keyboard', title: 'Tap to hear', notes: "P D N S'" },
            { type: 'sargam', title: 'Sol to high Do and back', notes: "P D N S' - S' N D P -", bpm: 72 },
            { type: 'ear', title: 'Ear training: which note?', kind: 'swara', options: ['P', 'D', 'N', "S'"] },
          ],
          quiz: [
            { q: 'An octave above a note vibrates…', options: ['Twice as fast', 'A little faster'], answer: 0, explain: 'The 2 : 1 ratio is why octaves sound like the same note.' },
            { q: 'Which note "leads" up to Do?', options: ['La', 'Ti', 'Sol'], answer: 1, explain: 'Ti is a half step below Do and resolves up to it.' },
          ],
        },
        {
          id: 'voice-major-scale',
          title: 'The Major Scale',
          minutes: 14,
          steps: [
            { type: 'text', title: 'Whole steps and half steps', body: `
              <p>The <b>major scale</b> — Do Re Mi Fa Sol La Ti Do — has a fixed pattern of steps:</p>
              <p class="big-line">W W H W W W H</p>
              <p>W is a whole step (two piano keys apart) and H is a half step (neighbouring keys). The half steps are <b>Mi–Fa</b> and <b>Ti–Do</b>. Any note can be Do: keep the pattern and you get a major scale in any key.</p>
              <p>Major scales sound bright and settled. In Indian music the same scale is <b>Bilawal</b>.</p>` },
            { type: 'staff', title: 'The major scale on the staff', notes: "S R G M P D N S' - - - -", bpm: 80 },
            { type: 'sargam', title: 'Up and down', notes: "S R G M P D N S' S' N D P M G R S", bpm: 72, group: 8 },
            { type: 'tip', body: `<p><b>Tune the half steps carefully.</b> Mi–Fa and Ti–Do are the notes singers most often get wrong: Mi drifts flat, Ti drifts flat. Think "Mi and Ti high and bright".</p>` },
          ],
          quiz: [
            { q: 'Where are the half steps in the major scale?', options: ['Mi–Fa and Ti–Do', 'Do–Re and Sol–La', 'There are none'], answer: 0, explain: 'W W H W W W H: half steps after Mi and after Ti.' },
            { q: 'The major scale\'s step pattern is…', options: ['W H W W H W W', 'W W H W W W H'], answer: 1, explain: 'Whole, whole, half, whole, whole, whole, half.' },
          ],
        },
      ],
    },
    {
      title: 'Level 3 · Intervals & Ear Training',
      lessons: [
        {
          id: 'voice-steps-skips',
          title: 'Steps and Skips',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Melodies move in two ways', body: `
              <ul>
                <li><b>Steps</b> — to the very next note of the scale (Do→Re, Mi→Fa). Most melodies move mainly in steps.</li>
                <li><b>Skips</b> — jumping over one or more notes (Do→Mi, Re→Sol). Skips give a melody shape and energy.</li>
              </ul>
              <p>To sing a skip in tune, hear the target note in your head <i>before</i> you sing it. If it helps, think the notes in between quickly and silently.</p>` },
            { type: 'sargam', title: 'Skipping in thirds', notes: "S G R M G P M D P N D S'", bpm: 72, group: 6 },
            { type: 'staff', title: 'The same pattern on the staff', notes: 'S G R M G P M D', bpm: 76 },
          ],
          quiz: [
            { q: 'Do → Re is a…', options: ['Step', 'Skip'], answer: 0, explain: 'Re is the very next note.' },
            { q: 'Before singing a skip, you should…', options: ['Hear the target note in your head', 'Sing louder'], answer: 0, explain: 'Pre-hearing (audiation) is the secret of accurate skips.' },
          ],
        },
        {
          id: 'voice-thirds-fifths',
          title: 'Thirds and Fifths',
          minutes: 14,
          steps: [
            { type: 'text', title: 'Naming the distance', body: `
              <p>The distance between two notes is an <b>interval</b>. Count the letter steps including both ends: Do→Mi is a <b>third</b> (Do, Re, Mi), Do→Sol a <b>fifth</b>.</p>
              <ul>
                <li><b>Major third</b> (Do→Mi): bright and happy.</li>
                <li><b>Minor third</b> (Re→Fa, La→Do): softer, a little sad — and the call of a cuckoo or a child's "na-na".</li>
                <li><b>Perfect fifth</b> (Do→Sol): open and strong, like a fanfare. It is the most consonant interval after the octave.</li>
              </ul>` },
            { type: 'sargam', title: 'Major third, perfect fifth', notes: 'S G S - S P S -', bpm: 66 },
            { type: 'ear', title: 'Ear training: Mi or Sol?', label: 'Do is played first. Is the second note a third or a fifth above?', kind: 'swara', options: ['G', 'P'] },
          ],
          quiz: [
            { q: 'Do → Sol is a…', options: ['Third', 'Fifth', 'Octave'], answer: 1, explain: 'Do Re Mi Fa Sol: five notes counting both ends.' },
            { q: 'Which third sounds brighter?', options: ['Major (Do→Mi)', 'Minor (La→Do)'], answer: 0, explain: 'The major third is wider by a half step and sounds brighter.' },
          ],
        },
        {
          id: 'voice-fourths-sixths',
          title: 'Fourths, Sixths and the Octave',
          minutes: 14,
          steps: [
            { type: 'text', title: 'Three more intervals', body: `
              <ul>
                <li><b>Perfect fourth</b> (Do→Fa): a confident upward leap — many anthems and wedding marches begin with it.</li>
                <li><b>Major sixth</b> (Do→La): wide and warm, a singing, open leap.</li>
                <li><b>Octave</b> (Do→high Do): the same note, higher. Hear it as one note doubling, not as a big climb.</li>
              </ul>` },
            { type: 'sargam', title: 'Fourth, sixth, octave', notes: "S M S - S D S - S S' S -", bpm: 66, group: 4 },
            { type: 'ear', title: 'Ear training: Fa, La or high Do?', kind: 'swara', options: ['M', 'D', "S'"] },
            { type: 'tip', body: `<p><b>Leaping up?</b> Keep the throat and jaw relaxed and let the breath carry you — don't reach with the chin. On a wide leap, aim slightly "over the top" of the note in your mind; singers usually land a little flat.</p>` },
          ],
          quiz: [
            { q: 'Do → Fa is a…', options: ['Perfect fourth', 'Perfect fifth', 'Major sixth'], answer: 0, explain: 'Do Re Mi Fa: four notes.' },
            { q: 'On wide upward leaps, singers tend to land…', options: ['Sharp', 'Flat'], answer: 1, explain: 'Think slightly higher and keep the breath moving.' },
          ],
        },
        {
          id: 'voice-ear-training',
          title: 'Ear Training: Hear It, Sing It',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Inner hearing', body: `
              <p>The best singers can <b>hear notes in their head</b> before they sing them. Musicians call this <i>audiation</i>. You train it with three habits:</p>
              <ol>
                <li><b>Echo:</b> listen to a short phrase, then sing it back from memory.</li>
                <li><b>Name it:</b> sing a phrase on note names (Do, Mi, Sol…), not on "la".</li>
                <li><b>Think it:</b> hear the next note silently, then sing it.</li>
              </ol>` },
            { type: 'sargam', title: 'Echo phrase 1', label: 'Listen once with the guide, then turn the guide off and sing it back.', notes: 'S G P G S - - -', bpm: 72 },
            { type: 'sargam', title: 'Echo phrase 2', notes: 'S D P G R - S -', bpm: 72 },
            { type: 'ear', title: 'Ear training: any note of the scale', kind: 'swara', options: ['R', 'G', 'M', 'P', 'D', 'N'] },
          ],
          quiz: [
            { q: 'Audiation means…', options: ['Hearing music in your head', 'Singing very loudly'], answer: 0, explain: 'Inner hearing lets you sing notes accurately before you produce them.' },
          ],
        },
      ],
    },
    {
      title: 'Level 4 · Scales & Colours',
      lessons: [
        {
          id: 'voice-minor',
          title: 'The Natural Minor Scale',
          minutes: 14,
          steps: [
            { type: 'text', title: 'Major and minor', body: `
              <p>Lower three notes of the major scale — Mi, La and Ti — by a half step and you get the <b>natural minor scale</b>:</p>
              <p class="big-line">Do Re Me Fa Sol Le Te Do</p>
              <p><b>Me</b>, <b>Le</b> and <b>Te</b> are the solfège names of the lowered notes. Minor sounds darker, more serious or more longing than major. (Some teachers start minor on La instead: La Ti Do Re Mi Fa Sol La — the same sound, a different naming habit.)</p>
              <p>In Indian music this scale is the <b>Asavari</b> thaat.</p>` },
            { type: 'staff', title: 'The natural minor scale', notes: "S R g M P d n S' - - - -", bpm: 80 },
            { type: 'sargam', title: 'Minor, up and down', notes: "S R g M P d n S' S' n d P M g R S", bpm: 72, group: 8 },
            { type: 'ear', title: 'Ear training: Mi or Me?', label: 'Is the third note bright (Mi) or dark (Me)?', kind: 'swara', options: ['G', 'g'] },
          ],
          quiz: [
            { q: 'Which notes are lowered in natural minor?', options: ['Mi, La, Ti', 'Re, Fa, Sol'], answer: 0, explain: 'They become Me, Le and Te.' },
            { q: 'Minor usually sounds…', options: ['Brighter than major', 'Darker than major'], answer: 1, explain: 'The lowered third especially gives minor its darker colour.' },
          ],
        },
        {
          id: 'voice-pentatonic',
          title: 'Pentatonic Scales',
          minutes: 14,
          steps: [
            { type: 'text', title: 'The world\'s favourite scale', body: `
              <p>A <b>pentatonic</b> scale has five notes. With no half steps it never clashes, which is why it appears in folk music from Scotland to China, West Africa to the Andes — and in Indian Raag <b>Bhupali</b>.</p>
              <ul>
                <li><b>Major pentatonic:</b> Do Re Mi Sol La</li>
                <li><b>Minor pentatonic:</b> Do Me Fa Sol Te — the heart of blues, rock and soul singing.</li>
              </ul>` },
            { type: 'sargam', title: 'Major pentatonic', notes: "S R G P D S' - - S' D P G R S - -", bpm: 76, group: 8 },
            { type: 'sargam', title: 'Minor pentatonic', notes: "S g M P n S' - - S' n P M g S - -", bpm: 76, group: 8 },
            { type: 'tip', body: `<p><b>Improvise!</b> Turn on the drone, pick any notes of the major pentatonic and sing freely. Nothing can sound wrong — a perfect first step into improvisation.</p>` },
          ],
          quiz: [
            { q: 'How many notes in a pentatonic scale?', options: ['Five', 'Seven', 'Twelve'], answer: 0, explain: 'Penta = five.' },
            { q: 'Major pentatonic is…', options: ['Do Re Mi Sol La', 'Do Re Mi Fa Sol'], answer: 0, explain: 'It leaves out Fa and Ti, the notes of the two half steps.' },
          ],
        },
        {
          id: 'voice-blues',
          title: 'The Blues Scale',
          minutes: 14,
          steps: [
            { type: 'text', title: 'Blue notes', body: `
              <p>Add one note to the minor pentatonic — <b>Fi</b>, between Fa and Sol — and you have the <b>blues scale</b>:</p>
              <p class="big-line">Do Me Fa Fi Sol Te Do</p>
              <p>Me, Fi and Te are the <b>blue notes</b>. Blues and jazz singers often bend into them from below, sliding up from Me towards Mi. This scale is the sound of blues, jazz, gospel, rock and R&amp;B.</p>` },
            { type: 'sargam', title: 'The blues scale', notes: "S g M m P n S' - S' n P m M g S -", bpm: 72, group: 8 },
            { type: 'tip', body: `<p><b>Bend, don't smear.</b> A blues slide is short and deliberate: start a little below the note and arrive on it. Then hold it steady.</p>` },
          ],
          quiz: [
            { q: 'The blues scale adds which note to the minor pentatonic?', options: ['Fi (between Fa and Sol)', 'Ti'], answer: 0, explain: 'The "flat five" or sharp four is the extra blue note.' },
          ],
        },
        {
          id: 'voice-chromatic',
          title: 'Half Steps: the Chromatic Scale',
          minutes: 14,
          steps: [
            { type: 'text', title: 'All twelve notes', body: `
              <p>Between Do and high Do there are <b>twelve</b> half steps. Singing them all in order is the <b>chromatic scale</b>. In this app the in-between notes are named <b>Ra, Me, Fi, Le, Te</b> (lowered Re, Mi, La, Ti and raised Fa).</p>
              <p>Half steps are the smallest interval in most music, and tuning them trains your ear more precisely than anything else.</p>` },
            { type: 'keyboard', title: 'Tap all twelve', notes: "S r R g G M m P d D n N S'" },
            { type: 'sargam', title: 'Half steps up and down', notes: 'S r R g G - G g R r S -', bpm: 60 },
            { type: 'tip', body: `<p><b>Small and slow.</b> Half steps are tiny. Practise them slowly with the pitch meter and listen for each note to "click" into place.</p>` },
          ],
          quiz: [
            { q: 'How many half steps are in an octave?', options: ['7', '8', '12'], answer: 2, explain: 'Twelve half steps make one octave.' },
          ],
        },
      ],
    },
    {
      title: 'Level 5 · Reading Music',
      lessons: [
        {
          id: 'voice-staff',
          title: 'The Staff and the Treble Clef',
          minutes: 14,
          steps: [
            { type: 'text', title: 'Five lines, four spaces', body: `
              <p>Music is written on a <b>staff</b> of five lines. Higher notes sit higher on the staff. Each line and each space is the next note of the scale.</p>
              <p>The <b>treble clef</b> (G clef) curls around the second line from the bottom, which is the note G. In the treble clef:</p>
              <ul>
                <li><b>Lines</b>, bottom to top: E G B D F — "<i>Every Good Boy Deserves Fruit</i>".</li>
                <li><b>Spaces</b>, bottom to top: F A C E — they spell "<i>FACE</i>".</li>
                <li><b>Middle C</b> sits on a short extra line just below the staff (a <i>ledger line</i>).</li>
              </ul>
              <p>We write melodies in C (so Do = C) and the app plays them in your own key. Lower voices read the treble clef an octave lower — that's normal.</p>` },
            { type: 'staff', title: 'Do Re Mi Fa Sol on the staff', notes: 'S R G M P - - -', bpm: 72 },
            { type: 'staff', title: 'Line notes and space notes', notes: "G P N R' M' - - - M D S' G' - - - -", bpm: 72 },
          ],
          quiz: [
            { q: 'Treble-clef lines from the bottom are…', options: ['E G B D F', 'F A C E', 'C D E F G'], answer: 0, explain: 'Every Good Boy Deserves Fruit.' },
            { q: 'Treble-clef spaces spell…', options: ['FACE', 'EGBDF'], answer: 0, explain: 'F A C E, bottom to top.' },
            { q: 'Middle C is written…', options: ['On a ledger line below the staff', 'On the top line'], answer: 0, explain: 'One ledger line below the treble staff.' },
          ],
        },
        {
          id: 'voice-rhythm',
          title: 'Rhythm: Beats and Note Values',
          minutes: 14,
          steps: [
            { type: 'text', title: 'Counting time', body: `
              <p>Music moves over a steady <b>beat</b>. Most songs group beats in fours: <b>1 2 3 4 | 1 2 3 4</b>. The time signature <b>4/4</b> means four beats in each bar.</p>
              <ul>
                <li><b>Whole note</b> (hollow, no stem): 4 beats</li>
                <li><b>Half note</b> (hollow, with stem): 2 beats</li>
                <li><b>Dotted half note:</b> 3 beats</li>
                <li><b>Quarter note</b> (filled, with stem): 1 beat</li>
                <li><b>Eighth notes:</b> half a beat each — count them "1 and 2 and".</li>
              </ul>` },
            { type: 'staff', title: 'Quarter, half and whole notes', notes: 'S S S S P - P - G - - - S - - -', bpm: 80 },
            { type: 'metronome', title: 'Count and clap', label: 'Count "1 2 3 4" out loud and clap on every beat, then only on beat 1.', bpm: 80 },
          ],
          quiz: [
            { q: 'A half note lasts…', options: ['1 beat', '2 beats', '4 beats'], answer: 1, explain: 'Hollow with a stem = two beats.' },
            { q: 'In 4/4 time, each bar has…', options: ['3 beats', '4 beats'], answer: 1, explain: 'The top number gives the beats per bar.' },
          ],
        },
        {
          id: 'voice-sight-steps',
          title: 'Sight-Singing 1: Stepwise Melodies',
          minutes: 15,
          steps: [
            { type: 'text', title: 'How to sight-sing', body: `
              <ol>
                <li><b>Find Do.</b> Hear your Do (or the first note) before you start.</li>
                <li><b>Read the shape.</b> Up or down? Steps or skips? Long or short notes?</li>
                <li><b>Tap the rhythm</b> once, counting the beats.</li>
                <li><b>Sing on note names</b>, slowly and steadily — keep going even if a note slips.</li>
              </ol>` },
            { type: 'staff', title: 'Melody 1', notes: 'S R G M P - P - G M R G S - - -', bpm: 72 },
            { type: 'staff', title: 'Twinkle, Twinkle, Little Star (traditional)', notes: 'S S P P D D P - M M G G R R S -', bpm: 84 },
          ],
          quiz: [
            { q: 'The first thing to do before sight-singing is…', options: ['Find Do / the first note', 'Sing as fast as possible'], answer: 0, explain: 'Every other note is measured from the home note.' },
          ],
        },
        {
          id: 'voice-sight-skips',
          title: 'Sight-Singing 2: Skips and Longer Notes',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Reading skips', body: `
              <p>On the staff, a skip of a third goes from a line to the next line (or space to space). A fifth goes line→line→line. Recognising these shapes lets you read skips at a glance.</p>
              <p>Use your <b>anchor notes</b> Do, Mi and Sol: they form the major triad, and most skips land on them.</p>` },
            { type: 'staff', title: 'Melody 2: on the triad', notes: 'S G P G S - - - P G S G P - - -', bpm: 72 },
            { type: 'staff', title: 'Ode to Joy (Beethoven, simplified)', notes: 'G G M P P M G R S S R G G - R -', bpm: 84 },
          ],
          quiz: [
            { q: 'A skip of a third on the staff goes…', options: ['From a line to the next line', 'From a line to the next space'], answer: 0, explain: 'Line to line (or space to space) is a third; line to space is a step.' },
            { q: 'Do, Mi and Sol together form…', options: ['The major triad', 'The chromatic scale'], answer: 0, explain: 'They are the notes of the major chord.' },
          ],
        },
      ],
    },
    {
      title: 'Level 6 · Vocal Technique',
      lessons: [
        {
          id: 'voice-registers',
          title: 'Chest, Head and Mixed Voice',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Registers', body: `
              <ul>
                <li><b>Chest voice</b> — your speaking range: full and strong; you feel vibration in your chest.</li>
                <li><b>Head voice</b> — higher, lighter and ringing; the vibration moves up into your head.</li>
                <li><b>Mixed voice</b> — a blend of both, so you can sing high with strength and without strain.</li>
              </ul>
              <p>Between chest and head most voices have a <b>break</b> (<i>passaggio</i>) where the voice wants to flip or crack. Training smooths it out.</p>` },
            { type: 'text', title: 'Smoothing the break', body: `
              <ol>
                <li><b>Sirens on "ng" or "woo"</b> through the break, lightly and slowly.</li>
                <li><b>Lip trills</b> up and down an octave.</li>
                <li><b>Lighten as you rise:</b> sing less heavily as you go up instead of pushing more air.</li>
                <li>Practise <b>"nay" or "gee"</b> on five-note scales around the break — these sounds help the mix.</li>
              </ol>` },
            { type: 'sargam', title: 'An octave arpeggio', notes: "S G P S' P G S -", bpm: 66 },
          ],
          quiz: [
            { q: 'The break between registers is called…', options: ['Passaggio', 'Vibrato', 'Legato'], answer: 0, explain: 'Passaggio means "passage" in Italian.' },
            { q: 'To sing higher smoothly you should…', options: ['Push more air', 'Lighten the sound as you rise'], answer: 1, explain: 'Pushing makes the break worse; lightening lets the mix form.' },
          ],
        },
        {
          id: 'voice-resonance',
          title: 'Resonance and Vowels',
          minutes: 14,
          steps: [
            { type: 'text', title: 'An open, ringing tone', body: `
              <ul>
                <li><b>Open throat:</b> the feeling at the start of a yawn — soft palate lifted, jaw loose.</li>
                <li><b>Forward buzz:</b> hum "mmm" and feel the vibration on the lips and around the nose (singers call it "the mask"). Keep that buzz when you open to a vowel.</li>
                <li><b>Pure vowels:</b> most languages build singing on five vowels — <b>ee, eh, ah, oh, oo</b>. Keep each one pure and steady through a long note.</li>
              </ul>
              <p>On very high notes, open the vowel a little ("ee" toward "ih", "oo" toward "oh"). This <i>vowel modification</i> keeps the tone free.</p>` },
            { type: 'sargam', title: 'One note, five vowels', label: 'Sing each note on ee – eh – ah – oh – oo, keeping the same ring.', notes: 'P - - - - G - - - - S - - - -', bpm: 72 },
            { type: 'tuner', title: 'Check that the pitch stays still as the vowel changes', mode: 'voice' },
          ],
          quiz: [
            { q: 'The five pure vowels singers use are…', options: ['ee, eh, ah, oh, oo', 'a, b, c, d, e'], answer: 0, explain: 'Pure vowels are the basis of singing tone in most languages.' },
            { q: 'On very high notes, vowels should be…', options: ['Opened a little', 'Squeezed narrower'], answer: 0, explain: 'Slightly opening the vowel keeps the throat free.' },
          ],
        },
        {
          id: 'voice-diction',
          title: 'Diction: Clear Words',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Sing on the vowels', body: `
              <p>The sound of singing travels on the <b>vowels</b>. Consonants are short and crisp: put them <b>late</b> (at the very end of a note) and <b>quickly</b>, then get back to the vowel.</p>
              <ul>
                <li>Hold the vowel of "<i>love</i>" — "luh…v" — not "lllove".</li>
                <li>Final consonants (t, d, k, s) must be heard but light — the audience needs them to understand the words.</li>
                <li>Keep the jaw loose and the tongue tip relaxed behind the bottom teeth.</li>
              </ul>` },
            { type: 'text', title: 'Diction warm-ups', body: `
              <ul>
                <li>"<i>Red leather, yellow leather</i>" — slowly, then faster.</li>
                <li>"<i>Unique New York</i>" — repeat five times, crisp but relaxed.</li>
                <li>Sing a scale on "da-da-da" and then "la-la-la" — tongue only, jaw still.</li>
              </ul>` },
            { type: 'sargam', title: 'Re-strike each note', label: 'Sing "da" on every note, re-starting each one cleanly.', notes: 'S S R R G G M M P P M M G G R R', bpm: 88, group: 8 },
          ],
          quiz: [
            { q: 'Sustained singing tone is carried by…', options: ['Vowels', 'Consonants'], answer: 0, explain: 'Hold the vowels; make consonants quick and crisp.' },
          ],
        },
        {
          id: 'voice-dynamics',
          title: 'Dynamics and Phrasing',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Loud and soft', body: `
              <p><b>Dynamics</b> are written in Italian:</p>
              <ul>
                <li><b><i>pp</i></b> pianissimo — very soft; <b><i>p</i></b> piano — soft; <b><i>mp, mf</i></b> — medium soft, medium loud</li>
                <li><b><i>f</i></b> forte — loud; <b><i>ff</i></b> fortissimo — very loud</li>
                <li><b>crescendo</b> &lt; — get louder; <b>decrescendo</b> &gt; — get softer</li>
              </ul>
              <p>Volume comes from <b>breath energy</b>, not from squeezing the throat. A soft note needs as much support as a loud one.</p>` },
            { type: 'text', title: 'Shape every phrase', body: `
              <p>A musical phrase is like a sentence: it has a direction and a most important word. Breathe at the end of phrases (never in the middle of a word), grow towards the high point, and let the end of the phrase relax.</p>
              <p><b>Messa di voce</b> — start a long note softly, swell to loud, then return to soft — is the classic exercise for control.</p>` },
            { type: 'sargam', title: 'Messa di voce on Sol', label: 'One long note: soft → loud → soft, without changing pitch.', notes: 'P - - - - - - -', bpm: 60 },
          ],
          quiz: [
            { q: '"p" in music means…', options: ['Soft', 'Loud'], answer: 0, explain: 'Piano = soft.' },
            { q: 'Loud singing should come from…', options: ['More breath energy', 'Squeezing the throat'], answer: 0, explain: 'Support creates volume safely.' },
          ],
        },
        {
          id: 'voice-vibrato',
          title: 'Vibrato',
          minutes: 12,
          steps: [
            { type: 'text', title: 'A natural shimmer', body: `
              <p><b>Vibrato</b> is a small, regular wave in pitch — about <b>5 to 7 times a second</b> — that appears naturally when a free voice is well supported. It is not something you add with the jaw or the belly.</p>
              <ul>
                <li>First master a <b>straight, steady tone</b>.</li>
                <li>Then sing long notes with relaxed throat and steady breath; vibrato often appears on its own.</li>
                <li>Too fast and narrow (a "bleat") or too slow and wide (a "wobble") both come from tension or weak support.</li>
              </ul>
              <p>Many styles choose: classical singers use vibrato almost always; pop, folk and early-music singers often start straight and let vibrato bloom at the end of a note.</p>` },
            { type: 'tuner', title: 'Watch your vibrato', mode: 'voice', label: 'Sing a long note: a gentle, even wave on the meter is healthy vibrato.' },
          ],
          quiz: [
            { q: 'Healthy vibrato is about…', options: ['5–7 waves a second', '20 waves a second', '1 wave a second'], answer: 0, explain: 'Faster sounds like a bleat, slower like a wobble.' },
            { q: 'Vibrato should come from…', options: ['A free, supported voice', 'Shaking the jaw'], answer: 0, explain: 'It appears naturally when there is no tension.' },
          ],
        },
        {
          id: 'voice-agility',
          title: 'Agility: Runs and Riffs',
          minutes: 14,
          steps: [
            { type: 'text', title: 'Fast notes, clean notes', body: `
              <p>Runs (in pop, R&amp;B and gospel) and <i>coloratura</i> (in classical singing) are quick note patterns. The secret is the same everywhere:</p>
              <ol>
                <li>Learn the pattern <b>slowly</b>, every note exact.</li>
                <li>Sing it on a light "ah" with a relaxed jaw.</li>
                <li>Speed up a little at a time with a metronome.</li>
                <li>Keep it <b>light</b> — fast singing is never heavy singing.</li>
              </ol>` },
            { type: 'sargam', title: 'A five-note run', notes: 'S R G M P M G R S - - -', bpm: 100 },
            { type: 'sargam', title: 'A pentatonic riff', notes: "S' D P G R S - - R G P D S' - - -", bpm: 100, group: 8 },
          ],
          quiz: [
            { q: 'The best way to learn a fast run is…', options: ['Slowly first, then faster', 'At full speed from the start'], answer: 0, explain: 'Accuracy first; speed comes from repetition.' },
          ],
        },
      ],
    },
    {
      title: 'Level 7 · Artistry',
      lessons: [
        {
          id: 'voice-harmony',
          title: 'Singing Harmony',
          minutes: 15,
          steps: [
            { type: 'text', title: 'Two notes at once', body: `
              <p><b>Harmony</b> is two or more different notes sounding together. The easiest harmony line moves <b>a third above</b> the melody: when the melody sings Do, you sing Mi; Re → Fa; Mi → Sol.</p>
              <p>Singing harmony is hard at first because your ear is pulled toward the melody. Tips:</p>
              <ul>
                <li>Learn your harmony line alone first, until you know it well.</li>
                <li>Then sing it softly against the melody, listening to both.</li>
                <li>Cover one ear with your hand — you'll hear yourself more clearly.</li>
              </ul>` },
            { type: 'sargam', title: 'The melody', notes: 'S R G R S - - -', bpm: 72 },
            { type: 'sargam', title: 'Your harmony: a third above', notes: 'G M P M G - - -', bpm: 72 },
            { type: 'ear', title: 'Ear training: major or minor chord?', label: 'Major chords sound bright, minor chords darker.', kind: 'chord', options: [{ label: 'Major (bright)', values: ['C', 'G', 'D'] }, { label: 'Minor (darker)', values: ['Am', 'Em', 'Dm'] }] },
          ],
          quiz: [
            { q: 'A harmony a third above Do is…', options: ['Mi', 'Re', 'Sol'], answer: 0, explain: 'Do Re Mi: a third.' },
            { q: 'A good way to learn a harmony line is…', options: ['Learn it alone first', 'Sing it loud over the melody right away'], answer: 0, explain: 'Know your line securely before adding the melody.' },
          ],
        },
        {
          id: 'voice-song-learning',
          title: 'Learning a Song Like a Pro',
          minutes: 14,
          steps: [
            { type: 'text', title: 'Seven steps', body: `
              <ol>
                <li><b>Listen</b> to the song several times without singing.</li>
                <li><b>Speak the words</b> in rhythm, like a poem. Understand what they mean.</li>
                <li><b>Sing the melody on "la"</b> (or on note names) without the words.</li>
                <li><b>Put words and melody together</b>, slowly, one phrase at a time.</li>
                <li><b>Mark your breaths</b> — at the ends of phrases.</li>
                <li><b>Record yourself</b> and listen back honestly. The app's Sing-along Studio and "Sing with your own track" show your pitch line and let you save your take.</li>
                <li><b>Choose a key</b> that suits your voice — move Do until the highest and lowest notes are comfortable.</li>
              </ol>` },
            { type: 'staff', title: 'Practice phrase', notes: 'S R G S G R S - P M G R S - - -', bpm: 76 },
            { type: 'tip', body: `<p><b>Sing what the words mean.</b> Once the notes are secure, think of the story and the feeling. Audiences remember emotion more than perfect notes.</p>` },
          ],
          quiz: [
            { q: 'Where should you breathe in a song?', options: ['At the ends of phrases', 'In the middle of words'], answer: 0, explain: 'Breathe where the sentence would pause.' },
            { q: 'Why record yourself?', options: ['To hear yourself as others do', 'It is not useful'], answer: 0, explain: 'You hear yourself differently while singing; recordings are honest.' },
          ],
        },
        {
          id: 'voice-performance',
          title: 'Performance, Microphone and Nerves',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Using a microphone', body: `
              <ul>
                <li>Hold it about a hand's width from your mouth, pointing at your mouth.</li>
                <li>Move it slightly away on loud, high notes and closer on soft ones.</li>
                <li>Never point it at a speaker (that causes the squeal of feedback).</li>
              </ul>` },
            { type: 'text', title: 'Calming nerves', body: `
              <ul>
                <li><b>Prepare well</b> — confidence comes from knowing the song deeply.</li>
                <li><b>Slow breathing:</b> breathe in for 4, out for 8, three times before you start.</li>
                <li><b>Focus on the message</b>, not on yourself.</li>
                <li>Mistakes happen to everyone — keep going, and the audience usually won't notice.</li>
              </ul>` },
            { type: 'breath', title: 'Calming breath 4 – 0 – 8', inhale: 4, hold: 0, exhale: 8, rounds: 3 },
          ],
          quiz: [
            { q: 'On a loud high note, the microphone should be…', options: ['Moved slightly away', 'Pushed closer'], answer: 0, explain: 'This keeps the sound even and avoids distortion.' },
            { q: 'If you make a mistake on stage…', options: ['Keep going', 'Stop and start again'], answer: 0, explain: 'Carrying on is what professionals do.' },
          ],
        },
        {
          id: 'voice-health',
          title: 'Vocal Health and Your Daily Routine',
          minutes: 12,
          steps: [
            { type: 'text', title: 'Keep your voice healthy', body: `
              <ul>
                <li><b>Hydrate:</b> drink water through the day; steam helps a dry or tired voice.</li>
                <li><b>Rest:</b> sleep well, and give your voice quiet time after long singing.</li>
                <li><b>Don't shout or whisper hard</b> — both strain the folds.</li>
                <li>Avoid singing through pain. <b>Hoarseness that lasts more than two weeks</b> needs a doctor (an ENT specialist).</li>
              </ul>` },
            { type: 'text', title: 'A 20-minute daily routine', body: `
              <ol>
                <li><b>2 min</b> — posture and breathing (4-4-8).</li>
                <li><b>4 min</b> — lip trills, straw or humming, sirens.</li>
                <li><b>5 min</b> — scales and intervals on note names.</li>
                <li><b>6 min</b> — one technique focus (registers, vowels, agility…).</li>
                <li><b>3 min</b> — a song, then a gentle hum to cool down.</li>
              </ol>
              <p>A little every day beats a lot once a week.</p>` },
            { type: 'timer', minutes: 20, tasks: ['Posture & breathing', 'Lip trills, straw, sirens', 'Scales & intervals', 'Technique focus', 'A song + cool-down hum'] },
          ],
          quiz: [
            { q: 'Hoarseness lasting over two weeks means…', options: ['See a doctor', 'Sing more to fix it'], answer: 0, explain: 'Persistent hoarseness should be checked by an ENT specialist.' },
            { q: 'What builds a voice best?', options: ['A little practice every day', 'One long session a week'], answer: 0, explain: 'Muscles and ears learn from regular, short practice.' },
          ],
        },
      ],
    },
  ],
};
