import { h } from '../ui/dom.js';

export const notFound = () =>
  h('div', { class: 'container empty' },
    h('h1', {}, 'Page not found'),
    h('p', {}, h('a', { href: '#/' }, 'Back to the courses')));
