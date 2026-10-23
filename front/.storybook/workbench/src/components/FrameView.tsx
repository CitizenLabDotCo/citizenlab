import { useCallback, useEffect, useRef, useState } from 'react';

import type { Mode } from '@ds/tokens/tokens';

import type { Overrides } from '../lib/overrides';
import { applyEdits, FrameState, frameState } from '../lib/review';

import Icon from './Icon';

export type FrameReport = {
  state: FrameState | 'loading';
  // Some element of the page carries data-gv-component.
  tagged: boolean;
  // Instances of the highlighted component.
  count: number;
  // The path the frame shows now (the platform is a single page app).
  path?: string;
};

type Props = {
  side: 'before' | 'after';
  caption: string;
  url: string;
  // The route asked for, to spot an admin route that redirected away.
  route: string;
  width: number;
  height: number;
  // Token edits and mode put on the page; none on a Before frame.
  edits?: { overrides: Overrides; mode: Mode };
  highlight?: string;
  onReport?: (r: FrameReport) => void;
  onWindow?: (win: Window | null) => void;
  // Bumped to reload the frame.
  reloadKey: number;
};

const HIGHLIGHT_ID = 'gv-review-highlight';
const POLL_MS = 800;

const readDoc = (iframe: HTMLIFrameElement | null) => () =>
  iframe?.contentWindow?.document ?? null;

// The shell's --wb-highlight (shell.css); the frame does not have the
// shell's variables.
const HIGHLIGHT = '#c8006e';

const css = (name: string) =>
  `[data-gv-component="${name.replace(
    /["\\]/g,
    ''
  )}"]{outline:2px solid ${HIGHLIGHT}!important;outline-offset:2px!important;box-shadow:0 0 0 6px rgba(200,0,110,.16)!important}`;

// One platform page in a frame, laid out at the viewport preset's width and
// scaled down to the room it has. Same origin: the session's edits go on
// the page's root element on every load, instances of the highlighted
// component are outlined and counted, and the state (login, cross-origin)
// is read every POLL_MS, because the platform redirects after it boots.
const FrameView = ({
  side,
  caption,
  url,
  route,
  width,
  height,
  edits,
  highlight,
  onReport,
  onWindow,
  reloadKey,
}: Props) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState({ w: 0, h: 0 });
  const [report, setReport] = useState<FrameReport>({
    state: 'loading',
    tagged: false,
    count: 0,
  });
  const latest = useRef({ edits, highlight, route, onReport, onWindow });
  latest.current = { edits, highlight, route, onReport, onWindow };
  const applied = useRef(new WeakMap<Document, Map<string, string | null>>());
  const loaded = useRef(false);

  const apply = useCallback(() => {
    if (!loaded.current) return;
    let doc: Document | null = null;
    try {
      doc = frame.current?.contentWindow?.document ?? null;
    } catch {
      return;
    }
    if (!doc?.documentElement) return;
    const e = latest.current.edits;
    if (e) {
      let map = applied.current.get(doc);
      if (!map) {
        map = new Map();
        applied.current.set(doc, map);
      }
      applyEdits(doc, e.overrides, e.mode, map);
    }
    const name = latest.current.highlight;
    let style = doc.getElementById(HIGHLIGHT_ID);
    if (name && doc.head) {
      if (!style) {
        style = doc.createElement('style');
        style.id = HIGHLIGHT_ID;
        doc.head.appendChild(style);
      }
      if (style.textContent !== css(name)) style.textContent = css(name);
    } else {
      style?.remove();
    }
  }, []);

  const poll = useCallback(() => {
    if (!loaded.current) return;
    const iframe = frame.current;
    const state = frameState(readDoc(iframe), latest.current.route);
    let tagged = false;
    let count = 0;
    let path: string | undefined;
    if (state === 'ok' || state === 'login') {
      try {
        const doc = iframe?.contentWindow?.document;
        path = doc?.location?.pathname;
        tagged = !!doc?.querySelector('[data-gv-component]');
        const name = latest.current.highlight;
        if (name && tagged && doc) {
          count = doc.querySelectorAll(
            `[data-gv-component="${name.replace(/["\\]/g, '')}"]`
          ).length;
        }
      } catch {
        // Reported as cross-origin on the next read.
      }
    }
    setReport((r) =>
      r.state === state &&
      r.tagged === tagged &&
      r.count === count &&
      r.path === path
        ? r
        : { state, tagged, count, path }
    );
    // A page that rebuilt its head (or a late redirect) loses the style.
    apply();
  }, [apply]);

  useEffect(() => {
    latest.current.onReport?.(report);
  }, [report]);

  // A new URL or a reload: loading until the frame fires load.
  useEffect(() => {
    loaded.current = false;
    setReport({ state: 'loading', tagged: false, count: 0 });
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      window.clearInterval(timer);
      latest.current.onWindow?.(null);
    };
  }, [url, reloadKey, poll]);

  useEffect(apply, [apply, edits, highlight]);
  useEffect(poll, [poll, highlight]);

  const onLoad = () => {
    loaded.current = true;
    apply();
    poll();
    let win: Window | null = null;
    try {
      // Throws, or gives a window without a readable document, off origin.
      const w = frame.current?.contentWindow ?? null;
      if (w?.document) win = w;
    } catch {
      win = null;
    }
    latest.current.onWindow?.(win);
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() =>
      setRoom({ w: el.clientWidth, h: el.clientHeight })
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = room.w > 0 ? Math.min(1, room.w / width) : 1;
  // The frame fills the room's height at that scale (pages are long).
  const frameHeight = room.h > 0 ? Math.max(height, room.h / scale) : height;
  const loading = report.state === 'loading';
  const label = side === 'before' ? 'Before' : 'After';

  return (
    <section
      className={`wb-fview wb-fview-${side}`}
      aria-label={`${label}: ${caption}`}
      data-testid={`wb-frame-${side}`}
      data-state={report.state}
    >
      <header className="wb-fview-head">
        <span className={`wb-fview-label wb-fview-label-${side}`}>{label}</span>
        <span className="wb-fview-caption" title={caption}>
          {caption}
        </span>
        <span className="wb-fview-scale wb-muted">
          {width}px
          {scale < 1 && `, ${Math.round(scale * 100)}%`}
        </span>
        <a
          className="wb-icon-button"
          href={url}
          target="_blank"
          rel="noreferrer"
          title="Open this page in a new tab"
          aria-label={`Open the ${label.toLowerCase()} page in a new tab`}
        >
          <Icon name="external" size={16} />
        </a>
      </header>

      {report.state === 'cross-origin' && (
        <p className="wb-fview-hint wb-fview-hint-quiet" role="status">
          <Icon name="external" size={16} />
          <span>
            Another host: shown as is, without edits, sync scroll or highlight.
            It needs its own login once.
          </span>
        </p>
      )}

      <div className="wb-fview-room" ref={box}>
        <div
          className="wb-fview-paper"
          style={{ width: width * scale, height: frameHeight * scale }}
        >
          <iframe
            ref={frame}
            key={`${url}#${reloadKey}`}
            src={url}
            title={`${label}: ${url}`}
            onLoad={onLoad}
            data-testid={`wb-frame-${side}-iframe`}
            style={{
              width,
              height: frameHeight,
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
            }}
          />
        </div>
        {loading && (
          <div className="wb-fview-loading" aria-hidden="true">
            <div className="wb-skeleton-line" />
            <div className="wb-skeleton-line" />
            <div className="wb-skeleton-block" />
            <div className="wb-skeleton-line" />
            <span className="wb-muted">Loading the page</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default FrameView;
