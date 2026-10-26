import { useCallback, useEffect, useRef, useState } from 'react';

import Icon, { IconName } from '../components/Icon';
import InspSection from '../components/InspSection';
import LocalSave from '../components/LocalSave';
import Panel from '../components/Panel';
import Segmented from '../components/Segmented';
import {
  CanvasViewport,
  VIEWPORT_ICONS,
  Zoom,
  ZoomControl,
} from '../components/Toolbar';
import { ValueField } from '../components/ValueField';
import { copyText } from '../lib/clipboard';
import { loadScan, TokenMeta } from '../lib/data';
import { storyHash } from '../lib/hash';
import {
  componentSite,
  isLibrary,
  ownerOf,
  Site,
  Source,
  sourceOf,
} from '../lib/fiber';
import { Inspection, inspectElement, labelOf, shortName } from '../lib/inspect';
import { healToken } from '../lib/healTask';
import { useLocal } from '../lib/local';
import { badgeLevel, FileMarks, Level, marksByFile } from '../lib/marks';
import type { Section, StoryGroup } from '../lib/stories';
import { OVERLAY, overlay, place, Tool } from '../lib/useCanvasSelection';
import { useStoryGroups } from '../lib/useStoryGroups';
import { GV_VIEWPORTS, GvViewport } from '../../../viewports';
import { PlaceholderArt } from './Placeholder';

const PATH_KEY = 'wb-inspect-path';
const START = '/';

const readPath = () => {
  try {
    const p = window.localStorage.getItem(PATH_KEY);
    return p && p.startsWith('/') && !p.startsWith('/storybook') ? p : START;
  } catch {
    return START;
  }
};

const writePath = (p: string) => {
  try {
    window.localStorage.setItem(PATH_KEY, p);
  } catch {
    // Not kept.
  }
};

// The element's place under body as child indexes: after a hot reload
// swaps it, the same place is found again.
const pathFrom = (el: Element): number[] | null => {
  const path: number[] = [];
  let at: Element | null = el;
  const body = el.ownerDocument.body;
  while (at && at !== body) {
    const parent: Element | null = at.parentElement;
    if (!parent) return null;
    path.unshift(Array.prototype.indexOf.call(parent.children, at));
    at = parent;
  }
  return at ? path : null;
};

const atPath = (doc: Document, path: number[]) => {
  let at: Element | null = doc.body;
  for (const i of path) at = at?.children[i] ?? null;
  return at;
};

const pickable = (el: Element | null): el is Element =>
  !!el &&
  !el.hasAttribute(OVERLAY) &&
  el !== el.ownerDocument.body &&
  el !== el.ownerDocument.documentElement;

// Select: the pointer outlines and a click picks, the platform does not
// see it. Interact: the platform as usual, to log in or navigate.
// `rootOf`: a badge's component, so pointing at a badge means its component.
const useFrameSelection = (
  frame: Window | null,
  loads: number,
  tool: Tool,
  rootOf: (el: Element) => Element | undefined
) => {
  const [selected, setSelected] = useState<Element | null>(null);
  const [version, setVersion] = useState(0);
  const path = useRef<number[] | null>(null);

  const pick = useCallback((el: Element | null) => {
    path.current = el ? pathFrom(el) : null;
    setSelected(el);
    setVersion((v) => v + 1);
  }, []);

  // A new page in the frame starts with nothing picked.
  useEffect(() => {
    path.current = null;
    setSelected(null);
  }, [frame, loads]);

  useEffect(() => {
    if (!frame) return undefined;
    let doc: Document;
    try {
      doc = frame.document;
    } catch {
      return undefined;
    }
    const hover = overlay(doc, 'hover');
    const chosen = overlay(doc, 'selected');
    let hovered: Element | null = null;
    let raf = 0;
    const tick = () => {
      // A hot reload replaced the element: the same place, read again.
      if (selected && !selected.isConnected && path.current) {
        const again = atPath(doc, path.current);
        if (again) {
          setSelected(again);
          setVersion((v) => v + 1);
        }
      }
      place(chosen, selected);
      place(hover, tool === 'select' && hovered !== selected ? hovered : null);
      raf = frame.requestAnimationFrame(tick);
    };
    raf = frame.requestAnimationFrame(tick);
    if (tool !== 'select') {
      return () => {
        frame.cancelAnimationFrame(raf);
        hover.style.display = 'none';
      };
    }
    // A transparent cover takes the pointer, so the page shows no hover
    // or press style. A modal in the top layer (a <dialog>) sits above any
    // cover: listeners on the frame's window, in the capture phase, stop
    // the event before the page sees it there too.
    const cover = doc.createElement('div');
    cover.setAttribute(OVERLAY, 'cover');
    cover.style.cssText =
      'position:fixed;inset:0;z-index:2147483646;cursor:default;background:transparent';
    doc.body.appendChild(cover);
    const under = (e: MouseEvent) => {
      const all = doc.elementsFromPoint(e.clientX, e.clientY);
      for (const el of all) {
        const root = rootOf(el);
        if (root) return root;
      }
      return all.find(pickable) ?? null;
    };
    const onMove = (e: PointerEvent) => {
      hovered = under(e);
    };
    const onLeave = () => {
      hovered = null;
    };
    const swallow = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    const onClick = (e: MouseEvent) => {
      swallow(e);
      const el = under(e);
      // The picked element again puts it down.
      pick(el === selected ? null : el);
    };
    const onWheel = (e: WheelEvent) => {
      // The page under the cover still scrolls.
      if (e.target === cover) frame.scrollBy(e.deltaX, e.deltaY);
    };
    const PRESS = [
      'pointerdown',
      'mousedown',
      'pointerup',
      'mouseup',
      'dblclick',
      'auxclick',
      'contextmenu',
      'submit',
    ];
    frame.addEventListener('pointermove', onMove, true);
    doc.addEventListener('pointerleave', onLeave);
    PRESS.forEach((t) => frame.addEventListener(t, swallow, true));
    frame.addEventListener('click', onClick, true);
    cover.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      frame.cancelAnimationFrame(raf);
      cover.remove();
      frame.removeEventListener('pointermove', onMove, true);
      doc.removeEventListener('pointerleave', onLeave);
      PRESS.forEach((t) => frame.removeEventListener(t, swallow, true));
      frame.removeEventListener('click', onClick, true);
      hover.style.display = 'none';
    };
  }, [frame, loads, tool, selected, pick, rootOf]);

  return { selected, version, pick };
};

// The devices the frame takes the width of; the platform has no story to
// fit, so Fit is left out.
type Device = Exclude<CanvasViewport, 'fit'>;
const DEVICES = VIEWPORT_ICONS.filter(
  (v): v is typeof v & { value: Device } => v.value !== 'fit'
);

// The frame at the device's width, scaled to the zoom; it fills the
// stage's height whatever the scale. Fit shrinks a wide device to the
// stage and never enlarges a narrow one.
const useFrameSize = (device: GvViewport, zoom: Zoom) => {
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [room, setRoom] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!stage) return undefined;
    const measure = () => {
      const cs = getComputedStyle(stage);
      setRoom({
        width:
          stage.clientWidth -
          parseFloat(cs.paddingLeft) -
          parseFloat(cs.paddingRight),
        height:
          stage.clientHeight -
          parseFloat(cs.paddingTop) -
          parseFloat(cs.paddingBottom),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [stage]);
  const width = parseInt(GV_VIEWPORTS[device].styles.width, 10);
  const fitScale = room.width ? Math.min(1, room.width / width) : 1;
  const scale = zoom === 'fit' ? fitScale : zoom;
  const height = Math.max(room.height, 200);
  return { setStage, width, height, scale, fitScale };
};

const MARK = {
  strong: { line: '#f24822', fill: '#f24822', text: '#fff', style: 'solid' },
  faint: {
    line: '#ffa62999',
    fill: '#ffa629',
    text: '#1e1e1e',
    style: 'dashed',
  },
};
// Boxes smaller than this get no badge: an icon's wrapper would bury the page.
const MIN_BOX = { w: 32, h: 20 };

type Group = {
  name: string;
  file: string;
  level: Level;
  count: number;
  els: Element[];
};

// Inspect's off-spec badges: one box and badge per mounted component whose
// file the scan marks, or that has no story, drawn in the frame above the
// page and under the select cover. Read again every two seconds (the page
// changes under it) and placed again on scroll and resize.
const useMarks = (
  frame: Window | null,
  loads: number,
  on: boolean,
  byFile: Map<string, FileMarks>,
  hasStory: (file: string) => boolean
) => {
  const [count, setCount] = useState(0);
  const roots = useRef(new WeakMap<Element, Element>());
  const rootOf = useCallback((el: Element) => roots.current.get(el), []);

  useEffect(() => {
    if (!frame || !on) {
      setCount(0);
      return undefined;
    }
    let doc: Document;
    try {
      doc = frame.document;
    } catch {
      return undefined;
    }
    const layer = doc.createElement('div');
    layer.setAttribute(OVERLAY, 'marks');
    layer.style.cssText =
      'position:absolute;left:0;top:0;width:0;height:0;z-index:2147483645;pointer-events:none';
    doc.body.appendChild(layer);
    let groups: Group[] = [];

    const read = () => {
      const byMount = new Map<object, Group>();
      for (const el of Array.from(doc.body.querySelectorAll('*'))) {
        if (el.closest(`[${OVERLAY}]`)) continue;
        const o = ownerOf(el);
        if (!o) continue;
        let g = o.keys.map((k) => byMount.get(k)).find(Boolean);
        if (!g) {
          const marks = byFile.get(o.file);
          const level = badgeLevel(marks, hasStory(o.file));
          if (!level) continue;
          g = {
            name: o.name,
            file: o.file,
            level,
            count: (marks?.strong ?? 0) + (marks?.faint ?? 0),
            els: [],
          };
        }
        o.keys.forEach((k) => byMount.set(k, g!));
        g.els.push(el);
      }
      groups = Array.from(new Set(byMount.values()));
    };

    const place = () => {
      layer.replaceChildren();
      const sx = frame.scrollX;
      const sy = frame.scrollY;
      let shown = 0;
      for (const g of groups) {
        let l = Infinity;
        let t = Infinity;
        let r = -Infinity;
        let b = -Infinity;
        let root: Element | undefined;
        let area = 0;
        for (const el of g.els) {
          if (!el.isConnected) continue;
          const box = el.getBoundingClientRect();
          if (!box.width || !box.height) continue;
          l = Math.min(l, box.left);
          t = Math.min(t, box.top);
          r = Math.max(r, box.right);
          b = Math.max(b, box.bottom);
          if (box.width * box.height > area) {
            area = box.width * box.height;
            root = el;
          }
        }
        if (!root || r - l < MIN_BOX.w || b - t < MIN_BOX.h) continue;
        const c = MARK[g.level];
        const frameBox = doc.createElement('div');
        frameBox.style.cssText = `position:absolute;left:${l + sx}px;top:${
          t + sy
        }px;width:${r - l}px;height:${
          b - t
        }px;box-sizing:border-box;border:1.5px ${c.style} ${
          c.line
        };border-radius:2px`;
        const badge = doc.createElement('div');
        badge.setAttribute(OVERLAY, 'badge');
        badge.textContent = g.count
          ? `${g.name} · ${g.count}`
          : `${g.name} · no story`;
        badge.title = `${g.file}: ${
          g.count ? `${g.count} to fix` : 'no story in the workbench'
        }`;
        badge.style.cssText = `position:absolute;left:${l + sx}px;top:${
          t + sy
        }px;max-width:${Math.max(
          r - l,
          60
        )}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:1px 6px;font:600 11px/16px system-ui,sans-serif;color:${
          c.text
        };background:${
          c.fill
        };border-radius:2px 0 4px 0;pointer-events:auto;cursor:pointer`;
        roots.current.set(badge, root);
        layer.append(frameBox, badge);
        shown += 1;
      }
      setCount(shown);
    };

    read();
    place();
    let raf = 0;
    const later = () => {
      frame.cancelAnimationFrame(raf);
      raf = frame.requestAnimationFrame(place);
    };
    const id = frame.setInterval(() => {
      read();
      place();
    }, 2000);
    doc.addEventListener('scroll', later, true);
    frame.addEventListener('resize', later);
    return () => {
      frame.clearInterval(id);
      frame.cancelAnimationFrame(raf);
      doc.removeEventListener('scroll', later, true);
      frame.removeEventListener('resize', later);
      layer.remove();
    };
  }, [frame, loads, on, byFile, hasStory]);

  return { count, rootOf };
};

// "To fix" rows shown before "Show all".
const FIX_FIRST = 8;

const siteText = (s: Site) => `${s.file}:${s.line}`;

// The parents of the picked element up to the page's body, nearest first.
const parentsOf = (el: Element): Element[] => {
  const out: Element[] = [];
  let at = el.parentElement;
  while (at && at !== el.ownerDocument.body) {
    out.push(at);
    at = at.parentElement;
  }
  return out;
};

const SECTION_ICON: Record<Section, IconName> = {
  components: 'components',
  patterns: 'patterns',
  pages: 'pages',
};
const SECTION_WORD: Record<Section, string> = {
  components: 'Component',
  patterns: 'Pattern',
  pages: 'Page',
};

// A story whose title starts with no section shows in the Patterns gallery
// (Outside the sections), so it opens there.
const sectionOfGroup = (g: StoryGroup): Section => g.section ?? 'patterns';

const dirOf = (file: string) => file.slice(0, file.lastIndexOf('/'));

// The workbench's stories for the code the element sits in, nearest first:
// the stories of the very file (the plain one before a redesign variant),
// else of a file in the same folder (a component's styled parts live
// beside its index).
const storiesOf = (src: Source | null, groups: StoryGroup[] | null) => {
  if (!src || !groups) return [];
  const withStory = groups
    .filter((g) => g.file)
    .sort((x, y) => Number(x.redesigned) - Number(y.redesigned));
  const out: StoryGroup[] = [];
  const site = componentSite(src);
  for (const s of site ? [site, ...src.sites] : src.sites) {
    const same = withStory.filter((g) => g.file === s.file);
    const near = same.length
      ? same
      : withStory.filter((g) => dirOf(g.file!) === dirOf(s.file));
    near.forEach((g) => out.includes(g) || out.push(g));
  }
  return out.slice(0, 4);
};

// What the person sees and the agent reads: the component, where it is
// written, what it is given, and its values with their tokens.
type Reading = {
  label: string;
  source: Source | null;
  inspection: Inspection | null;
};

const read = (el: Element, meta: TokenMeta[]): Reading => {
  const doc = el.ownerDocument;
  return {
    label: labelOf(el),
    source: sourceOf(el),
    inspection: inspectElement(el, meta, (family) => {
      try {
        return doc.fonts.check(`12px ${family}`);
      } catch {
        return true;
      }
    }),
  };
};

const componentOf = (src: Source | null) => {
  const s = componentSite(src);
  if (!s) return undefined;
  return isLibrary(s) ? s.owner ?? s.element : s.element;
};

const valuesOf = (insp: Inspection | null) =>
  (insp?.sections ?? []).flatMap((sec) =>
    sec.rows.map((r) => ({
      section: sec.label,
      label: r.label,
      value: r.value.shown,
      token: r.value.token ? shortName(r.value.token) : undefined,
      link: r.value.link,
    }))
  );

const contextOf = (r: Reading, url: string, ask: string) => ({
  ask,
  url,
  element: r.label,
  component: componentOf(r.source) ?? null,
  // Nearest first: where the JSX is written, then where it is used.
  sites: r.source?.sites ?? [],
  props: Object.fromEntries(r.source?.props ?? []),
  values: valuesOf(r.inspection),
});

const promptOf = (r: Reading, ask: string) =>
  [
    `In the Go Vocal front end, change the element I picked in the workbench Inspect tab (${
      componentOf(r.source) ?? r.label
    }): ${ask || 'see the details'}.`,
    'Its file, line, props, values and tokens are in .git/ds-local/selection.json (run `git rev-parse --git-dir` for the folder).',
    'Edit the component code there, using design tokens, not raw values. The page repaints on save.',
  ].join(' ');

// The Inspect page: the local platform in a frame. A click on anything in
// it shows the component, where its code is, its props and tokens, and
// hands all that to the person's agent; the agent's edits repaint at once
// and list under Saved, to undo or push.
const Inspect = ({ meta }: { meta: TokenMeta[] }) => {
  const local = useLocal();
  const [path, setPath] = useState(readPath);
  const [address, setAddress] = useState(path);
  const [tool, setTool] = useState<Tool>('select');
  const [frame, setFrame] = useState<Window | null>(null);
  const [loads, setLoads] = useState(0);
  const [ask, setAsk] = useState('');
  const [handed, setHanded] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [device, setDevice] = useState<Device>('gvDesktop');
  const [zoom, setZoom] = useState<Zoom>('fit');
  const [savedOpen, setSavedOpen] = useState(false);
  const ref = useRef<HTMLIFrameElement>(null);
  const groups = useStoryGroups();
  const [scanMarks, setScanMarks] = useState<Map<string, FileMarks>>(
    () => new Map()
  );
  useEffect(() => {
    loadScan().then((scan) => setScanMarks(marksByFile(scan.findings ?? [])));
  }, []);
  const hasStory = useCallback(
    (file: string) =>
      storiesOf({ sites: [{ file, line: 0, element: '' }], props: [] }, groups)
        .length > 0,
    [groups]
  );
  const [marksOn, setMarksOn] = useState(false);
  const marks = useMarks(
    frame,
    loads,
    marksOn && tool === 'select' && !!groups,
    scanMarks,
    hasStory
  );
  const { selected, version, pick } = useFrameSelection(
    frame,
    loads,
    tool,
    marks.rootOf
  );
  const size = useFrameSize(device, zoom);
  const [ancestors, setAncestors] = useState(false);
  const [fixAll, setFixAll] = useState(false);
  useEffect(() => {
    setAncestors(false);
    setFixAll(false);
  }, [selected]);

  const close = useCallback(() => {
    pick(null);
    setSavedOpen(false);
  }, [pick]);

  // Esc puts the panel away, from the shell or from the page in the frame.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const t = e.target as HTMLElement | null;
      if (t?.closest?.('input, textarea, select')) return;
      close();
    };
    window.addEventListener('keydown', onKey);
    try {
      frame?.addEventListener('keydown', onKey);
    } catch {
      // Another origin.
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      try {
        frame?.removeEventListener('keydown', onKey);
      } catch {
        // Another origin.
      }
    };
  }, [frame, close]);
  const [reading, setReading] = useState<Reading | null>(null);

  useEffect(() => {
    setReading(selected ? read(selected, meta) : null);
    setHanded(undefined);
    // Read again on a hot reload and every pick.
  }, [selected, version, meta]);

  // An agent edits files behind the page: read the list now and then. The
  // platform navigates in place, so the address is read too.
  const refresh = useRef(local?.refresh);
  refresh.current = local?.refresh;
  useEffect(() => {
    const id = window.setInterval(() => {
      refresh.current?.();
      try {
        const loc = ref.current?.contentWindow?.location;
        const at = loc ? loc.pathname + loc.search : '';
        if (at && document.activeElement?.id !== 'wb-ins-path') {
          setAddress(at);
          writePath(at);
        }
      } catch {
        // Another origin.
      }
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  const onLoad = () => {
    const win = ref.current?.contentWindow ?? null;
    setFrame(win);
    setLoads((n) => n + 1);
    try {
      const at = win ? win.location.pathname + win.location.search : '';
      if (at) {
        setAddress(at);
        writePath(at);
      }
    } catch {
      // Another origin.
    }
  };

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const p = address.startsWith('/') ? address : `/${address}`;
    writePath(p);
    if (p === path && ref.current) ref.current.src = p;
    setPath(p);
  };

  if (!local) {
    return (
      <article className="wb-page">
        <header className="wb-page-head">
          <h1>Inspect</h1>
        </header>
        <section className="wb-empty" aria-label="Local run needed">
          <PlaceholderArt kind="review" />
          <div className="wb-empty-text">
            <span className="wb-badge wb-badge-soon">Local only</span>
            <h2>Click anything in your local platform</h2>
            <p className="wb-muted">
              Run <code>npm run ds:local</code> in front/ and open the workbench
              it serves. This tab then shows your platform: click an element to
              see its component, code and tokens, and hand it to your agent.
            </p>
          </div>
        </section>
      </article>
    );
  }

  const src = reading?.source ?? null;
  const target = componentSite(src);
  const name = componentOf(src);
  const stories = storiesOf(src, groups);
  const own = selected ? ownerOf(selected) : null;
  const toFix = own ? scanMarks.get(own.file) : undefined;
  const tokenHref = (token?: string) => {
    const t = token && meta.find((m) => m.name === token);
    return t ? `#/foundations/${t.category}/${t.name}` : undefined;
  };
  const hand = async () => {
    if (!reading || !target) return;
    const url = frame?.location.pathname ?? path;
    const ok = await local.pick(
      {
        file: target.file,
        line: target.line,
        also: src!.sites.filter((s) => s !== target).map((s) => s.file),
      },
      `${name ?? reading.label}${ask ? `: ${ask}` : ''}`.slice(0, 120),
      contextOf(reading, url, ask)
    );
    if (ok) setHanded(promptOf(reading, ask));
  };

  return (
    <article className="wb-inspect-page" data-testid="wb-inspect">
      <div className="wb-ins-stage" ref={size.setStage}>
        <div
          className="wb-ins-sized"
          style={{ width: size.width * size.scale, height: size.height }}
        >
          <iframe
            ref={ref}
            title="Your local platform"
            src={path}
            onLoad={onLoad}
            data-testid="wb-ins-frame"
            style={{
              width: size.width,
              height: size.height / size.scale,
              transform: `scale(${size.scale})`,
            }}
          />
        </div>
      </div>
      <div
        className="wb-float-bar"
        role="toolbar"
        aria-label="Page"
        data-testid="wb-float-bar"
      >
        <form className="wb-ins-address" onSubmit={go}>
          <Icon name="route" size={14} />
          <label className="wb-visually-hidden" htmlFor="wb-ins-path">
            Page
          </label>
          <input
            id="wb-ins-path"
            value={address}
            spellCheck={false}
            title="The page's path; Enter opens it"
            onChange={(e) => setAddress(e.target.value)}
          />
        </form>
        <Segmented<Tool>
          label="Tool"
          value={tool}
          testId="wb-tool"
          options={[
            {
              value: 'select',
              label: (
                <>
                  <Icon name="pointer" size={16} />
                  <span className="wb-visually-hidden">Select</span>
                </>
              ),
              title: 'Select',
            },
            {
              value: 'interact',
              label: (
                <>
                  <Icon name="hand" size={16} />
                  <span className="wb-visually-hidden">Interact</span>
                </>
              ),
              title: 'Interact: log in or click through',
            },
          ]}
          onChange={setTool}
        />
        <Segmented<Device>
          label="Viewport"
          value={device}
          testId="wb-toolbar-viewport"
          options={DEVICES.map((v) => ({
            value: v.value,
            label: (
              <>
                <Icon name={v.icon} size={16} />
                <span className="wb-visually-hidden">{v.label}</span>
              </>
            ),
            title: v.label,
          }))}
          onChange={setDevice}
        />
        <ZoomControl zoom={zoom} fitScale={size.fitScale} onChange={setZoom} />
        <div className="wb-segmented">
          <button
            type="button"
            aria-pressed={marksOn}
            disabled={tool !== 'select'}
            title={
              tool === 'select'
                ? 'Mark the components to fix: red off the scale or local markup, amber hand-typed values, old theme reads or no story'
                : 'Marks show in Select'
            }
            data-testid="wb-ins-marks"
            onClick={() => setMarksOn((o) => !o)}
          >
            <Icon name="alert" size={16} />
            Off-spec
            {marksOn && tool === 'select' && (
              <span className="wb-segmented-count">{marks.count}</span>
            )}
          </button>
        </div>
        <div className="wb-segmented">
          <button
            type="button"
            aria-pressed={savedOpen}
            title="Saved, not pushed"
            data-testid="wb-ins-saved"
            onClick={() => setSavedOpen((o) => !o)}
          >
            <Icon name="file" size={16} />
            Saved
            <span className="wb-segmented-count">
              {local.status.edits.length}
            </span>
          </button>
        </div>
      </div>
      {(reading || savedOpen) && (
        <Panel
          title="Inspect"
          header={
            <div className="wb-ins-head">
              <h2>{reading ? 'Inspect' : 'Saved'}</h2>
              <button
                type="button"
                className="wb-heal-close"
                aria-label="Close the panel"
                title="Close (Esc)"
                data-testid="wb-ins-close"
                onClick={close}
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          }
        >
          <div className="wb-insp wb-ins-design" data-testid="wb-ins-panel">
            {reading && selected && (
              <>
                <section
                  className="wb-insp-block wb-insp-prop"
                  data-testid="wb-insp-selection"
                >
                  <button
                    type="button"
                    className="wb-insp-layer"
                    data-testid="wb-insp-layer"
                    aria-haspopup="menu"
                    aria-expanded={ancestors}
                    aria-label={`Layer ${reading.label}. Select a parent`}
                    onClick={() => setAncestors((a) => !a)}
                  >
                    <Icon name="layers" size={14} />
                    <span className="wb-insp-layer-name">{reading.label}</span>
                    <Icon name="chevron" size={14} />
                  </button>
                  {ancestors && (
                    <ul
                      className="wb-insp-ancestors"
                      role="menu"
                      aria-label="Parents"
                    >
                      {parentsOf(selected).map((el, i) => (
                        <li key={i} role="none">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              pick(el);
                              setAncestors(false);
                            }}
                          >
                            <Icon name="up" size={14} />
                            {labelOf(el)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section
                  className="wb-insp-block wb-ins-comp"
                  data-testid="wb-ins-comp"
                >
                  <h3 data-testid="wb-ins-name">{name ?? 'Not a component'}</h3>
                  {!src && (
                    <p className="wb-muted">
                      React did not render this element, or this is not a dev
                      build.
                    </p>
                  )}
                  {src && !stories.length && (
                    <p className="wb-muted">
                      {groups
                        ? 'No story in the workbench.'
                        : 'Reading the stories.'}
                    </p>
                  )}
                  {stories.length > 0 && (
                    <ul className="wb-ins-open" data-testid="wb-ins-stories">
                      {stories.map((g) => (
                        <li key={g.title}>
                          <a
                            href={storyHash(sectionOfGroup(g), g.defaultId)}
                            target="_blank"
                            rel="noopener"
                            data-testid="wb-ins-open"
                            title={`Open ${g.name} in the workbench`}
                          >
                            <Icon
                              name={SECTION_ICON[sectionOfGroup(g)]}
                              size={14}
                            />
                            <span className="wb-ins-open-name">{g.name}</span>
                            <span className="wb-muted">
                              {SECTION_WORD[sectionOfGroup(g)]}
                            </span>
                            <Icon name="external" size={12} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {toFix && own && (
                  <InspSection
                    id="ins-fix"
                    title="To fix"
                    count={toFix.findings.length}
                  >
                    <p className="wb-muted wb-insp-full wb-ins-fix-file">
                      <code title={own.file}>
                        {own.file.split('/').slice(-2).join('/')}
                      </code>
                    </p>
                    <ul
                      className="wb-ins-fix wb-insp-full"
                      data-testid="wb-ins-fix"
                    >
                      {(fixAll
                        ? toFix.findings
                        : toFix.findings.slice(0, FIX_FIRST)
                      ).map((f) => {
                        const token = healToken(f, meta)[0];
                        return (
                          <li
                            key={`${f.line}:${f.col}`}
                            data-level={f.level}
                            title={`${f.category}, line ${f.line}`}
                          >
                            <span
                              className="wb-ins-fix-dot"
                              aria-hidden="true"
                            />
                            <code>{f.raw.replace(/\s+/g, '')}</code>
                            <Icon name="arrow" size={12} />
                            {token ? (
                              <code className="wb-ins-token">
                                {shortName(token)}
                              </code>
                            ) : (
                              <span className="wb-muted">
                                {f.category === 'styled-block'
                                  ? 'library component'
                                  : 'choose'}
                              </span>
                            )}
                            <span className="wb-muted wb-ins-fix-line">
                              L{f.line}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    {!fixAll && toFix.findings.length > FIX_FIRST && (
                      <button
                        type="button"
                        className="wb-controls-more wb-insp-full"
                        onClick={() => setFixAll(true)}
                      >
                        {`Show all ${toFix.findings.length}`}
                      </button>
                    )}
                  </InspSection>
                )}

                {reading.inspection?.sections
                  .filter((sec) => sec.rows.length > 0)
                  .map((sec) => (
                    <InspSection key={sec.id} id={sec.id} title={sec.label}>
                      {sec.rows.map((r) => (
                        <div
                          key={`${sec.id}:${r.id}`}
                          className={
                            r.half
                              ? 'wb-insp-prop'
                              : 'wb-insp-prop wb-insp-full'
                          }
                        >
                          <ValueField
                            row={{ ...r, editable: false }}
                            tokenHref={tokenHref(r.value.token)}
                            onCommit={() => false}
                            onAttach={() => undefined}
                            onDetach={() => undefined}
                            onOpenPicker={() => undefined}
                          />
                        </div>
                      ))}
                    </InspSection>
                  ))}

                {!!src?.sites.length && (
                  <InspSection
                    id="ins-code"
                    title="Code"
                    count={src.sites.length}
                    defaultOpen={false}
                  >
                    <ol
                      className="wb-ins-sites wb-insp-full"
                      data-testid="wb-ins-sites"
                    >
                      {src.sites.map((s, i) => (
                        <li key={i}>
                          <code title={siteText(s)}>
                            {s.file.split('/').slice(-2).join('/')}:{s.line}
                          </code>
                          <span className="wb-muted">
                            {`<${s.element}>`}
                            {s.owner && ` in ${s.owner}`}
                            {isLibrary(s) && ' · library'}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </InspSection>
                )}

                {!!src?.props.length && (
                  <details
                    className="wb-insp-block wb-insp-props"
                    data-testid="wb-insp-props"
                  >
                    <summary className="wb-insp-head">
                      <h3>Props</h3>
                      <Icon name="chevron" size={14} />
                    </summary>
                    <ul className="wb-ins-values wb-ins-props">
                      {src.props.map(([k, v]) => (
                        <li key={k}>
                          <span className="wb-muted">{k}</span>
                          <code>{v}</code>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {target && (
                  <section className="wb-insp-block wb-ins-hand">
                    <label htmlFor="wb-ins-ask">What should change?</label>
                    <textarea
                      id="wb-ins-ask"
                      rows={3}
                      value={ask}
                      placeholder="Use the primary colour and a larger radius"
                      onChange={(e) => setAsk(e.target.value)}
                    />
                    <button
                      type="button"
                      className="wb-button wb-button-primary"
                      data-testid="wb-ins-hand"
                      disabled={local.busy}
                      onClick={hand}
                    >
                      <Icon name="pointer" size={14} />
                      Hand to my agent
                    </button>
                    {handed && (
                      <div className="wb-ins-prompt" role="status">
                        <p className="wb-muted">
                          Handed over. Paste this to your agent; its edits
                          repaint here and list under Saved.
                        </p>
                        <pre data-testid="wb-ins-prompt">{handed}</pre>
                        <button
                          type="button"
                          className="wb-button"
                          onClick={async () =>
                            setCopied(await copyText(handed))
                          }
                        >
                          <Icon name={copied ? 'check' : 'copy'} size={14} />
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
            <div className="wb-insp-block">
              <LocalSave
                changes={[]}
                patch="[]"
                elements={[]}
                onSavedTokens={() => undefined}
              />
            </div>
          </div>
        </Panel>
      )}
    </article>
  );
};

export default Inspect;
