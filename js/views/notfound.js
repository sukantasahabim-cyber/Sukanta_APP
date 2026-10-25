import { h } from '../ui/dom.js';
import { t } from '../i18n/i18n.js';

export const notFound = () =>
  h('div', { class: 'container empty' },
    h('h1', {}, t('notFound.title')),
    h('p', {}, h('a', { href: '#/' }, t('notFound.back'))));
