// The canvas keeps its preview frame across a change of story or globals
// and switches in place, the way Storybook's own UI does, instead of loading
// the whole preview again (about 3 MB of script and a blank frame). What
// the preview (10.4) does with each:
//
// - `setCurrentStory` with `{ storyId, viewMode: 'story' }` tears the old
//   story down and renders the new one. The layout parameter is applied
//   again (WebView.prepareForStory), and the per-story MSW handlers are set
//   again by the msw decorator, as in Storybook's UI. The portal nodes
//   (#modal-portal) live in the story decorator, so they go with the story.
// - `updateGlobals` renders the story again without remounting it, and the
//   MemoryRouter decorator (app/utils/router.tsx) keeps its children, so a
//   new language would not show. Instead the user globals are set in the
//   store and the story is remounted (`forceRemount`), which runs its
//   loaders again (the messages of the new language) and the decorators
//   (the city's theme).
// - A story torn down while it is still busy (its loaders, render or play
//   function) reloads the whole frame (StoryRender.teardown), so a switch
//   waits until it is past those.
//
// Anything else (no preview yet, a render error, a story that never
// renders) falls back to loading the frame again.
import { FrameGlobals, storyUrl } from './frame';

// The story and globals a frame shows.
export type FrameTarget = { storyId: string; globals: FrameGlobals };

// What the frame can do right now.
export type FrameStatus = {
  // The frame has loaded and its preview and channel are reachable.
  ready: boolean;
  // The frame is loading: it plans again once it has.
  loading: boolean;
  // Its story is far enough along to be torn down (lib/preview.ts
  // isSettled), or failed.
  idle: boolean;
  // Its story failed to render.
  errored: boolean;
  // A switch in place is still under way.
  switching: boolean;
};

export type SwitchPlan =
  | { kind: 'none' }
  // Wait for the switch under way, then plan again.
  | { kind: 'wait' }
  | { kind: 'reload' }
  | {
      kind: 'switch';
      // The new story, or undefined for the same one.
      storyId?: string;
      // The globals that change, or undefined when none do.
      globals?: Partial<FrameGlobals>;
    };

const changedGlobals = (
  from: FrameGlobals,
  to: FrameGlobals
): Partial<FrameGlobals> | undefined => {
  const out: Partial<FrameGlobals> = {};
  let any = false;
  (Object.keys(to) as (keyof FrameGlobals)[]).forEach((k) => {
    if (from[k] !== to[k]) {
      (out as Record<string, string>)[k] = to[k];
      any = true;
    }
  });
  return any ? out : undefined;
};

// How to get the frame from what it shows to what the canvas wants.
export const switchPlan = (
  shown: FrameTarget,
  wanted: FrameTarget,
  state: FrameStatus
): SwitchPlan => {
  if (state.switching) return { kind: 'wait' };
  const storyId = shown.storyId !== wanted.storyId ? wanted.storyId : undefined;
  const globals = changedGlobals(shown.globals, wanted.globals);
  if (!storyId && !globals) return { kind: 'none' };
  if (state.loading) return { kind: 'wait' };
  if (!state.ready || state.errored) return { kind: 'reload' };
  if (!state.idle) return { kind: 'wait' };
  return { kind: 'switch', storyId, globals };
};

// What a preview frame URL (lib/frame.ts storyUrl) shows, read back from
// its location: the preview rewrites the story id there when it switches
// (the canvas then writes the globals too, searchFor), and reloads at that
// URL when it has to. Globals the URL lacks are taken from `fallback`.
export const targetOfSearch = (
  search: string,
  fallback: FrameTarget
): FrameTarget => {
  const params = new URLSearchParams(search);
  const globals = { ...fallback.globals };
  // Split before decoding: a value may hold an escaped `;`. The preview
  // writes the URL again when it switches, with the separators escaped too.
  let raw = /[?&]globals=([^&]*)/.exec(search)?.[1] ?? '';
  if (!raw.includes(':')) {
    try {
      raw = decodeURIComponent(raw);
    } catch {
      raw = '';
    }
  }
  for (const pair of raw.split(';')) {
    const at = pair.indexOf(':');
    if (at < 1) continue;
    const key = pair.slice(0, at) as keyof FrameGlobals;
    if (!(key in globals)) continue;
    try {
      (globals as Record<string, string>)[key] = decodeURIComponent(
        pair.slice(at + 1)
      );
    } catch {
      // Not encoded by storyUrl: kept as the fallback.
    }
  }
  return { storyId: params.get('id') || fallback.storyId, globals };
};

// The frame's location search once it shows `t`: the story id and globals
// as storyUrl writes them, the other params kept. Written after a switch in
// place, so a reload of the frame by the preview shows the same.
export const searchFor = (search: string, t: FrameTarget): string => {
  const url = storyUrl(t.storyId, t.globals);
  // The other params as they were written, not encoded again.
  const rest = search
    .replace(/^\?/, '')
    .split('&')
    .filter(
      (p) => p && !['id', 'viewMode', 'globals'].includes(p.split('=')[0])
    );
  return [url.slice(url.indexOf('?')), ...rest].join('&');
};

export const sameTarget = (a: FrameTarget, b: FrameTarget) =>
  a.storyId === b.storyId && !changedGlobals(a.globals, b.globals);

// Children of the frame's body the old story left behind: there when the
// switch started, still there once the new story rendered, and rendered by
// the story's React root (`fromStory`; Storybook's own nodes and the
// canvas overlays are not). Every portal target the decorator renders goes
// with the story, so these come from code that appended to the body
// itself; the frame is loaded again rather than show them with the next
// story.
export const strayNodes = (
  body: HTMLElement,
  atStart: readonly Element[],
  fromStory: (el: Element) => boolean
): Element[] =>
  atStart.filter((el) => el.parentElement === body && fromStory(el));

// Keeps the old story on screen while the preview swaps it for the new
// one: once the old story's nodes leave the root, a copy of them goes in
// (without ids, so the new story's portals find its own targets; inert and
// without frames or media, so nothing in it runs or plays). React
// clears the root when it first renders the new story into it, in the same
// commit, so no frame paints blank. `release` removes the copy if it is
// still there.
export const holdStory = (root: HTMLElement): (() => void) => {
  const doc = root.ownerDocument;
  const copy = doc.createElement('div');
  copy.setAttribute('data-wb-held', '');
  copy.setAttribute('aria-hidden', 'true');
  copy.style.display = 'contents';
  copy.inert = true;
  root.childNodes.forEach((n) => copy.appendChild(n.cloneNode(true)));
  copy.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  copy.querySelectorAll('iframe, video, audio').forEach((el) => el.remove());
  const Observer = doc.defaultView?.MutationObserver ?? MutationObserver;
  const observer = new Observer(() => {
    if (root.childElementCount > 0) return;
    root.appendChild(copy);
    observer.disconnect();
  });
  observer.observe(root, { childList: true });
  return () => {
    observer.disconnect();
    copy.remove();
  };
};
