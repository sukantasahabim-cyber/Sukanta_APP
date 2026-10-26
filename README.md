# SurTaal — Learn Singing, Tabla & Guitar

A step-by-step music learning app for complete beginners. It has three courses, each starting from the very first lesson:

| Course | Levels | What you learn |
|---|---|---|
| 🎤 **Singing** (15 lessons) | Voice foundations → Seven swaras → Alankars → Toward raag | Breathing, warm-ups, finding your Sa, sargam, aroha/avaroha, alankars 1–5, komal & tivra swaras, Raag Bhupali and Yaman, daily riyaz |
| 🥁 **Tabla** (16 lessons) | Foundations → Rhythm & taal → Building skill | Parts of the tabla, posture, bols (Na, Tin, Tu, Ti, Ge, Ke, Dha, Dhin), matra/vibhag/sam/khali, Keherwa, Dadra, Teentaal, Rupak, Jhaptaal, Ektaal, layakari, TiRaKiTa, kaida, tihai, accompaniment |
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
- **Progress tracking:** day streak, minutes per day, and course completion, all saved on your device.
- Works on phones, tablets and computers, in light and dark mode. You can install it as an app (PWA), and it works offline after the first visit.

## Run it

No build step and no dependencies are needed. Serve the folder with any static web server:

```bash
npm start            # same as: python3 -m http.server 8080
# then open http://localhost:8080
```

The microphone features (tuner and pitch trainer) need `localhost` or an `https://` address.

### Publish with GitHub Pages

The workflow in `.github/workflows/pages.yml` runs the tests on every pull request and publishes the app whenever `main` changes. Turn it on once: repository **Settings → Pages → Source: GitHub Actions**. The app will then be live at `https://<user>.github.io/<repo>/` — open that link on your phone and choose "Add to Home screen" to install it.

## Tests

```bash
npm test
```

This runs tests for the pitch detector, onset detector, note tracker, rhythm scoring, chord recognition and stroke recognition (on synthesised audio), the music-notation helpers, and a check over all course and practical-exercise data.

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
sw.js, manifest.webmanifest    Offline support / installable app
```

### Adding a lesson

Lessons are plain data in `js/data/<course>.js`. Each lesson has `steps` (for example `text`, `bols`, `theka`, `chords`, `progression`, `tab`, `sargam`, `pitch` or `timer`) and an optional `quiz`. Swara notation: `S R G M P D N`; lowercase `r g d n` are komal; `m` is tivra Ma; `.N` is the lower octave and `S'` is the upper octave. Run `npm test` to validate your changes. If you add a new file, also list it in `sw.js`.
