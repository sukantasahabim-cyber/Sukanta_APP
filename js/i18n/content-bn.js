// বাংলা lesson content. Shape: see extractTexts() in content.js.
import singing from './bn/singing.js';
import tabla from './bn/tabla.js';
import guitar from './bn/guitar.js';
import common from './bn/common.js';

export default {
  courses: { singing: singing.course, tabla: tabla.course, guitar: guitar.course },
  lessons: { ...singing.lessons, ...tabla.lessons, ...guitar.lessons },
  chords: common.chords,
  taals: common.taals,
};
