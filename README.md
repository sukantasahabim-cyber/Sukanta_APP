# SurTaal — Learn Singing, Tabla & Guitar

A step-by-step music learning app for complete beginners, with courses that each start from the very first lesson.

> **Testing mode: every lesson is unlocked** (`UNLOCK_ALL` in `js/data/courses.js`). Set it to `false` to go back to unlocking one lesson at a time.
>
> **Currently shown: Singing, World Singing and Tabla.** The Guitar course is switched off for now. Its lessons, exercises, translations and tests are all still in the code. To bring it back, remove `'guitar'` from `HIDDEN` in `js/data/courses.js`; the guitar tuner, chord library and chord ear-training return with it.


| Course | Levels | What you learn |
|---|---|---|
| 🎤 **Singing** (38 lessons) | Voice foundations → Seven swaras → Alankars → Toward raag → Raags of the day → Voice skills & ornaments → Afternoon & night raags → Khayal → Master raags & light classical | Breathing, warm-ups, finding your Sa, sargam, aroha/avaroha, alankars 1–8 and merukhand, komal & tivra swaras, meend, kan, murki, taan, a sargam geet in Teentaal, Raags Bhupali, Yaman, Bhairav, Kafi, Khamaj, Durga, Bhimpalasi, Bageshree, Malkauns, Des, Bhairavi, Todi, Darbari Kanada and Marwa, daily riyaz; khayal (bandish, sthayi, antara, mukhda), alaap and badhat, sapaat/alankarik/kut/bol-taans, layakari and sung tihais, tarana, thumri/dadra/bhajan, building a concert |
| 🌍 **World Singing** (30 lessons) | Your voice → Do Re Mi → Intervals & ear training → Scales & colours → Reading music → Vocal technique → Artistry | Posture and breath support, warm-ups, matching pitch, movable-do solfège, the major scale, steps and skips, thirds/fifths/fourths/sixths/octaves, audiation, natural minor, pentatonic, blues and chromatic scales, the staff and treble clef, note values and rhythm, sight-singing, chest/head/mixed voice, resonance and vowels, diction, dynamics, vibrato, runs, harmony, learning a song, microphone and stage nerves, vocal health and a daily routine |
| 🥁 **Tabla** (35 lessons) | Foundations → Rhythm & taal → Building skill → Kaidas & relas → More taals → Performance → Mastery | Parts of the tabla, posture, bols (Na, Tin, Tu, Ti, Ge, Ke, Dha, Dhin), matra/vibhag/sam/khali, Keherwa, Dadra, Teentaal, Rupak, Jhaptaal, Ektaal, Deepchandi, Dhamar, Tilwada, Jhoomra, layakari, TiRaKiTa, kaidas with paltas, rela, mukhda, tukda, tihai, chakradar, peshkar, tigun, laggi, building a solo, the six gharanas, accompaniment; gats, parans, aad/kuad/biaad, vilambit and thumri accompaniment, designing tihais, farmaishi chakradars, an expert's riyaz |
| 🎸 **Guitar** (16 lessons) | Getting started → First chords & strumming → Growing as a player | Parts and posture, tuning, reading chord diagrams and tabs, finger exercises, Em Am E A D G C Dm F, strumming patterns, chord changes, first songs, 12-bar blues, power chords, minor pentatonic, barre chords |

Every lesson has **two modes**:

- **📖 Theory** — short steps (explanations, sounds to listen to, diagrams, play-along players) and a quiz. Pass the quiz to unlock the next lesson.
- **🎯 Practical** — you play or sing, and the app **listens through the microphone and marks each part correct ✓ or wrong ✗**, with advice on what to fix.

| Instrument | What Practical mode checks |
|---|---|
| Singing | Each swara you sing (in tune within ±40 cents of your Sa, any octave), holding a steady note, your vocal range |
| Tabla | Timing of every stroke after a count-in (early / late / missed / extra), your tempo, and the stroke's sound: both drums (Dha/Dhin), bayan only (Ge), dayan only (Na/Tin), closed (Ti/Te) or slap (Ke/Ka) |
| Guitar | Single notes from tab, tuning (±10 cents), whole chords by strumming, each string of a chord one by one (finds the exact wrong or muted string), chord changes, strumming rhythm |

In rhythm practicals the app also shows **where you went out of sync with the music**. While you play, a beat that passes without a stroke turns red straight away. Afterwards a **sync map** draws the music as a timeline with a dot for every stroke it heard. Dots shift left or right when you were early or late, a red band marks a missing stroke and a diamond marks an extra one. Below the map is a plain list, such as "Missing at beat 2&, 4" or "Beat 6: late by 180 ms".

Practical results (best score, passed ✓) are saved per exercise; the Practical tab lists every lesson's exercises.

**🩺 What to fix** is for the days between classes, when no teacher is there. Every practical attempt also saves what the app heard: each swara and how many cents off it was, how steady held notes were, and each tabla stroke (on time, early, late, missed or the wrong sound) with the tempo played. From the last 7 days the app picks out the mistakes that keep coming back, such as "Ga comes out low" or "Na comes late", and shows them on the home page, on each practical page and under Practical → What to fix. Each one shows the first day against the latest ("First day: 29¢ low · Latest: 15¢ low") and opens a short drill: holding and singing the swara for pitch, or the same tabla exercise starting slower and going up 5 BPM each time it is passed. A mistake counts as fixed once the last three tries are right. All of this runs on the phone with no AI, and attempts are kept for 30 days (they sync with the rest of the progress).

After each attempt, **🎧 Hear your attempt** plays back what the microphone recorded. The **🎙️ Microphone check** (on every practical page and in Tools) measures room noise and how loudly you are heard, then recommends a sensitivity: *Quiet room / soft playing*, *Normal* or *Noisy room*.

## Languages

The whole app, including every lesson, quiz and practical exercise, is available in **English, বাংলা (Bengali) and हिन्दी (Hindi)**. On the first visit it asks which language to use. You can switch at any time with the EN / বাং / हिं buttons at the top or on the Progress page.

To change or add a translation:
- Interface text: `js/i18n/en.js` is the source; `bn.js` and `hi.js` hold the same keys (with `{placeholders}`).
- Lesson text: `js/i18n/content-bn.js` / `content-hi.js` and the per-course files in `js/i18n/bn/` and `js/i18n/hi/`.
- Names of swaras, bols and taals: `js/i18n/names.js`.

`npm test` checks that every language has every key and every lesson, with the same placeholders.

## Interactive features

All sounds are synthesised in the browser with the Web Audio API, so there are no audio files to download.

- **Tabla bols & taal player:** hear every stroke and loop any theka with beat highlighting. A "hand count" mode claps the taali and waves the khali.
- **Bol sequences** with thah / dugun / chaugun speed switching.
- **Guitar chord diagrams** you can strum or play string by string, a **strumming-pattern trainer**, a **chord-progression player** and **playable tabs**.
- **Guitar tuner** using the microphone.
- **Tanpura drone** tuned to *your* Sa, a **Sa picker** with male/female/child presets, a **swara keyboard** and a **sargam player** (optionally with tabla accompaniment).
- **Sing-and-check pitch trainer:** the microphone listens and tells you whether each swara is in tune.
- **Guided breathing**, a **metronome** and **practice timers** that log your minutes.
- **Sing-along Studio (karaoke that listens):** sing 13 songs — original Hindi film-style songs (romantic, rain song, ghazal, dance, friendship), Bengali songs (Pujo song, Baul-style, folk), an English song, a sargam song, and traditional texts by Kabir and Meerabai set to new melodies — with guide voice, tabla and tanpura, in your own key. A live pitch line shows your voice against the target notes, each note turns green or red, automatic sync corrects headphone/Bluetooth delay, any line can be looped for practice, and the results list the lines to work on.
- **Watch demo** in every singing and tabla practical: an animated tabla lights up where each finger strikes (with the stroke explained) in time with the sound, and singing exercises draw the pitch line a good voice makes on the swara bands while the guide sings — with a slow mode. Each practical also links to teacher video lessons on YouTube.
- **Sing with your own track:** play a song or karaoke file from your own device (never uploaded) or paste a YouTube link (played in YouTube's own embedded player — nothing is downloaded), remove the original singer from stereo files, and watch your voice live on the swara lines with a steadiness score and your range. Afterwards, hear your full recording, hear it mixed with the music (original singer filtered out, with voice level, timing and reverb controls), and save your voice — or your voice plus the music — as an MP3 file. With a YouTube video, SurTaal replays your voice in step with the video in YouTube's player and can save your voice only (a YouTube video's sound is never captured). Paste the lyrics to read along. A **Download songs** section renders any SurTaal song (built-in or your own) as a backing track — tabla, tanpura and optional harmonium melody, in your key — to sing over at once or save as an MP3 file, lists sites with legally free music, and can remove the original singer automatically when you open a song file.
- **Table Tabla (no tabla needed):** play tabla on a table, a box or your lap. The microphone hears each stroke, tells a right-hand fingertip tap from a left-hand palm thump or both hands together (after the learner shows it their own three strokes once), and plays the matching tabla sound at once: Na or Tin on the right, Ge or Ke on the left, Dha or Dhin with both. In *Play a theka* each stroke plays the next bol of Keherwa, Dadra, Rupak, Jhaptaal, Teentaal, Ektaal or a lesson's exercise, with a check of the hand used and, with the beat click, of the timing. The drums can also be tapped on screen.
- **Music Studio (compose your own music):** tap notes onto a grid to write a melody in any of 12 scales and raags (Bilawal, Kalyan, Bhupali, Bhairav, Malkauns, blues and more), add a second part, a tabla taal or your own drum pattern, and a tanpura drone. Choose harmonium, bansuri, sitar or bells, set the tempo and key, then play it, download it as an MP3, sing over it, turn it into a song to practise with scoring, or share it as a link. Three original examples show how. Compositions are kept only on your device.
- **My Songs:** type in the notes (with a swara keypad) and words of any song you are learning; SurTaal checks it line by line, then you sing it in the Sing-along Studio with pitch bars, tabla and scoring. Kept only on your device.
- **Lehra player:** a looping harmonium melody (one taal cycle, in a raag) with optional tabla theka, for practising solos — Teentaal, Ektaal, Jhaptaal, Rupak, Keherwa, Dadra and Deepchandi.
- **Note names:** show every note as **Sa Re Ga** (sargam), **Do Re Mi** (movable-do solfège) or **C D E** (letter names spelled in your key) — in Progress → Settings. *Automatic* uses sargam in the Indian classical courses and solfège in World Singing.
- **Staff notation:** melodies drawn on a treble staff with note names underneath; *Hear it* plays them in your key while the notes light up. Rhythm practicals in World Singing are clapped.
- **Badges:** 16 rewards for lessons, practicals, practice time and day streaks, shown on the Progress page.
- **Progress tracking:** day streak, minutes per day, and course completion, all saved on your device.
- **AI Teacher (optional):** ask any question about singing, tabla or your practice, in English, Bengali or Hindi. It knows the lesson you are on and your scores, and after any practical it can turn your result into tips. Answers come from Google Gemini through SurTaal's own server, so the key is never in the app.
- **Account & sync (optional):** sign in with a code sent to your email to save progress online and carry it across phones and computers. Merging keeps every finished lesson and best score from both sides. You can delete your account in the app.
- **iPhone app:** the same app packaged for iOS (in `ios/`) and built for TestFlight in GitHub Actions.
- Works on phones, tablets and computers, in light and dark mode. You can install it as an app (PWA), and it works offline after the first visit.

## Run it

No build step and no dependencies are needed. Serve the folder with any static web server:

```bash
npm start            # same as: python3 -m http.server 8080
# then open http://localhost:8080
```

The microphone features (tuner and pitch trainer) need `localhost` or an `https://` address.

### Online features (Cloudflare, Supabase, Gemini, TestFlight)

The AI teacher, accounts, your own domain and the iPhone app need accounts with those services. **[docs/SETUP.md](docs/SETUP.md)** walks through each one, step by step. Until they are set up, those features stay hidden and everything else works as before.

### Publish with GitHub Pages

The workflow in `.github/workflows/pages.yml` runs the tests on every pull request and publishes the app whenever `main` changes. Turn it on once: repository **Settings → Pages → Source: GitHub Actions**. The app will then be live at `https://<user>.github.io/<repo>/` — open that link on your phone and choose "Add to Home screen" to install it.

## Tests

```bash
npm test
```

This runs tests for the Cloudflare server (with Gemini and Supabase faked), progress merging for sync, the pitch detector, onset detector, note tracker, rhythm scoring, chord recognition and stroke recognition (on synthesised audio), the music-notation helpers, and a check over all course and practical-exercise data.

### How the listening works

`js/audio/listen.js` captures the microphone with an AudioWorklet and feeds `js/analysis/`:
onset detection (strokes, plucks, strums), McLeod pitch detection (voice and single notes), chroma + bass profiles compared with synthesised chord profiles (chords), band-energy ring analysis (tabla stroke families) and a fitted beat grid (rhythm), so a constant microphone delay or a slightly different tempo is not marked wrong.

Accuracy notes: everything was verified with synthesised instruments and a simulated microphone. Real instruments, rooms and microphones vary, so thresholds are deliberately lenient; tabla stroke-sound checking can be switched off per exercise.

## Project layout

```
index.html, css/styles.css     App shell and styles
js/main.js                     Hash router, language chooser
js/i18n/                       Translations (English, Bengali, Hindi)
js/store.js                    Progress, practice log, settings (localStorage)
js/music.js                    Note math and swara notation
js/audio/                      Synths (tabla, guitar, voice/tanpura), scheduler, microphone capture, pitch detection
js/analysis/                   Onsets, notes, rhythm, chords and tabla-stroke recognition (pure, tested)
js/data/                       Courses (singing, tabla, guitar), practical exercises, taals, chords
js/widgets/                    Interactive lesson steps
js/views/                      Home, course, lesson, tools, progress screens
js/online/, js/config.js       Optional account, sync and AI teacher (see docs/SETUP.md)
sw.js, manifest.webmanifest    Offline support / installable app
worker/, wrangler.jsonc        Cloudflare Worker: serves the app and the AI teacher's /api/ai
supabase/setup.sql             Database table and rules for accounts
scripts/build.mjs              Copies the app into dist/ for publishing
ios/, capacitor.config.json    iPhone app (Capacitor); built by .github/workflows/ios-testflight.yml
```

### Adding a lesson

Lessons are plain data in `js/data/<course>.js`. Each lesson has `steps` (for example `text`, `bols`, `theka`, `chords`, `progression`, `tab`, `sargam`, `pitch` or `timer`) and an optional `quiz`. Swara notation: `S R G M P D N`; lowercase `r g d n` are komal; `m` is tivra Ma; `.N` is the lower octave and `S'` is the upper octave. Run `npm test` to validate your changes. If you add a new file, also list it in `sw.js`.

Sign-in and sync use [supabase-js](https://github.com/supabase/supabase-js) (MIT), bundled in `js/vendor/` and loaded only when accounts are switched on.

MP3 files are made on the device with [lamejs](https://github.com/shijinyu/lamejs) (a JavaScript port of LAME, LGPL-3.0), bundled unmodified in `js/vendor/` (licence in `licenses/`).
