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
  // ---------- Film-style originals (Hindi) ----------
  {
    id: 'tere-bina',
    title: { en: 'Without You (romantic)', bn: 'তুমি ছাড়া (রোম্যান্টিক)', hi: 'तेरे बिना (रोमांटिक)' },
    about: {
      en: 'A soft romantic song in Raag Yaman, in the style of a classic film ballad.',
      bn: 'রাগ ইমনে একটি নরম রোম্যান্টিক গান, পুরনো সিনেমার গানের ঢঙে।',
      hi: 'राग यमन में एक नरम रोमांटिक गीत, पुराने फ़िल्मी गीतों के अंदाज़ में।',
    },
    language: 'hi', raag: 'Yaman', taal: 'keherwa', bpm: 84, level: 2,
    lines: [
      line('.N R G m G R G R', 'ते रे बि ना सू नी रा तें', 'te re bi naa soo nee raa ten'),
      line('G m D N D m G R', 'दिल ने तु झे ही पु का रा', 'dil ne tu jhe hee pu kaa raa'),
      line("m D N S' S' N D m", 'चाँद भी पू छे ते रा प ता', 'chaand bhee poo chhe te raa pa taa'),
      line('G m G R .N R S -', 'लौट के आ जा मे रे सनम _', 'laut ke aa jaa me re sanam _'),
    ],
  },
  {
    id: 'baarish',
    title: { en: 'Raindrops (rain song)', bn: 'বৃষ্টির ফোঁটা (বর্ষার গান)', hi: 'बारिश की बूँदें (सावन गीत)' },
    about: {
      en: 'A joyful monsoon song in Raag Des, the classic raag of the rainy season.',
      bn: 'রাগ দেশে বর্ষার আনন্দের গান — বর্ষা ঋতুর চিরকালের রাগ।',
      hi: 'राग देस में बरसात का खुशनुमा गीत — वर्षा ऋतु का पारंपरिक राग।',
    },
    language: 'hi', raag: 'Des', taal: 'keherwa', bpm: 90, level: 2,
    lines: [
      line("R M P N S' n D P", 'रिम झिम रिम झिम बर से सा वन', 'rim jhim rim jhim bar se saa wan'),
      line('M P n D P M G R', 'भी गा भी गा मे रा आँ गन', 'bhee gaa bhee gaa me raa aan gan'),
      line("R M P N S' R' N S'", 'बूँ दों में है गीत सु हा ना', 'boon don men hai geet su haa naa'),
      line("S' n D P M G R S", 'मन गा ए सा वन का गा ना', 'man gaa e saa wan kaa gaa naa'),
    ],
  },
  {
    id: 'chandni-raat',
    title: { en: 'Moonlit Night (ghazal)', bn: 'জ্যোৎস্না রাত (গজল)', hi: 'चाँदनी रात (ग़ज़ल)' },
    about: {
      en: 'A gentle ghazal-style song in Raag Kafi and Dadra: a quiet night, a lonely heart and a memory.',
      bn: 'রাগ কাফি আর দাদরায় গজলের ঢঙে কোমল গান: নিস্তব্ধ রাত, একা মন আর এক স্মৃতি।',
      hi: 'राग काफ़ी और दादरा में ग़ज़ल अंदाज़ का कोमल गीत: ख़ामोश रात, तनहा दिल और एक याद।',
    },
    language: 'hi', raag: 'Kafi', taal: 'dadra', bpm: 84, level: 3,
    lines: [
      line('P D n D - P M g R g R -', 'चाँ द नी रा _ त है तन हा है दिल _', 'chaan da nee raa _ ta hai tan haa hai dil _'),
      line('M - P D - n D - P M - -', 'याद _ ते री _ फिर आ _ ई है _ _', 'yaad _ te ree _ phir aa _ ee hai _ _'),
      line("M P n S' - S' n D P M P -", 'सि ता रों से _ पू छा ते रा प ता _', 'si taa ron se _ poo chhaa te raa pa taa _'),
      line('P D n D - P M g R g S -', 'चाँ द नी रा _ त है तन हा है दिल _', 'chaan da nee raa _ ta hai tan haa hai dil _'),
    ],
  },
  {
    id: 'chalo-chalein',
    title: { en: "Let's Go (dance song)", bn: 'চলো যাই (নাচের গান)', hi: 'चलो चलें (डांस गीत)' },
    about: {
      en: 'A bright, upbeat film-style song in Raag Bilawal. Great for building energy and clear diction.',
      bn: 'রাগ বিলাবলে উজ্জ্বল, চনমনে সিনেমার ঢঙের গান। প্রাণশক্তি আর স্পষ্ট উচ্চারণের জন্য দারুণ।',
      hi: 'राग बिलावल में चमकदार, जोशीला फ़िल्मी अंदाज़ का गीत। ऊर्जा और साफ़ उच्चारण के लिए बढ़िया।',
    },
    language: 'hi', raag: 'Bilawal', taal: 'keherwa', bpm: 104, level: 1,
    lines: [
      line('S G P G P D P G', 'च लो च लें न ई राह पर', 'cha lo cha len na ee raah par'),
      line('G M P M G R S -', 'सप नों का है ये स फ़र _', 'sap non kaa hai ye sa far _'),
      line("P P D N S' N D P", 'हँस के गा एँ मिल के ना चें', 'hans ke gaa en mil ke naa chen'),
      line('G M P G M G R S', 'आज खु शी का है ये प हर', 'aaj khu shee kaa hai ye pa har'),
    ],
  },
  {
    id: 'dosti',
    title: { en: 'Song of Friendship', bn: 'বন্ধুত্বের গান', hi: 'दोस्ती का गीत' },
    about: {
      en: 'A warm song about friendship in Raag Bhupali — easy notes, perfect for singing together.',
      bn: 'রাগ ভূপালিতে বন্ধুত্বের উষ্ণ গান — সহজ স্বর, সবাই মিলে গাওয়ার জন্য আদর্শ।',
      hi: 'राग भूपाली में दोस्ती का गर्मजोशी भरा गीत — आसान स्वर, साथ मिलकर गाने के लिए बढ़िया।',
    },
    language: 'hi', raag: 'Bhupali', taal: 'keherwa', bpm: 88, level: 1,
    lines: [
      line('S R G P G R S -', 'हाथ में हाथ लि ए च लें _', 'haath men haath li e cha len _'),
      line('G P D P G R G R', 'हर मुश् किल को हँस के स हें', 'har mush kil ko hans ke sa hen'),
      line("P D S' D P G P -", 'दोस् ती है सब से प्या री _', 'dos tee hai sab se pyaa ree _'),
      line('G P G R S R .D S', 'साथ र हें हम सा री उ मर', 'saath ra hen ham saa ree u mar'),
    ],
  },

  // ---------- Bengali originals ----------
  {
    id: 'sharoter-megh',
    title: { en: 'Autumn Clouds (Pujo song)', bn: 'শরতের মেঘ (পুজোর গান)', hi: 'शरद के बादल (पूजा गीत)' },
    about: {
      en: 'A Bengali song for the Pujo season in Raag Bhupali and Dadra: blue sky, kash flowers and the scent of shiuli.',
      bn: 'রাগ ভূপালি আর দাদরায় পুজোর মরসুমের গান: নীল আকাশ, কাশফুল আর শিউলির গন্ধ।',
      hi: 'राग भूपाली और दादरा में पूजा के मौसम का बांग्ला गीत: नीला आकाश, काश के फूल और शिउली की ख़ुशबू।',
    },
    language: 'bn', raag: 'Bhupali', taal: 'dadra', bpm: 90, level: 1,
    lines: [
      line('G - R G P - D P - G - -', 'নীল _ আ কা শে _ সা দা _ মেঘ _ _', 'neel _ a ka she _ sha da _ megh _ _'),
      line('P D S\' D - P G R G - - -', 'কা শের ব নে _ হা ওয়া দো লে _ _ _', 'ka sher bo ne _ ha wa do le _ _ _'),
      line("G P D - S' D P G - R G -", 'শি উ লি _ ফু লের গন্ ধ _ ভা সে _', 'shi u li _ phu ler gon dho _ bha she _'),
      line('G R G P - G R .D S - - -', 'মন যে আ মার _ পু জোয় মা তে _ _ _', 'mon je a mar _ pu joy ma te _ _ _'),
    ],
  },
  {
    id: 'pother-gaan',
    title: { en: 'Song of the Road (Baul style)', bn: 'পথের গান (বাউল ঢঙে)', hi: 'राह का गीत (बाउल अंदाज़)' },
    about: {
      en: 'A Baul-style Bengali song in Raag Kafi: a wanderer with an ektara, finding friends everywhere.',
      bn: 'রাগ কাফিতে বাউল ঢঙের বাংলা গান: একতারা হাতে পথিক, সবার মাঝে আপন খুঁজে পায়।',
      hi: 'राग काफ़ी में बाउल अंदाज़ का बांग्ला गीत: इकतारा लिए एक राही, जो हर जगह अपने ढूँढ लेता है।',
    },
    language: 'bn', raag: 'Kafi', taal: 'keherwa', bpm: 96, level: 2,
    lines: [
      line('S R g M P M g -', 'এক তা রা বা জে প থে _', 'ek ta ra ba je po the _'),
      line('M P D P M g R -', 'মা টির সু রে মন ভ রে _', 'ma tir shu re mon bho re _'),
      line("P D n S' n D P M", 'দূ রের গাঁ য়ে ডাক দি য়ে যাই', 'du rer gan ye dak di ye jai'),
      line('g M P M g R S -', 'স বার মা ঝে আ পন পাই _', 'sho bar ma jhe a pon pai _'),
    ],
  },

  // ---------- Traditional words, new melodies ----------
  {
    id: 'kabir-doha',
    title: { en: "Kabir's Doha: Bura Jo Dekhan", bn: 'কবীরের দোঁহা: বুরা জো দেখন', hi: 'कबीर का दोहा: बुरा जो देखन' },
    about: {
      en: 'Words by Sant Kabir (15th century), set to a new melody in Raag Bhupali: "I went looking for bad people and found none — then I searched my own heart, and found no one worse than me."',
      bn: 'সন্ত কবীরের (পঞ্চদশ শতক) কথা, রাগ ভূপালিতে নতুন সুরে: "মন্দ মানুষ খুঁজতে গিয়ে কাউকে পেলাম না — নিজের মনের ভেতর খুঁজে দেখি, আমার চেয়ে মন্দ কেউ নেই।"',
      hi: 'संत कबीर (15वीं सदी) के बोल, राग भूपाली में नई धुन पर: "बुरा जो देखन मैं चला, बुरा न मिलिया कोय; जो दिल खोजा आपना, मुझसा बुरा न कोय।"',
    },
    language: 'hi', raag: 'Bhupali', taal: 'keherwa', bpm: 70, level: 1,
    lines: [
      line('G R S R G P G R', 'बु रा जो दे खन मैं च ला', 'bu raa jo de khan main cha laa'),
      line('G P D P G R S -', 'बु रा न मि लि या कोय _', 'bu raa na mi li yaa koy _'),
      line("P D S' S' D P G -", 'जो दिल खो जा आ प ना _', 'jo dil kho jaa aa pa naa _'),
      line('G P G R .D S - -', 'मुझ सा बु रा न कोय _ _', 'mujh saa bu raa na koy _ _'),
    ],
  },
  {
    id: 'payo-ji',
    title: { en: 'Payo Ji Maine (Meera bhajan)', bn: 'পায়োজি ম্যায়নে (মীরার ভজন)', hi: 'पायो जी मैंने (मीरा भजन)' },
    about: {
      en: 'Words by Meerabai (16th century), set to a new melody in Raag Khamaj: "I have found the priceless treasure of Ram\'s name, a gift of grace from my guru."',
      bn: 'মীরাবাঈয়ের (ষোড়শ শতক) কথা, রাগ খাম্বাজে নতুন সুরে: "রামনামের অমূল্য ধন পেয়েছি, গুরুর কৃপার দান।"',
      hi: 'मीराबाई (16वीं सदी) के बोल, राग खमाज में नई धुन पर: "पायो जी मैंने राम रतन धन पायो, वस्तु अमोलक दी मेरे सतगुरु, किरपा कर अपनायो।"',
    },
    language: 'hi', raag: 'Khamaj', taal: 'keherwa', bpm: 76, level: 2,
    lines: [
      line('G M P - D P - -', 'पा यो जी _ मैं ने _ _', 'paa yo jee _ main ne _ _'),
      line('P D n D P G - -', 'राम र तन धन पा यो _ _', 'raam ra tan dhan paa yo _ _'),
      line("G M P D N S' - -", 'वस् तु अ मो लक दी _ _', 'was tu a mo lak dee _ _'),
      line("S' n D P M - - -", 'मे रे सत गु रु _ _ _', 'me re sat gu ru _ _ _'),
      line('G M P G R S - -', 'किर पा कर अप ना यो _ _', 'kir paa kar ap naa yo _ _'),
    ],
  },

];

export const getSong = (id) => SONGS.find((s) => s.id === id);
