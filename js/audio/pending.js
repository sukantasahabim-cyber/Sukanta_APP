// A rendered track handed from one page to another (e.g. from the Music
// Studio to "Sing with your own track").
let pending = null;

export function setPendingTrack(buffer, name) { pending = { buffer, name }; }

export function takePendingTrack() {
  const p = pending;
  pending = null;
  return p;
}
