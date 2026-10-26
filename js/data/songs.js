// Sing-along songs: original compositions written for SurTaal.
//
// Each line holds one token per beat: a swara (sung on that beat) or "-"
// (hold the previous note). `lyrics` gives one syllable per token, with "_"
// on holds; `roman` is the same in Latin letters for readers of other
// scripts. A song without lyrics is sung in sargam (the note names).
// A line's length is a whole number of taal cycles.

const line = (notes, lyrics = null, roman = null) => ({
  notes: notes.trim().split(/\s+/),
  lyrics: lyrics && lyrics.trim().split(/\s+/),
  roman: roman && roman.trim().split(/\s+/),
});

export const SONGS = [
  {
    id: 'sargam-song',
    title: { en: 'The Sargam Song', bn: 'সরগমের গান', hi: 'सरगम का गीत' },
    about: {
      en: 'Warm up with the seven swaras: up, down and in little jumps. Perfect for beginners.',
      bn: 'সাতটি স্বর দিয়ে গলা তৈরি করুন: ওঠা, নামা আর ছোট ছোট লাফ। শিক্ষানবিশদের জন্য আদর্শ।',
      hi: 'सात स्वरों से गला तैयार करें: चढ़ना, उतरना और छोटी छलाँगें। शुरुआत करने वालों के लिए बढ़िया।',
    },
    language: 'sargam', raag: 'Bilawal', taal: 'keherwa', bpm: 80, level: 1,
    lines: [
      line('S R G M P - - -'),
      line("P D N S' S' - - -"),
      line("S' N D P M G R -"),
      line('G M G R S - - -'),
      line('S G R M G P M D'),
      line("P N D S' S' - - -"),
      line("S' D N P D M P G"),
      line('M R G R S - - -'),
    ],
  },
  {
    id: 'deep-jalao',
    title: { en: 'Light the Lamp (bhajan)', bn: 'প্রদীপ জ্বালাও (ভজন)', hi: 'दीप जलाओ (भजन)' },
    about: {
      en: 'A gentle Hindi bhajan in Raag Bhupali: light a lamp in your heart, sing together and embrace everyone.',
      bn: 'রাগ ভূপালিতে একটি কোমল হিন্দি ভজন: মনে প্রদীপ জ্বালাও, সবাই মিলে গাও, সবাইকে আপন করো।',
      hi: 'राग भूपाली में एक कोमल भजन: मन में दीप जलाओ, सब मिलकर गाओ और सबको गले लगाओ।',
    },
    language: 'hi', raag: 'Bhupali', taal: 'keherwa', bpm: 72, level: 1,
    lines: [
      line('G G R S R G P G', 'मन के आँ गन दी प ज लाओ', 'man ke aan gan dee p ja laao'),
      line('P D P G R G R S', 'प्रे म के सुर सब मिल गा ओ', 'pre m ke sur sab mil gaa o'),
      line("P P D S' S' D P G", 'हर दिन न या स वे रा लाओ', 'har din na yaa sa ve raa laao'),
      line('G P G R S R .D S', 'सब को अप ने ग ले ल गाओ', 'sab ko ap ne ga le la gaao'),
    ],
  },
  {
    id: 'nodir-dhare',
    title: { en: 'By the River (folk song)', bn: 'নদীর ধারে (লোকগীতি)', hi: 'नदी के किनारे (लोकगीत)' },
    about: {
      en: 'A Bengali folk-style song in Raag Kafi and Dadra: a flute plays by the river and the heart floats home on the tune.',
      bn: 'রাগ কাফি আর দাদরায় বাংলা লোকগীতির ঢঙে: নদীর ধারে বাঁশি বাজে, সুরের ভেলায় মন ঘরে ফেরে।',
      hi: 'राग काफ़ी और दादरा में बांग्ला लोकगीत की शैली में: नदी किनारे बाँसुरी बजती है और मन सुर की नाव पर घर लौटता है।',
    },
    language: 'bn', raag: 'Kafi', taal: 'dadra', bpm: 90, level: 2,
    lines: [
      line('P D n D P M g R - - - -', 'ন দীর ধা রে বাঁ শি বা জে _ _ _ _', 'no deer dha re ban shi ba je _ _ _ _'),
      line('R g M P D n D P - - - -', 'মন যে আ মার উ ড়ে চ লে _ _ _ _', 'mon je a mar u re cho le _ _ _ _'),
      line("P n S' S' n D P M - - - -", 'সু রের ভে লায় ভে সে ভে সে _ _ _ _', 'shu rer bhe lay bhe she bhe she _ _ _ _'),
      line('M P g R S R .n S - - - -', 'ঘ রে ফে রে সন্ ধ্যা হ লে _ _ _ _', 'gho re phe re shon dhya ho le _ _ _ _'),
    ],
  },
  {
    id: 'morning-light',
    title: { en: 'Morning Light', bn: 'ভোরের আলো', hi: 'सुबह की रोशनी' },
    about: {
      en: 'An English song in Raag Yaman with its bright tivra Ma: wake up and sing with the morning light.',
      bn: 'তীব্র মা-এর উজ্জ্বলতায় রাগ ইমনে একটি ইংরেজি গান: জেগে ওঠো, ভোরের আলোর সঙ্গে গাও।',
      hi: 'तीव्र म की चमक वाले राग यमन में एक अंग्रेज़ी गीत: जागो और सुबह की रोशनी के साथ गाओ।',
    },
    language: 'en', raag: 'Yaman', taal: 'keherwa', bpm: 76, level: 2,
    lines: [
      line('.N R G m G R S -', 'Wake up with the mor ning light _'),
      line('G m D N D m G -', 'Sing a song so pure and bright _'),
      line("m D N S' N D m -", 'Ev ery note a lit tle prayer _'),
      line('G m G R .N R S -', 'Mu sic float ing in the air _'),
    ],
  },
];

export const getSong = (id) => SONGS.find((s) => s.id === id);
