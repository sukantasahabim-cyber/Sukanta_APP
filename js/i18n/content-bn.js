// বাংলা lesson content. Shape: see extractTexts() in content.js.
import singing from './bn/singing.js';
import tabla from './bn/tabla.js';
import guitar from './bn/guitar.js';
import common from './bn/common.js';
import more from './bn/more.js';
import more2 from './bn/more2.js';

const withLevels = (course, extra) => ({ ...course, levels: [...course.levels, ...extra] });

export default {
  courses: {
    singing: withLevels(singing.course, [...more.levels.singing, ...more2.levels.singing]),
    tabla: withLevels(tabla.course, [...more.levels.tabla, ...more2.levels.tabla]),
    guitar: guitar.course,
  },
  lessons: { ...singing.lessons, ...tabla.lessons, ...more.lessons, ...more2.lessons, ...guitar.lessons },
  chords: common.chords,
  taals: { ...common.taals, ...more.taals },
};
