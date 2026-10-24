import { useCallback, useEffect, useRef, useState } from 'react';

import Icon from '../components/Icon';
import LocalSave from '../components/LocalSave';
import Panel from '../components/Panel';
import Segmented from '../components/Segmented';
import { copyText } from '../lib/clipboard';
import type { TokenMeta } from '../lib/data';
import { componentSite, isLibrary, Site, Source, sourceOf } from '../lib/fiber';
import { Inspection, inspectElement, labelOf, shortName } from '../lib/inspect';
import { useLocal } from '../lib/local';
import { OVERLAY, overlay, place, Tool } from '../lib/useCanvasSelection';
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
const useFrameSelection = (frame: Window | null, loads: number, tool: Tool) => {
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
    const under = (e: MouseEvent) =>
      doc.elementsFromPoint(e.clientX, e.clientY).find(pickable) ?? null;
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
      pick(under(e));
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
  }, [frame, loads, tool, selected, pick]);

  return { selected, version, pick };
};

const siteText = (s: Site) => `${s.file}:${s.line}`;

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

const Values = ({ insp }: { insp: Inspection | null }) => {
  const rows = valuesOf(insp).filter((v) => v.section !== 'Layout' || v.token);
  if (!rows.length) return null;
  return (
    <ul className="wb-ins-values" data-testid="wb-ins-values">
      {rows.map((v, i) => (
        <li key={i}>
          <span className="wb-muted">{v.label}</span>
          <span>{v.value}</span>
          {v.token ? (
            <code className="wb-ins-token" title={v.link}>
              {v.token}
            </code>
          ) : (
            <span className="wb-ins-raw">no token</span>
          )}
        </li>
      ))}
    </ul>
  );
};

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
  const ref = useRef<HTMLIFrameElement>(null);
  const { selected, version, pick } = useFrameSelection(frame, loads, tool);
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
      <header className="wb-review-head">
        <div>
          <p className="wb-eyebrow">Local platform</p>
          <h1>Inspect</h1>
          <p className="wb-lead">
            Click anything to see its component and tokens, then hand it to your
            agent. Switch to Interact to log in or click through.
          </p>
        </div>
      </header>
      <div className="wb-ins-bar">
        <form className="wb-ins-address" onSubmit={go}>
          <label className="wb-visually-hidden" htmlFor="wb-ins-path">
            Page
          </label>
          <input
            id="wb-ins-path"
            value={address}
            spellCheck={false}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button type="submit" className="wb-button">
            Go
          </button>
        </form>
        <Segmented
          label="Pointer"
          value={tool}
          options={[
            { value: 'select', label: 'Select' },
            { value: 'interact', label: 'Interact' },
          ]}
          onChange={(v) => setTool(v as Tool)}
        />
      </div>
      <div className="wb-ins-stage">
        <iframe
          ref={ref}
          title="Your local platform"
          src={path}
          onLoad={onLoad}
          data-testid="wb-ins-frame"
        />
      </div>
      <Panel title="Inspect">
        <div className="wb-inspect" data-testid="wb-ins-panel">
          {!reading ? (
            <p className="wb-muted">
              {tool === 'select'
                ? 'Click an element in the page.'
                : 'Switch to Select, then click an element.'}
            </p>
          ) : (
            <>
              <section className="wb-ins-what">
                <h3 data-testid="wb-ins-name">{name ?? 'Not a component'}</h3>
                <p className="wb-muted">{reading.label}</p>
                {selected?.parentElement &&
                  selected.parentElement !== selected.ownerDocument.body && (
                    <button
                      type="button"
                      className="wb-button wb-ins-parent"
                      data-testid="wb-ins-parent"
                      onClick={() => pick(selected.parentElement)}
                    >
                      <Icon name="up" size={14} />
                      Select parent
                    </button>
                  )}
                {!src && (
                  <p className="wb-muted">
                    React did not render this element, or this is not a dev
                    build.
                  </p>
                )}
              </section>
              {!!src?.sites.length && (
                <section>
                  <h4 className="wb-drawer-group">Code</h4>
                  <ol className="wb-ins-sites" data-testid="wb-ins-sites">
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
                </section>
              )}
              {!!src?.props.length && (
                <section>
                  <h4 className="wb-drawer-group">Props</h4>
                  <ul className="wb-ins-values wb-ins-props">
                    {src.props.map(([k, v]) => (
                      <li key={k}>
                        <span className="wb-muted">{k}</span>
                        <code>{v}</code>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section>
                <h4 className="wb-drawer-group">Values</h4>
                <Values insp={reading.inspection} />
              </section>
              {target && (
                <section className="wb-ins-hand">
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
                        Handed over. Paste this to your agent; its edits repaint
                        here and list under Saved.
                      </p>
                      <pre data-testid="wb-ins-prompt">{handed}</pre>
                      <button
                        type="button"
                        className="wb-button"
                        onClick={async () => setCopied(await copyText(handed))}
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
          <LocalSave
            changes={[]}
            patch="[]"
            elements={[]}
            onSavedTokens={() => undefined}
          />
        </div>
      </Panel>
    </article>
  );
};

export default Inspect;
