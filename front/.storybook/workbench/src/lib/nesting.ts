// Figma-style nesting on the component page: where the selection sits
// among the library components the story renders (their roots carry
// `data-gv-component`, gvTag), the keys that move the selection up and
// down, and the return to a pattern after opening one of its components.
// Pure functions over the frame's elements and the hash.
import { labelOf } from './inspect';
import type { Section, StoryGroup } from './stories';

export const TAG = 'data-gv-component';
const BOX = '[data-gv-story-box]';
const OVERLAY = '[data-wb-overlay], [data-wb-held]';

// Layout wrappers: in the chain only when they are the selection itself,
// never the instance a hover or the header names.
export const LAYOUT = new Set(['Box']);

export const componentOf = (el: Element): string | null =>
  el.getAttribute(TAG) || null;

const inBox = (el: Element) => !el.matches(BOX) && !!el.closest(BOX);

// The nearest library component at or around the element, layout wrappers
// skipped.
export const instanceOf = (el: Element | null): Element | null => {
  let at: Element | null = el;
  while (at && inBox(at)) {
    const name = componentOf(at);
    if (name && !LAYOUT.has(name)) return at;
    at = at.parentElement;
  }
  return null;
};

// The component the header names: the selection when it is tagged (a Box
// too), else the nearest instance around it.
export const headerInstanceOf = (el: Element | null): Element | null =>
  el && inBox(el) && componentOf(el) ? el : instanceOf(el);

export type Segment =
  | {
      kind: 'story';
      name: string;
      // The story's own component root when it is tagged, else null (the
      // caller selects the story's default target).
      el: Element | null;
      current: boolean;
    }
  | { kind: 'instance'; name: string; el: Element; current: boolean }
  | { kind: 'element'; name: string; el: Element; current: true };

// The layer path of the selection: the story's component, the library
// components around the selection (outermost first, layout wrappers
// skipped), then the selection itself. The story component's own tagged
// root (a Button story's button) is the story segment, not a second one.
export const chainOf = (selected: Element, storyName: string): Segment[] => {
  const around: Element[] = [];
  let at = selected.parentElement;
  while (at && inBox(at)) {
    const name = componentOf(at);
    if (name && !LAYOUT.has(name)) around.unshift(at);
    at = at.parentElement;
  }
  const own = componentOf(selected);
  const story: Segment = {
    kind: 'story',
    name: storyName,
    el: null,
    current: false,
  };
  const out: Segment[] = [story];
  const outer = around[0];
  if (outer && componentOf(outer) === storyName) {
    story.el = outer;
    around.shift();
  } else if (!outer && own === storyName) {
    return [{ ...story, el: selected, current: true }];
  }
  for (const el of around) {
    out.push({
      kind: 'instance',
      name: componentOf(el) as string,
      el,
      current: false,
    });
  }
  out.push(
    own
      ? { kind: 'instance', name: own, el: selected, current: true }
      : {
          kind: 'element',
          name: labelOf(selected),
          el: selected,
          current: true,
        }
  );
  return out;
};

// ------------------------------------------------------------ keys

const SKIP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'LINK']);

// Enter: the first child of the selection that is part of the story.
// `shows` can rule out a child that draws nothing (no size).
export const firstChildTarget = (
  el: Element,
  shows: (child: Element) => boolean = () => true
): Element | null => {
  for (const child of Array.from(el.children)) {
    if (SKIP.has(child.tagName) || child.matches(OVERLAY)) continue;
    if (shows(child)) return child;
  }
  return null;
};

export type NestKey = 'parent' | 'child' | null;

// Figma's keys: Shift+Enter, `\` and Esc select the parent, Enter the first
// child.
export const nestKey = (e: {
  key: string;
  shiftKey: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}): NestKey => {
  if (e.altKey || e.ctrlKey || e.metaKey) return null;
  if (e.key === 'Escape' || e.key === '\\') return 'parent';
  if (e.key === 'Enter') return e.shiftKey ? 'parent' : 'child';
  return null;
};

// ------------------------------------------------------------ open

// The page of a library component: its group under Components whose scan
// entry or name matches, the library's own file first; the default story.
export const storyOfComponent = (
  groups: StoryGroup[],
  name: string
): { group: StoryGroup; storyId: string } | null => {
  const named = groups.filter(
    (g) =>
      g.section === 'components' &&
      (g.score?.component === name || g.name === name)
  );
  const lib = `app/component-library/components/${name}/`;
  const group =
    named.find((g) => g.file?.startsWith(lib)) ??
    named.find((g) => g.score?.component === name) ??
    named[0];
  return group ? { group, storyId: group.defaultId } : null;
};

// ------------------------------------------------------------ return

// Where Back from an opened component lands: the pattern's section and
// story, the selection's place in it (inspect.ts pathOf) and the zoom.
export type ReturnTo = {
  section: Section;
  storyId: string;
  path: number[] | null;
  zoom: 'fit' | number;
};

const SECTIONS: Section[] = ['components', 'patterns', 'pages'];
const STORY_ID = /^[a-z0-9][a-z0-9-]*$/;

export const pathText = (path: number[] | null) => (path ? path.join('.') : '');

export const parsePath = (text: string | null): number[] | null => {
  if (text === null || !/^\d+(\.\d+)*$/.test(text)) return null;
  return text.split('.').map(Number);
};

export const zoomText = (zoom: 'fit' | number) => String(zoom);

export const parseZoom = (text: string | null): 'fit' | number | null => {
  if (text === 'fit') return 'fit';
  if (!text || !/^\d+(\.\d+)?$/.test(text)) return null;
  const n = Number(text);
  return n > 0 && n <= 16 ? n : null;
};

// `patterns/homepagebuilder-spotlight--standard:0.1.2:fit`, the `from`
// parameter of the opened component's hash.
export const encodeReturn = (r: ReturnTo) =>
  `${r.section}/${r.storyId}:${pathText(r.path)}:${zoomText(r.zoom)}`;

// The hash comes from anywhere (a pasted link): anything off shape is null.
export const decodeReturn = (text: string | null): ReturnTo | null => {
  if (!text) return null;
  const m = /^([a-z]+)\/([^:/]+):([\d.]*):([\d.]+|fit)$/.exec(text);
  if (!m) return null;
  const [, section, storyId, path, zoom] = m;
  if (!SECTIONS.includes(section as Section) || !STORY_ID.test(storyId)) {
    return null;
  }
  if (path && !parsePath(path)) return null;
  const z = parseZoom(zoom);
  if (z === null) return null;
  return {
    section: section as Section,
    storyId,
    path: parsePath(path),
    zoom: z,
  };
};

const splitHash = (hash: string) => {
  const raw = hash.replace(/^#/, '');
  const q = raw.indexOf('?');
  return {
    path: q === -1 ? raw : raw.slice(0, q),
    params: new URLSearchParams(q === -1 ? '' : raw.slice(q + 1)),
  };
};

const joinHash = (path: string, params: URLSearchParams) => {
  const q = params.toString();
  return `#${path}${q ? `?${q}` : ''}`;
};

// The hash with these parameters set, or removed when null; the others
// (the share link's `o`) kept.
export const withParams = (
  hash: string,
  set: Record<string, string | null>
): string => {
  const { path, params } = splitHash(hash);
  for (const [k, v] of Object.entries(set)) {
    if (v === null) params.delete(k);
    else params.set(k, v);
  }
  return joinHash(path, params);
};

export const paramOf = (hash: string, name: string): string | null =>
  splitHash(hash).params.get(name);

// The hash of a story page with the share link kept from `hash`, and the
// given parameters on top.
export const storyHash = (
  hash: string,
  section: Section,
  storyId: string,
  set: Record<string, string | null> = {}
): string => {
  const kept = splitHash(hash).params;
  const params = new URLSearchParams();
  // The share links: token edits (`o`) and instance prop edits (`p`).
  for (const k of ['o', 'p']) {
    const v = kept.get(k);
    if (v) params.set(k, v);
  }
  for (const [k, v] of Object.entries(set)) if (v !== null) params.set(k, v);
  return joinHash(`/${section}/${encodeURIComponent(storyId)}`, params);
};

// Opening a component from a pattern: the pattern's entry gets the
// selection and zoom (`sel`, `zoom`), so Back finds them, and the
// component's hash names the way back (`from`). The pattern's entry drops
// the share links (`o`, `p`): edits made meanwhile would read as an older
// link pasted on Back; the hooks write the session's own back in.
export const openHashes = (hash: string, r: ReturnTo, storyId: string) => ({
  here: withParams(hash, {
    o: null,
    p: null,
    sel: r.path ? pathText(r.path) : null,
    zoom: zoomText(r.zoom),
  }),
  there: storyHash(hash, 'components', storyId, { from: encodeReturn(r) }),
});

// The back chip's link when there is no history entry to go back to; no
// share link, for the same reason.
export const returnHash = (r: ReturnTo) =>
  storyHash('', r.section, r.storyId, {
    sel: r.path ? pathText(r.path) : null,
    zoom: zoomText(r.zoom),
  });
