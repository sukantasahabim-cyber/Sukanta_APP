// हिन्दी lesson content. Shape: see extractTexts() in content.js.
import singing from './hi/singing.js';
import tabla from './hi/tabla.js';
import guitar from './hi/guitar.js';
import common from './hi/common.js';

export default {
  courses: { singing: singing.course, tabla: tabla.course, guitar: guitar.course },
  lessons: { ...singing.lessons, ...tabla.lessons, ...guitar.lessons },
  chords: common.chords,
  taals: common.taals,
};
