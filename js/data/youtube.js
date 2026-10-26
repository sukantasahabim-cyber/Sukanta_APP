// YouTube links: SurTaal never downloads or copies YouTube audio. A pasted
// link is played inside YouTube's own embedded player (as YouTube allows),
// while SurTaal listens only to the singer's microphone.

// The video id from any common YouTube link, or null.
export function youtubeId(text) {
  const s = (text || '').trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  let url;
  try { url = new URL(s.startsWith('http') ? s : `https://${s}`); } catch { return null; }
  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let id = null;
  if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') || (url.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/) || [])[1] || null;
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

export const embedUrl = (id) => `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&modestbranding=1`;
export const searchUrl = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} karaoke`)}`;

// Video lessons by teachers on YouTube, for a lesson's topic.
export const lessonSearchUrl = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
