// বাংলা lesson content. Shape: see extractTexts() in content.js.
import singing from './bn/singing.js';
import tabla from './bn/tabla.js';
import guitar from './bn/guitar.js';
import common from './bn/common.js';
import more from './bn/more.js';

const withLevels = (course, extra) => ({ ...course, levels: [...course.levels, ...extra] });

export default {
  courses: {
    singing: withLevels(singing.course, more.levels.singing),
    tabla: withLevels(tabla.course, more.levels.tabla),
    guitar: guitar.course,
  },
  lessons: { ...singing.lessons, ...tabla.lessons, ...more.lessons, ...guitar.lessons },
  chords: common.chords,
  taals: { ...common.taals, ...more.taals },
};
