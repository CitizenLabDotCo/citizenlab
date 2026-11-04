// The canvas is Storybook's preview frame on the same origin, so the shell
// reaches into its document directly: token overrides go on the root
// element's inline style.
import type { Overrides } from './overrides';

const PREFIX = '--gv-';

const inlineTokens = (doc: Document): string[] => {
  const style = doc.documentElement.style;
  const names: string[] = [];
  for (let i = 0; i < style.length; i++) {
    if (style[i].startsWith(PREFIX)) names.push(style[i]);
  }
  return names;
};

// Removes every --gv-* override from the frame's root element.
export const clear = (doc: Document) => {
  const style = doc.documentElement.style;
  inlineTokens(doc).forEach((name) => style.removeProperty(name));
};

// Puts exactly `o` on the root element (overrides no longer in `o` are
// removed).
export const applyToDocument = (doc: Document, o: Overrides) => {
  const root = doc.documentElement;
  inlineTokens(doc)
    .filter((name) => !(name in o))
    .forEach((name) => root.style.removeProperty(name));
  for (const [name, value] of Object.entries(o)) {
    if (name.startsWith(PREFIX) && typeof value === 'string') {
      root.style.setProperty(name, value);
    }
  }
};

export type FrameGlobals = { city: string; lang: string };

// The preview frame URL of a story, relative to the shell at
// <storybook>/workbench/. The globals are the ones .storybook/preview.tsx
// declares (the language global is called `lang` there).
export const storyUrl = (storyId: string, globals: FrameGlobals): string => {
  const g = (Object.keys(globals) as (keyof FrameGlobals)[])
    .map((k) => `${k}:${encodeURIComponent(globals[k])}`)
    .join(';');
  return `../iframe.html?id=${encodeURIComponent(
    storyId
  )}&viewMode=story&globals=${g}`;
};
