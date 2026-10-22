import { useCallback, useEffect, useRef, useState } from 'react';

import { GV_VIEWPORTS } from '../../../viewports';
import { applyToDocument, storyUrl } from '../lib/frame';
import type { Overrides } from '../lib/overrides';

import type { ToolbarState } from './Toolbar';

type Props = {
  storyId: string;
  toolbar: ToolbarState;
  overrides: Overrides;
  // Called with the frame's window after each load (the Controls panel
  // talks to the story through it), and with null when the frame goes.
  onFrame?: (win: Window | null) => void;
  // A caption over the frame, for the side by side view.
  label?: string;
};

type Channel = {
  on: (event: string, fn: () => void) => void;
  off: (event: string, fn: () => void) => void;
};

type Size = { w: number; h: number };

// Fit: room under the story, and the frame height before the first
// measure and its bounds after.
const FIT_PAD = 24;
const FIT_START_H = 160;
const FIT_MIN_H = 96;
const FIT_MAX_H = 1600;

// The story's own size at a frame width: the frame is set 1px tall for the
// read, so content sized to the viewport (100vh) does not count, then put
// back. Both happen in one task, so nothing paints in between.
const measure = (iframe: HTMLIFrameElement, width: number): Size | null => {
  const doc = iframe.contentDocument;
  const root = doc?.getElementById('storybook-root');
  if (!doc || !root) return null;
  const { width: w, height: h } = iframe.style;
  iframe.style.width = `${width}px`;
  iframe.style.height = '1px';
  const size = {
    w: doc.documentElement.scrollWidth,
    h: doc.documentElement.scrollHeight,
  };
  iframe.style.width = w;
  iframe.style.height = h;
  return size;
};

// Storybook's preview frame for one story. With the `fit` viewport the
// frame is as wide as the canvas and as tall as the story, so a component
// shows at its real size; a story wider than the canvas is laid out at its
// own width and scaled down. A preset viewport sizes the frame to the
// preset and scales it down to the canvas. Mode, city and language are
// frame globals, so changing them reloads the frame; overrides are set on
// the frame's root element without a reload and set again whenever
// Storybook renders the story anew.
const Canvas = ({ storyId, toolbar, overrides, onFrame, label }: Props) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(0);
  const [fitted, setFitted] = useState<Size | null>(null);
  const fit = toolbar.viewport === 'fit';
  const latest = useRef({ overrides, mode: toolbar.mode, onFrame, fit, room });
  latest.current = { overrides, mode: toolbar.mode, onFrame, fit, room };

  const apply = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc?.documentElement) return;
    applyToDocument(doc, latest.current.overrides, latest.current.mode);
  }, []);

  const refit = useCallback(() => {
    const { fit: on, room: r } = latest.current;
    if (!on || r <= 0 || !frame.current) return;
    const size = measure(frame.current, r);
    if (!size) return;
    const next = {
      w: Math.max(r, size.w),
      h: Math.min(FIT_MAX_H, Math.max(FIT_MIN_H, size.h + FIT_PAD)),
    };
    setFitted((f) =>
      f && Math.abs(f.w - next.w) < 2 && Math.abs(f.h - next.h) < 2 ? f : next
    );
  }, []);

  // Each load: apply, re-apply and re-fit after every story render, and
  // re-fit when the story changes size (an opened menu, a loaded font).
  const watch = useRef<() => void>();
  const onLoad = useCallback(() => {
    watch.current?.();
    apply();
    const win = frame.current?.contentWindow as
      | (Window & {
          __STORYBOOK_ADDONS_CHANNEL__?: Channel;
          ResizeObserver: typeof ResizeObserver;
        })
      | null
      | undefined;
    const channel = win?.__STORYBOOK_ADDONS_CHANNEL__;
    let raf = 0;
    const later = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(refit);
    };
    const rendered = () => {
      apply();
      later();
    };
    channel?.on('storyRendered', rendered);
    const root = win?.document.getElementById('storybook-root');
    const observer = win && root ? new win.ResizeObserver(later) : undefined;
    if (root) observer?.observe(root);
    later();
    watch.current = () => {
      window.cancelAnimationFrame(raf);
      channel?.off('storyRendered', rendered);
      observer?.disconnect();
    };
    latest.current.onFrame?.(win ?? null);
  }, [apply, refit]);
  useEffect(() => () => watch.current?.(), []);

  useEffect(apply, [apply, overrides, toolbar.mode]);
  useEffect(refit, [refit, room, fit]);

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => setRoom(el.clientWidth - 2));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const src = storyUrl(storyId, {
    mode: toolbar.mode,
    city: toolbar.city,
    lang: toolbar.lang,
  });

  // A new src is a new frame: the old window is gone until it loads.
  useEffect(() => {
    setFitted(null);
    return () => latest.current.onFrame?.(null);
  }, [src]);

  let w: number;
  let h: number;
  if (toolbar.viewport === 'fit') {
    w = Math.max(room, fitted?.w ?? 0) || 1;
    h = fitted?.h ?? FIT_START_H;
  } else {
    const { width, height } = GV_VIEWPORTS[toolbar.viewport].styles;
    w = parseInt(width, 10);
    h = parseInt(height, 10);
  }
  const scale = room > 0 && w > room ? room / w : 1;

  return (
    <div className={fit ? 'wb-canvas wb-canvas-fit' : 'wb-canvas'} ref={box}>
      <p className="wb-canvas-size wb-muted">
        {label && <span className="wb-canvas-label">{label}</span>}
        <span>
          {fit ? 'Fit to story' : `${w} x ${h}`}
          {scale < 1 && `, shown at ${Math.round(scale * 100)}%`}
        </span>
      </p>
      <div style={{ width: w * scale, height: h * scale }}>
        <iframe
          ref={frame}
          key={src}
          src={src}
          title={`Story ${storyId}`}
          data-testid="wb-canvas"
          data-fit={fit ? (fitted ? 'done' : 'pending') : undefined}
          onLoad={onLoad}
          style={{
            width: w,
            height: h,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
        />
      </div>
    </div>
  );
};

export default Canvas;
