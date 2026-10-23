// Renders many stories into one Storybook preview frame, the way docs mode
// does (10.4): `__STORYBOOK_PREVIEW__.loadStory({ storyId })` prepares a
// story, `renderStoryToElement(story, element, callbacks, options)` renders
// it into any element and returns its teardown. The frame is on the same
// origin, so the shell drives it from here; the preview needs no gallery
// code of its own.
//
// - The new render is the last of `storyRenders`; its `phase` says how far
//   it got (loaders, rendering, the play function) and `isPending()` whether
//   it is still busy. A render torn down while busy reloads the whole frame
//   (StoryRender.teardown), so one is only torn down once it is idle.
// - User globals live in `storyStoreValue.userGlobals`; a story rendered
//   after `update()` sees them. A story already rendered keeps its own: the
//   MemoryRouter decorator memoises its children, so the language only
//   changes in a new render. A globals change renders every story again,
//   into a new element that replaces the old one once it is ready.
// - Two kinds of story cannot share a document. One with its own MSW
//   handlers (`parameters.msw`) would swap the mock handlers of all the
//   others. One that portals out of its element (a modal into
//   #modal-portal, which every story's decorator renders, so the first one
//   in the document wins) lands in another card. Those cards fall back to a
//   frame of their own (`isolated`). So does a story laid out
//   `fullscreen`: it fills the viewport, and this one is the grid's height.
// - Stories share one store and one query client, so two things are per
//   document, not per card. Cleanup callbacks are kept by story id
//   (`cleanupStory`): tearing down a card's old render also runs its new
//   render's cleanups (no story registers any today). And the story
//   decorator invalidates every query when a story mounts, so each new card
//   refetches the active queries of the cards before it (all mocked; the
//   frame cannot reach the query client to skip it).
import { applyToDocument } from './frame';
import { Placement, renderOrder } from './gallery';

import type { FrameGlobals } from './frame';

export type ThumbState = 'loading' | 'rendered' | 'error' | 'isolated';

type StoryRender = { phase?: string; isPending: () => boolean };

type Story = { id: string; parameters?: Record<string, unknown> };

type RenderCallbacks = {
  showMain: () => void;
  showError: (error: { title: string; description: string }) => void;
  showException: (error: Error) => void;
  showStoryDuringRender: () => void;
};

export type GalleryPreview = {
  ready: () => Promise<unknown>;
  loadStory: (options: { storyId: string }) => Promise<Story>;
  renderStoryToElement: (
    story: Story,
    element: HTMLElement,
    callbacks: RenderCallbacks,
    options: { autoplay: boolean; forceInitialArgs: boolean }
  ) => () => Promise<void>;
  storyRenders: StoryRender[];
  storyStoreValue?: {
    projectAnnotations?: { parameters?: Record<string, unknown> };
    userGlobals: { update: (globals: Record<string, unknown>) => void };
  };
};

type GalleryWindow = Window & { __STORYBOOK_PREVIEW__?: GalleryPreview };

export type GalleryEntry = {
  id: string;
  placement: Placement;
  // The card's corner radius over its preview box, in frame pixels.
  radius: number;
};

// Stories rendering at once. More start sooner but share one main thread,
// so the cards in view would finish later.
export const CONCURRENCY = 4;

// Longest wait for a story to render before its card shows it anyway (an
// error is worth seeing too).
export const REVEAL_MS = 5000;

// Longest wait for the preview to start before every card falls back to a
// frame of its own.
export const BOOT_MS = 20000;

const POLL_MS = 50;

// Phases of a render that has not shown its story yet.
const UNSETTLED = new Set([
  'preparing',
  'loading',
  'beforeEach',
  'rendering',
  'playing',
]);

// The story sits on the card's own surface, without page scrollbars, and
// keeps clear of the card's edges (the story decorator fills its element).
// Storybook's own story root and messages stay hidden.
const FRAME_CSS = `
html,body{margin:0!important;padding:0!important;background:transparent!important;overflow:hidden!important}
body>.sb-wrapper,#storybook-root,#storybook-docs{display:none!important}
.gvg-item{position:absolute;overflow:hidden;opacity:0;transition:opacity var(--gv-motion-base),transform var(--gv-motion-base)}
.gvg-item[data-shown]{opacity:1}
.gvg-item[data-hover]{transform:translateY(calc(-1px / var(--gvg-k, 1)))}
.gvg-scale{position:absolute;top:0;left:0;transform-origin:0 0}
.gvg-story{position:absolute;inset:24px}
.gvg-story[data-pending]{visibility:hidden}
html[data-gvg-backdrop] .gvg-item{background:#fff}
@media (prefers-reduced-motion: reduce){.gvg-item{transition:none}}
`;

// Portal targets the story decorator renders once per story. A hidden one
// first in the document catches whatever portals there, so it can be told
// apart from the story that rendered it.
const PORTAL_IDS = ['modal-portal', 'mobile-nav-portal'];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Mounted = {
  el: HTMLElement;
  render?: StoryRender;
  teardown: () => Promise<void>;
};

type Item = {
  id: string;
  el: HTMLDivElement;
  scaleBox: HTMLDivElement;
  state: ThumbState;
  // The globals the shown story rendered with.
  key?: string;
  current?: Mounted;
  busy: boolean;
  present: boolean;
};

// The element React rendered `node` (or a node under it) into, read from
// the fiber React keeps on its DOM nodes: the root fiber's container.
export const reactContainerOf = (node: Element): Element | null => {
  const nodes = [node, ...Array.from(node.querySelectorAll('*')).slice(0, 200)];
  for (const n of nodes) {
    const key = Object.keys(n).find((k) => k.startsWith('__reactFiber$'));
    if (!key) continue;
    let fiber = (n as unknown as Record<string, any>)[key];
    while (fiber?.return) fiber = fiber.return;
    return fiber?.stateNode?.containerInfo ?? null;
  }
  return null;
};

const hasContent = (el: Element) => {
  const box = el.querySelector('[data-gv-story-box]');
  return (box ?? el).childElementCount > 0;
};

export type GalleryRenderer = {
  // The cards on show, in gallery order, with where their story goes.
  layout: (entries: GalleryEntry[], k: number) => void;
  // Cards near the viewport, which render first.
  setNear: (ids: Set<string>) => void;
  setGlobals: (globals: FrameGlobals) => void;
  // The card under the pointer lifts like the card does.
  hover: (id: string | null) => void;
  // A white backdrop behind each story, as the browser paints behind a
  // light page's frame in a dark shell (the stories expect a light page).
  setBackdrop: (on: boolean) => void;
  dispose: () => void;
};

export const createGalleryRenderer = (
  win: Window,
  globals: FrameGlobals,
  onState: (id: string, state: ThumbState) => void
): GalleryRenderer => {
  const doc = win.document;
  const items = new Map<string, Item>();
  let order: string[] = [];
  let near = new Set<string>();
  let wanted = globals;
  let key = JSON.stringify(globals);
  let preview: GalleryPreview | null = null;
  let failed = false;
  let disposed = false;
  let active = 0;
  let hovered: Item | undefined;
  let observer: MutationObserver | undefined;

  // A disposed renderer reports nothing: its frame has gone.
  const setState = (item: Item, state: ThumbState) => {
    if (disposed || item.state === state) return;
    item.state = state;
    item.el.toggleAttribute('data-shown', state === 'rendered');
    onState(item.id, state);
  };

  // Hides a render at once and tears it down once it is idle.
  const retire = async (mounted: Mounted) => {
    mounted.el.hidden = true;
    mounted.el.removeAttribute('id');
    for (let i = 0; !disposed && mounted.render?.isPending() && i < 1200; i++) {
      await wait(POLL_MS);
    }
    if (disposed) return;
    try {
      await mounted.teardown();
    } catch {
      // A failed teardown leaves a hidden element; nothing to show for it.
    }
    mounted.el.remove();
  };

  const isolated = (item: Item) => item.state === 'isolated';

  const isolate = (item: Item) => {
    if (disposed || item.state === 'isolated') return;
    setState(item, 'isolated');
    item.el.hidden = true;
    if (item.current) retire(item.current);
    item.current = undefined;
  };

  const itemOf = (id: string): Item => {
    const found = items.get(id);
    if (found) return found;
    const el = doc.createElement('div');
    el.className = 'gvg-item';
    el.dataset.gvThumb = id;
    const scaleBox = doc.createElement('div');
    scaleBox.className = 'gvg-scale';
    el.appendChild(scaleBox);
    doc.body.appendChild(el);
    const item: Item = {
      id,
      el,
      scaleBox,
      state: 'loading',
      busy: false,
      present: false,
    };
    items.set(id, item);
    return item;
  };

  const settle = async (render: StoryRender | undefined) => {
    const end = Date.now() + REVEAL_MS;
    while (render && UNSETTLED.has(render.phase ?? '') && Date.now() < end) {
      await wait(POLL_MS);
      if (disposed) return;
    }
  };

  const renderItem = async (item: Item, p: GalleryPreview) => {
    item.busy = true;
    active++;
    const renderKey = key;
    try {
      const story = await p.loadStory({ storyId: item.id });
      const projectMocks =
        p.storyStoreValue?.projectAnnotations?.parameters?.msw;
      if (disposed) return;
      if (
        story.parameters?.msw !== projectMocks ||
        story.parameters?.layout === 'fullscreen'
      ) {
        return isolate(item);
      }
      if (item.state === 'isolated') return;
      const el = doc.createElement('div');
      el.className = 'gvg-story';
      el.id = `story--${item.id}`;
      el.dataset.pending = '';
      item.scaleBox.appendChild(el);
      let errored = false;
      const fail = () => {
        errored = true;
      };
      const teardown = p.renderStoryToElement(
        story,
        el,
        {
          showMain: () => {},
          showStoryDuringRender: () => {},
          showError: fail,
          showException: fail,
        },
        { autoplay: true, forceInitialArgs: true }
      );
      const mounted = { el, render: p.storyRenders.at(-1), teardown };
      await settle(mounted.render);
      if (disposed) return;
      // Its story portalled out while it rendered.
      if (isolated(item)) {
        retire(mounted);
        return;
      }
      const old = item.current;
      item.current = mounted;
      item.key = renderKey;
      delete el.dataset.pending;
      if (old) retire(old);
      // The filters hid it and the globals changed while it rendered: like
      // any hidden stale card, it waits on the skeleton to render again.
      if (!item.present && renderKey !== key) setState(item, 'loading');
      else setState(item, errored && !hasContent(el) ? 'error' : 'rendered');
    } catch {
      if (!disposed) {
        item.key = renderKey;
        setState(item, 'error');
      }
    } finally {
      item.busy = false;
      active--;
      pump();
    }
  };

  // Starts the next renders: stories near the viewport first, then the
  // rest of the cards on show. A hidden card renders again once it shows.
  const pump = () => {
    if (disposed || !preview) return;
    const p = preview;
    const due = (item: Item | undefined) =>
      item && !item.busy && item.state !== 'isolated' && item.key !== key;
    for (const id of renderOrder(order, near)) {
      if (active >= CONCURRENCY) return;
      const item = items.get(id);
      if (due(item)) renderItem(item as Item, p);
    }
  };

  // A node portalled out of its story: the card's story moves to a frame
  // of its own.
  const checkLeak = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    if (el.closest('.gvg-item')) return;
    const container = reactContainerOf(el);
    const id = (container?.closest('.gvg-item') as HTMLElement | null)?.dataset
      .gvThumb;
    const item = id ? items.get(id) : undefined;
    if (item) isolate(item);
  };

  const start = (p: GalleryPreview) => {
    const style = doc.createElement('style');
    style.textContent = FRAME_CSS;
    doc.head.appendChild(style);
    const sentinels = PORTAL_IDS.map((id) => {
      const el = doc.createElement('div');
      el.id = id;
      el.hidden = true;
      doc.body.prepend(el);
      return el;
    });
    observer = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          checkLeak(node);
          // A node added before React renders into it (a tooltip's box).
          setTimeout(() => !disposed && checkLeak(node), 300);
        });
      }
    });
    observer.observe(doc.body, { childList: true });
    sentinels.forEach((el) => observer?.observe(el, { childList: true }));
    preview = p;
    apply();
  };

  // A card the filters hide that rendered with other globals goes back to
  // the skeleton until it renders again, so it never shows them when it
  // reappears.
  const unshowStale = () => {
    items.forEach((item) => {
      if (!item.present && item.state === 'rendered' && item.key !== key) {
        setState(item, 'loading');
      }
    });
  };

  const apply = () => {
    unshowStale();
    if (!preview) return;
    preview.storyStoreValue?.userGlobals.update(wanted);
    // The mode is a root attribute: shown stories switch now, before they
    // render again.
    applyToDocument(doc, {}, wanted.mode);
    pump();
  };

  const boot = async () => {
    const end = Date.now() + BOOT_MS;
    let p = (win as GalleryWindow).__STORYBOOK_PREVIEW__;
    while (!p?.storyStoreValue && Date.now() < end && !disposed) {
      await wait(POLL_MS);
      p = (win as GalleryWindow).__STORYBOOK_PREVIEW__;
    }
    if (disposed) return;
    try {
      if (!p?.storyStoreValue) throw new Error('no preview');
      await p.ready();
      if (!disposed) start(p);
    } catch {
      failed = true;
      if (!disposed) items.forEach((item) => item.present && isolate(item));
    }
  };
  boot();

  return {
    layout: (entries, k) => {
      doc.documentElement.style.setProperty('--gvg-k', String(k));
      const shown = new Set(entries.map((e) => e.id));
      items.forEach((item) => {
        item.present = shown.has(item.id);
        if (!item.present) item.el.hidden = true;
      });
      unshowStale();
      for (const { id, placement, radius } of entries) {
        const item = itemOf(id);
        item.present = true;
        if (failed) isolate(item);
        if (item.state === 'isolated') continue;
        const { box, width, height, scale } = placement;
        item.el.hidden = false;
        Object.assign(item.el.style, {
          left: `${box.x}px`,
          top: `${box.y}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
          borderRadius: `${radius}px ${radius}px 0 0`,
        });
        Object.assign(item.scaleBox.style, {
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
        });
      }
      order = entries.map((e) => e.id);
      pump();
    },
    setNear: (ids) => {
      near = ids;
      pump();
    },
    setGlobals: (next) => {
      const nextKey = JSON.stringify(next);
      if (nextKey === key) return;
      wanted = next;
      key = nextKey;
      apply();
    },
    hover: (id) => {
      hovered?.el.removeAttribute('data-hover');
      hovered = id ? items.get(id) : undefined;
      hovered?.el.setAttribute('data-hover', '');
    },
    setBackdrop: (on) => {
      doc.documentElement.toggleAttribute('data-gvg-backdrop', on);
    },
    dispose: () => {
      disposed = true;
      observer?.disconnect();
    },
  };
};
