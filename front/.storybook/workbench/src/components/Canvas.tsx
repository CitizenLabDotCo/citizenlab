import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { GV_VIEWPORTS } from '../../../viewports';
import {
  FrameTarget,
  holdStory,
  sameTarget,
  searchFor,
  strayNodes,
  switchPlan,
  targetOfSearch,
} from '../lib/canvasSwitch';
import { storyUrl } from '../lib/frame';
import { applyElementEdits, ElementEdit } from '../lib/elementEdits';
import { reactContainerOf } from '../lib/galleryFrame';
import type { Overrides } from '../lib/overrides';
import { holdFrame, isHeld, isSettled, setUserGlobals } from '../lib/preview';
import { adoptPageTokens, applyEdits } from '../lib/review';

import type { ToolbarState } from './Toolbar';

type Props = {
  storyId: string;
  toolbar: ToolbarState;
  overrides: Overrides;
  // The session's element edits, painted as inline styles on this story.
  elementEdits?: ElementEdit[];
  // Called with the frame's window after each load (the Controls panel
  // talks to the story through it), and with null when the frame goes or
  // the preview reloads itself (the window stays, its document does not). A
  // story or globals switch in place keeps the window and the document.
  onFrame?: (win: Window | null) => void;
  // Called with the scale the frame is shown at, so the zoom control can
  // say what Fit came to.
  onScale?: (scale: number) => void;
  // A caption over the frame, for the side by side view.
  label?: string;
};

type Channel = {
  on: (event: string, fn: (payload: unknown) => void) => void;
  off: (event: string, fn: (payload: unknown) => void) => void;
  emit: (event: string, payload: unknown) => void;
};

// A switch in place that has not rendered by then loads the frame again,
// and so does a story still busy (loaders, its first render) by then.
const SWITCH_TIMEOUT_MS = 4000;
const WAIT_POLL_MS = 50;
// What the preview says when the story it switched to cannot be shown.
const FAILED = ['storyMissing', 'storyErrored', 'storyThrewException'];

// The frame's layout size, and the scale it is shown at.
type Fitted = { w: number; h: number; scale: number };

// Fit: room around the story on every side, and the frame height before the
// first measure and its bounds after.
const FIT_PAD = 24;
const FIT_START_H = 160;
const FIT_MIN_H = 96;
const FIT_MAX_H = 1600;
// Fit grows a small story up to this zoom, and no taller on screen than
// FIT_ZOOM_H, so a badge is easy to inspect; 100% in the zoom control shows
// it at its true size.
const MAX_FIT_ZOOM = 2;
const FIT_ZOOM_H = 440;

// The decorator's box around every story (.storybook/contexts). Storybook
// centres the story in it, so content wider or taller than the frame spills
// past the left or top edge, where nothing can show it. Safe centring keeps
// it inside; in fit the box is as tall as the story, top aligned, padded.
const BOX = '[data-gv-story-box]';
const STYLE_ID = 'wb-canvas-style';
const SHIFT = '--wb-fit-shift';
const MAX_SHIFT = 600;
const BASE_CSS = `${BOX}{justify-content:safe center!important;align-items:safe center!important}`;
// While a switch is under way: after 100 ms of a slow switch the preview
// hides the root and shows its own skeleton (WebView.showPreparingStory,
// base-preview-head.html); the root, with the old story held in it, stays.
const SWITCH_STYLE_ID = 'wb-canvas-switch';
const SWITCH_CSS =
  '.sb-show-preparing-story>#storybook-root{display:block!important}.sb-show-preparing-story>.sb-preparing-story{display:none!important}';
const FIT_CSS = `${BOX}{height:auto!important;align-items:flex-start!important;box-sizing:border-box!important;padding:${FIT_PAD}px!important;padding-top:calc(${FIT_PAD}px + var(${SHIFT},0px))!important}`;

const styleFrame = (doc: Document, fit: boolean) => {
  let el = doc.getElementById(STYLE_ID);
  if (!el) {
    el = doc.createElement('style');
    el.id = STYLE_ID;
    doc.head.appendChild(el);
  }
  const css = fit ? BASE_CSS + FIT_CSS : BASE_CSS;
  if (el.textContent !== css) el.textContent = css;
};

type Extent = { left: number; top: number; right: number; bottom: number };

const NONE: Extent = {
  left: Infinity,
  top: Infinity,
  right: -Infinity,
  bottom: -Infinity,
};

const clips = (style: CSSStyleDeclaration) =>
  style.overflowX !== 'visible' || style.overflowY !== 'visible';

// Where the story's elements reach, in frame coordinates. The box and its
// wrappers span the frame, so they do not count; overlays and portals do.
// A part its parent clips (a carousel's hidden slides) counts only as far
// as the parent shows it.
const MEASURE_NODES = 2000;
const extentOf = (root: HTMLElement): Extent & { boxTop: number } => {
  const win = root.ownerDocument.defaultView;
  const box = root.querySelector(BOX);
  const clipOf = new Map<Element, Extent>();
  const all: Extent = {
    left: -Infinity,
    top: -Infinity,
    right: Infinity,
    bottom: Infinity,
  };
  clipOf.set(root, all);
  const out = { ...NONE, boxTop: Infinity };
  const nodes = root.querySelectorAll('*');
  for (let i = 0; i < Math.min(nodes.length, MEASURE_NODES); i++) {
    const el = nodes[i];
    const parent = el.parentElement;
    const inherited = (parent && clipOf.get(parent)) || all;
    const r = el.getBoundingClientRect();
    const style = win?.getComputedStyle(el);
    let clip = inherited;
    if (style && clips(style) && r.width > 0 && r.height > 0) {
      clip = {
        left: Math.max(inherited.left, r.left),
        top: Math.max(inherited.top, r.top),
        right: Math.min(inherited.right, r.right),
        bottom: Math.min(inherited.bottom, r.bottom),
      };
    }
    clipOf.set(el, clip);
    if (el === box || (box && el.contains(box))) continue;
    if (r.width <= 0 || r.height <= 0 || style?.visibility === 'hidden') {
      continue;
    }
    const left = Math.max(r.left, inherited.left);
    const top = Math.max(r.top, inherited.top);
    const right = Math.min(r.right, inherited.right);
    const bottom = Math.min(r.bottom, inherited.bottom);
    if (right <= left || bottom <= top) continue;
    out.left = Math.min(out.left, left);
    out.top = Math.min(out.top, top);
    out.right = Math.max(out.right, right);
    out.bottom = Math.max(out.bottom, bottom);
    if (box?.contains(el)) out.boxTop = Math.min(out.boxTop, top);
  }
  return out;
};

// w, h: the frame size the story needs at that width; half: how far it
// reaches from the centre line of the box, either way; ch: its own height.
type Measure = { w: number; h: number; half: number; ch: number };

// The story's size at a frame width: the frame is set 1px tall for the
// read, so content sized to the viewport (100vh) does not count, then put
// back. Both happen in one task, so nothing paints in between. Content that
// starts above the top padding (an overlay opening upwards) moves the story
// down for the next read.
const measure = (iframe: HTMLIFrameElement, width: number): Measure | null => {
  const doc = iframe.contentDocument;
  const root = doc?.getElementById('storybook-root');
  if (!doc || !root) return null;
  const { width: w, height: h } = iframe.style;
  iframe.style.width = `${width}px`;
  iframe.style.height = '1px';
  const e = extentOf(root);
  const box = root.querySelector(BOX)?.getBoundingClientRect();
  const centre = box ? (box.left + box.right) / 2 : width / 2;
  // The page may refuse to be narrower than a minimum (body min-width).
  const scrollW = doc.documentElement.scrollWidth;
  iframe.style.width = w;
  iframe.style.height = h;
  if (e.right < e.left) {
    return { w: Math.max(width, scrollW), h: 0, half: 0, ch: 0 };
  }
  // The story without the shift would start at boxTop - shift; the shift
  // brings that down to the padding, never more than MAX_SHIFT.
  if (Number.isFinite(e.boxTop)) {
    const html = doc.documentElement;
    const shift = parseFloat(html.style.getPropertyValue(SHIFT)) || 0;
    const next = Math.min(
      MAX_SHIFT,
      Math.max(0, Math.ceil(FIT_PAD - (e.boxTop - shift)))
    );
    if (Math.abs(next - shift) > 1) {
      html.style.setProperty(SHIFT, `${next}px`);
    }
  }
  return {
    w: Math.max(width, scrollW, Math.ceil(e.right + FIT_PAD)),
    h: Math.ceil(Math.max(e.bottom, 0) + FIT_PAD),
    half: Math.max(centre - e.left, e.right - centre),
    ch: e.bottom - e.top,
  };
};

const clampH = (h: number) => Math.min(FIT_MAX_H, Math.max(FIT_MIN_H, h));

// Fit at the room's width: a story wider than the room is laid out at its
// own width and scaled down; a small one is laid out narrower and scaled
// up, at most MAX_FIT_ZOOM, in 5% steps.
const fitTo = (iframe: HTMLIFrameElement, room: number): Fitted | null => {
  const m = measure(iframe, room);
  if (!m) return null;
  if (m.w > room) return { w: m.w, h: clampH(m.h), scale: room / m.w };
  const up = Math.min(
    MAX_FIT_ZOOM,
    room / (2 * (m.half + FIT_PAD)),
    FIT_ZOOM_H / (m.ch + 2 * FIT_PAD)
  );
  const scale = Math.max(1, Math.floor(up * 20) / 20);
  if (scale === 1) return { w: room, h: clampH(m.h), scale };
  const w = Math.floor(room / scale);
  const again = measure(iframe, w);
  if (!again) return null;
  // Laid out narrower, an overlay anchored off centre may still reach past
  // the edge: then the frame is as wide as it reaches.
  if (again.w > w + 1) {
    return { w: again.w, h: clampH(again.h), scale: room / again.w };
  }
  return { w, h: clampH(again.h), scale };
};

const NO_EDITS: ElementEdit[] = [];

// Storybook's preview frame for one story. With the `fit` viewport the
// frame is as tall as the story; the zoom control's Fit scales a small
// story up and a wide one down to the canvas, a fixed zoom shows it at that
// scale (the canvas scrolls when it does not fit). A preset viewport sizes
// the frame to the preset; Fit scales it down to the canvas. Another story,
// mode, city or language switches the frame in place (lib/canvasSwitch.ts):
// the old story shows until the new one has rendered, then the frame is
// fitted again; when that cannot be done the frame loads anew. Overrides
// are set on the frame's root element without a reload and set again
// whenever Storybook renders the story anew, next to the story's own inline
// tokens.
const Canvas = ({
  storyId,
  toolbar,
  overrides,
  elementEdits = NO_EDITS,
  onFrame,
  onScale,
  label,
}: Props) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(0);
  const [fitted, setFitted] = useState<Fitted | null>(null);
  const fit = toolbar.viewport === 'fit';
  const { zoom } = toolbar;
  const latest = useRef({
    overrides,
    elementEdits,
    storyId,
    mode: toolbar.mode,
    onFrame,
    fit,
    room,
  });
  latest.current = {
    overrides,
    elementEdits,
    storyId,
    mode: toolbar.mode,
    onFrame,
    fit,
    room,
  };
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  // Per frame document, the tokens the session set there: the story's own
  // inline tokens (the city's --gv-tenant-*, written by ModeProvider) stay.
  const applied = useRef(new WeakMap<Document, Map<string, string | null>>());
  // Per frame document, each element edit's inline values before it.
  const appliedElements = useRef(
    new WeakMap<Document, Map<string, Map<string, string>>>()
  );
  // The story the frame shows: element edits are painted on that one. A
  // switch in place changes it once the new story has rendered.
  const shownStory = useRef(storyId);

  // `adopt`: the story has just rendered, so its ModeProvider may have
  // written the tenant tokens again (another city) over an edit.
  const apply = useCallback((adopt = false) => {
    const doc = frame.current?.contentDocument;
    if (!doc?.documentElement) return;
    let mine = applied.current.get(doc);
    if (!mine) {
      mine = new Map();
      applied.current.set(doc, mine);
    }
    if (adopt) adoptPageTokens(doc, latest.current.overrides, mine);
    applyEdits(doc, latest.current.overrides, latest.current.mode, mine);
    let els = appliedElements.current.get(doc);
    if (!els) {
      els = new Map();
      appliedElements.current.set(doc, els);
    }
    applyElementEdits(
      doc,
      latest.current.elementEdits,
      shownStory.current,
      els
    );
    if (doc.head) styleFrame(doc, latest.current.fit);
  }, []);

  const refit = useCallback(() => {
    const { fit: on, room: r } = latest.current;
    if (!on || r <= 0 || !frame.current) return;
    const z = zoomRef.current;
    let next: Fitted | null;
    if (z === 'fit') {
      next = fitTo(frame.current, r);
    } else {
      // Zooming in magnifies the story as laid out at the canvas width (the
      // canvas then scrolls), so a responsive story keeps its breakpoint;
      // zooming out lays it out wider, to show more of it.
      const m = measure(frame.current, Math.floor(r / Math.min(z, 1)));
      next = m && { w: m.w, h: clampH(m.h), scale: z };
    }
    if (!next) return;
    const n = next;
    setFitted((f) =>
      f &&
      Math.abs(f.w - n.w) < 2 &&
      Math.abs(f.h - n.h) < 2 &&
      f.scale === n.scale
        ? f
        : n
    );
  }, []);

  const globals = {
    mode: toolbar.mode,
    city: toolbar.city,
    lang: toolbar.lang,
  };
  // What the canvas asks for; `inFrame`: what the frame shows, or is
  // switching to.
  const wanted = useRef<FrameTarget>({ storyId, globals });
  wanted.current = { storyId, globals };
  const inFrame = useRef<FrameTarget>(wanted.current);
  // The frame's URL is the one it was created with: a switch in place
  // leaves it as it was. `key` makes a new frame.
  const [load, setLoad] = useState(() => ({
    key: 0,
    src: storyUrl(storyId, globals),
  }));
  // What the frame has shown since it loaded or last switched, for the
  // frame's data attributes (its URL is stale after a switch).
  const [current, setCurrent] = useState<FrameTarget>(wanted.current);
  // Set while a switch is under way: the old story stays and is not fitted
  // again until the new one has rendered.
  const [switching, setSwitching] = useState(false);
  const loaded = useRef(false);
  // The frame element that loaded last: loading again, it is the preview
  // that reloaded itself.
  const loadedFrame = useRef<HTMLIFrameElement | null>(null);
  const errored = useRef(false);
  const cancelSwitch = useRef<(() => void) | null>(null);
  const waitSince = useRef(0);
  const waitTimer = useRef(0);
  const paused = useRef(false);

  // A new frame at the wanted story and globals.
  const reload = useCallback(() => {
    cancelSwitch.current?.();
    window.clearTimeout(waitTimer.current);
    waitSince.current = 0;
    loaded.current = false;
    paused.current = false;
    const t = wanted.current;
    inFrame.current = t;
    setSwitching(false);
    setCurrent(t);
    setLoad((l) => ({ key: l.key + 1, src: storyUrl(t.storyId, t.globals) }));
  }, []);

  // Brings the frame to the wanted story and globals: in place when it
  // can, waiting for a story that is still busy, or with a new frame.
  const sync = useCallback(() => {
    window.clearTimeout(waitTimer.current);
    const win = frame.current?.contentWindow as
      | (Window & { __STORYBOOK_ADDONS_CHANNEL__?: Channel })
      | null
      | undefined;
    let channel: Channel | undefined;
    let doc: Document | undefined;
    try {
      channel = win?.__STORYBOOK_ADDONS_CHANNEL__;
      doc = win?.document;
    } catch {
      channel = undefined;
    }
    const t = wanted.current;
    const plan = switchPlan(inFrame.current, t, {
      ready: loaded.current && !!channel && !!doc?.body,
      loading: !loaded.current,
      // An args update (Controls) holds the frame until it has rendered.
      idle:
        isSettled(win, inFrame.current.storyId === t.storyId) && !isHeld(win),
      errored: errored.current,
      switching: !!cancelSwitch.current,
    });
    if (plan.kind !== 'wait') waitSince.current = 0;
    if (plan.kind === 'none') return;
    if (plan.kind === 'reload') {
      reload();
      return;
    }
    if (plan.kind === 'wait') {
      // The switch under way plans again when it is done, and so does a
      // frame that is loading.
      if (cancelSwitch.current || !loaded.current) return;
      waitSince.current ||= Date.now();
      if (Date.now() - waitSince.current > SWITCH_TIMEOUT_MS) reload();
      else waitTimer.current = window.setTimeout(sync, WAIT_POLL_MS);
      return;
    }
    if (!win || !channel || !doc?.body) return;
    if (plan.globals && !setUserGlobals(win, plan.globals)) {
      reload();
      return;
    }
    const ch = channel;
    const body = doc.body;
    const from = inFrame.current;
    const atStart = Array.from(body.children);
    const storyRoot = doc.getElementById('storybook-root');
    const release = storyRoot ? holdStory(storyRoot) : () => {};
    const keep = doc.createElement('style');
    keep.id = SWITCH_STYLE_ID;
    keep.textContent = SWITCH_CSS;
    doc.head?.appendChild(keep);
    inFrame.current = t;
    paused.current = true;
    setSwitching(true);
    // The preview starts on the switch at once, before React renders the
    // state above: the frame says it is not fitted from now on.
    if (frame.current?.hasAttribute('data-fit')) {
      frame.current.setAttribute('data-fit', 'pending');
    }
    const unhold = holdFrame(win);
    let timer = 0;
    // The new render has started: a pass the switch aborted (the same
    // story, remounted) can still say it rendered, but never starts.
    let started = false;
    const stop = () => {
      release();
      unhold();
      keep.remove();
      window.clearTimeout(timer);
      ch.off('storyRendered', rendered);
      ch.off('storyRenderPhaseChanged', phase);
      FAILED.forEach((e) => ch.off(e, failed));
      cancelSwitch.current = null;
    };
    const done = () => {
      stop();
      const root = body.ownerDocument.getElementById('storybook-root');
      const strays = strayNodes(
        body,
        atStart,
        (el) => !!root && el !== root && reactContainerOf(el) === root
      );
      if (strays.length > 0) {
        reload();
        return;
      }
      // A story starts from its own args, as it did in a new frame.
      if (plan.storyId) ch.emit('resetStoryArgs', { storyId: from.storyId });
      body.ownerDocument.documentElement.style.removeProperty(SHIFT);
      // The elements the edits were painted on went with the old render.
      appliedElements.current.get(body.ownerDocument)?.clear();
      shownStory.current = t.storyId;
      // The preview reloads itself at its own URL: from now on that is
      // this story with these globals.
      try {
        const loc = win.location;
        win.history.replaceState(
          win.history.state,
          '',
          `${loc.pathname}${searchFor(loc.search, t)}${loc.hash}`
        );
      } catch {
        // Not reachable: a reload then switches again from the old URL.
      }
      apply(true);
      setCurrent(t);
      window.requestAnimationFrame(() => {
        paused.current = false;
        refit();
        setSwitching(false);
        sync();
      });
    };
    // The story is on screen once it is mounted: the preview then waits
    // for its CSS animations to end before it says `storyRendered`.
    function rendered(id: unknown) {
      if (started && id === t.storyId) done();
    }
    function phase(e: unknown) {
      const { newPhase, storyId: id } = (e ?? {}) as Record<string, unknown>;
      if (newPhase === 'rendering' && id === t.storyId) started = true;
      if (newPhase === 'completing') rendered(id);
    }
    function failed() {
      stop();
      reload();
    }
    ch.on('storyRendered', rendered);
    ch.on('storyRenderPhaseChanged', phase);
    FAILED.forEach((e) => ch.on(e, failed));
    timer = window.setTimeout(failed, SWITCH_TIMEOUT_MS);
    cancelSwitch.current = stop;
    if (plan.storyId) {
      ch.emit('setCurrentStory', { storyId: t.storyId, viewMode: 'story' });
    } else {
      // A remount runs the loaders and decorators with the new globals.
      ch.emit('forceRemount', { storyId: t.storyId });
    }
  }, [apply, reload, refit]);

  // Each load: apply, re-apply and re-fit after every story render, and
  // re-fit when the story changes size (an opened menu, a loaded font).
  const watch = useRef<() => void>();
  const onLoad = useCallback(() => {
    watch.current?.();
    // A load ends any switch under way: the preview reloaded itself.
    cancelSwitch.current?.();
    paused.current = false;
    setSwitching(false);
    const win = frame.current?.contentWindow as
      | (Window & {
          __STORYBOOK_ADDONS_CHANNEL__?: Channel;
          ResizeObserver: typeof ResizeObserver;
          MutationObserver: typeof MutationObserver;
        })
      | null
      | undefined;
    const channel = win?.__STORYBOOK_ADDONS_CHANNEL__;
    // The preview reloads itself at its own URL when a story torn down
    // was still busy: that URL says what it shows.
    try {
      inFrame.current = targetOfSearch(
        win?.location.search ?? '',
        inFrame.current
      );
    } catch {
      // Not reachable: as asked for.
    }
    shownStory.current = inFrame.current.storyId;
    apply();
    loaded.current = true;
    errored.current = false;
    setCurrent((c) => (sameTarget(c, inFrame.current) ? c : inFrame.current));
    let raf = 0;
    const later = () => {
      if (paused.current) return;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(refit);
    };
    const rendered = () => {
      errored.current = false;
      apply(true);
      later();
    };
    const failed = () => {
      errored.current = true;
    };
    channel?.on('storyRendered', rendered);
    FAILED.forEach((e) => channel?.on(e, failed));
    const root = win?.document.getElementById('storybook-root');
    const observer = win && root ? new win.ResizeObserver(later) : undefined;
    if (root) observer?.observe(root);
    // The story box is placed absolutely, so the root does not resize when
    // the story mounts late (after its loaders): watch for new nodes too.
    const mutations = win && root ? new win.MutationObserver(later) : undefined;
    if (root) mutations?.observe(root, { childList: true, subtree: true });
    later();
    watch.current = () => {
      window.cancelAnimationFrame(raf);
      channel?.off('storyRendered', rendered);
      FAILED.forEach((e) => channel?.off(e, failed));
      observer?.disconnect();
      mutations?.disconnect();
    };
    // The same frame loaded again has the same window but a new document
    // and channel: readers that key on the window set up again.
    if (loadedFrame.current === frame.current && frame.current) {
      flushSync(() => latest.current.onFrame?.(null));
    }
    loadedFrame.current = frame.current;
    latest.current.onFrame?.(win ?? null);
    sync();
  }, [apply, refit, sync]);
  useEffect(
    () => () => {
      watch.current?.();
      cancelSwitch.current?.();
      window.clearTimeout(waitTimer.current);
    },
    []
  );

  useEffect(() => apply(), [apply, overrides, elementEdits, toolbar.mode, fit]);
  useEffect(refit, [refit, room, fit, zoom]);

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => setRoom(el.clientWidth - 2));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Another story or other globals: switched in place where it can be.
  useEffect(sync, [sync, storyId, toolbar.mode, toolbar.city, toolbar.lang]);

  // A new frame: the old window is gone until it loads.
  useEffect(() => {
    setFitted(null);
    return () => latest.current.onFrame?.(null);
  }, [load.key]);

  let w: number;
  let h: number;
  let scale: number;
  if (toolbar.viewport === 'fit') {
    w = fitted?.w ?? room;
    h = fitted?.h ?? FIT_START_H;
    scale = fitted?.scale ?? (zoom === 'fit' ? 1 : zoom);
  } else {
    const { width, height } = GV_VIEWPORTS[toolbar.viewport].styles;
    w = parseInt(width, 10);
    h = parseInt(height, 10);
    scale = zoom === 'fit' ? (room > 0 && w > room ? room / w : 1) : zoom;
  }
  const shown = Math.round(scale * 100);

  // A fixed zoom larger than the canvas scrolls: start at the centre,
  // where the story is.
  const view = useRef<HTMLDivElement>(null);
  const frameW = Math.round(w * scale);
  useEffect(() => {
    const el = view.current;
    if (!el || zoom === 'fit') return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [zoom, frameW]);
  useEffect(() => {
    onScale?.(scale);
  }, [onScale, scale]);

  return (
    <div
      className={fit ? 'wb-canvas wb-canvas-fit' : 'wb-canvas'}
      ref={box}
      data-zoom={zoom === 'fit' ? 'fit' : 'fixed'}
    >
      <p className="wb-canvas-size wb-muted">
        {label && <span className="wb-canvas-label">{label}</span>}
        <span>
          {fit ? 'Fit to story' : `${w} x ${h}`}
          {`, ${shown}%`}
        </span>
      </p>
      <div className="wb-canvas-view" ref={view}>
        <div
          className="wb-canvas-frame"
          style={{ width: w * scale, height: h * scale }}
        >
          {/* The frame waits for the canvas width: a story laid out in a
              frame a pixel wide can take the preview down. */}
          {room > 0 && (
            <iframe
              ref={frame}
              key={load.key}
              src={load.src}
              title={`Story ${storyId}`}
              data-testid="wb-canvas"
              data-story={current.storyId}
              data-mode={current.globals.mode}
              data-city={current.globals.city}
              data-lang={current.globals.lang}
              data-fit={
                fit ? (fitted && !switching ? 'done' : 'pending') : undefined
              }
              onLoad={onLoad}
              style={{
                width: w,
                height: h,
                transform: `scale(${scale})`,
                transformOrigin: '0 0',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
