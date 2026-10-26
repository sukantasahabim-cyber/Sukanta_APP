import { test } from 'node:test';
import assert from 'node:assert/strict';
import { youtubeId, embedUrl, searchUrl } from '../js/data/youtube.js';

test('video ids are read from every common YouTube link', () => {
  const id = 'dQw4w9WgXcQ';
  for (const link of [
    `https://www.youtube.com/watch?v=${id}`, `https://m.youtube.com/watch?v=${id}&t=30s`, `youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}`, `https://youtu.be/${id}?si=abc`, `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`, `https://music.youtube.com/watch?v=${id}&list=x`, id,
  ]) assert.equal(youtubeId(link), id, link);
  for (const bad of ['', 'hello', 'https://example.com/watch?v=dQw4w9WgXcQ', 'https://youtube.com/watch?v=short']) assert.equal(youtubeId(bad), null, bad);
  assert.match(embedUrl(id), /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?/);
  assert.equal(searchUrl('tum hi ho'), 'https://www.youtube.com/results?search_query=tum%20hi%20ho%20karaoke');
});
