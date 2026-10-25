// Music names written in each script: swaras, tabla bols and taals.
// Lesson data always uses the Latin tokens; these are for display only.
import { lang } from './i18n.js';

const SWARAS = {
  bn: { Sa: 'সা', Re: 'রে', Ga: 'গা', Ma: 'মা', Pa: 'পা', Dha: 'ধা', Ni: 'নি' },
  hi: { Sa: 'सा', Re: 'रे', Ga: 'ग', Ma: 'म', Pa: 'प', Dha: 'ध', Ni: 'नि' },
};

const BOLS = {
  bn: {
    na: 'না', ta: 'তা', tin: 'তিন', tu: 'তু', tun: 'তুন', ti: 'তি', te: 'তে', ra: 'র', re: 'রে',
    ge: 'গে', ghe: 'ঘে', ga: 'গা', ke: 'কে', ka: 'ক', ki: 'কি', kat: 'কৎ', dha: 'ধা', dhin: 'ধিন', dhi: 'ধি',
  },
  hi: {
    na: 'ना', ta: 'ता', tin: 'तिन', tu: 'तु', tun: 'तुन', ti: 'ति', te: 'ते', ra: 'र', re: 'रे',
    ge: 'गे', ghe: 'घे', ga: 'गा', ke: 'के', ka: 'क', ki: 'कि', kat: 'कत्', dha: 'धा', dhin: 'धिन', dhi: 'धि',
  },
};

const TAALS = {
  bn: { dadra: 'দাদরা', keherwa: 'কাহারবা', rupak: 'রূপক', jhaptaal: 'ঝাঁপতাল', ektaal: 'একতাল', teentaal: 'তিনতাল' },
  hi: { dadra: 'दादरा', keherwa: 'कहरवा', rupak: 'रूपक', jhaptaal: 'झपताल', ektaal: 'एकताल', teentaal: 'तीनताल' },
};

export const swaraName = (name) => SWARAS[lang()]?.[name] ?? name;
export const bolName = (bol) => (bol === '-' ? '–' : BOLS[lang()]?.[bol.toLowerCase()] ?? bol);
export const taalName = (id, fallback) => TAALS[lang()]?.[id] ?? fallback;

export const NAME_TABLES = { SWARAS, BOLS, TAALS };
