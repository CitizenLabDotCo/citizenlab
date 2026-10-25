// Picture thumbnails: ds:thumbs takes one picture of each gallery card's
// story at build time, so a gallery shows pictures at once instead of
// booting a preview per card. The live story renders on the component page,
// and in a card only when there is no picture for the globals on show.
// Pure: shared by the shell and scripts/design-system/thumbs.ts.
import type { FrameGlobals } from './frame';
import type { Section } from './stories';

// Width each story is laid out at before it is scaled to the card: a
// phone-sized column for library components (about 80% in a desktop card,
// so labels stay readable), wider for patterns and pages.
export const THUMB_FRAME_WIDTH: Record<Section, number> = {
  components: 320,
  patterns: 520,
  pages: 520,
};

// A card's preview box is 16:10 (shell.css .wb-thumb).
export const THUMB_ASPECT = 10 / 16;

// The story keeps clear of the card's edges, as in a live card.
export const THUMB_INSET = 24;

// Pixels per CSS pixel of a picture: sharp on a retina screen.
export const THUMB_DPR = 2;

export type ThumbEntry = { file: string; width: number; height: number };

export type ThumbManifest = {
  // The globals every picture was taken with.
  globals: FrameGlobals;
  thumbs: Record<string, ThumbEntry>;
};

// The picture's viewport for a section: the story's layout width, and the
// height of the card's box at that width.
export const thumbViewport = (section: Section | null) => {
  const width = THUMB_FRAME_WIDTH[section ?? 'patterns'];
  return { width, height: Math.round(width * THUMB_ASPECT) };
};

// `components-forms-input--default` -> `components-forms-input--default.png`.
export const thumbFile = (storyId: string) =>
  `${storyId.replace(/[^A-Za-z0-9_-]+/g, '-')}.png`;

// The picture of a story, when the build has one taken with these globals;
// otherwise the card renders live.
export const thumbOf = (
  manifest: ThumbManifest | null,
  storyId: string,
  globals: FrameGlobals
): ThumbEntry | undefined => {
  if (!manifest) return undefined;
  const g = manifest.globals;
  if (g.city !== globals.city || g.lang !== globals.lang) return undefined;
  return manifest.thumbs[storyId];
};
