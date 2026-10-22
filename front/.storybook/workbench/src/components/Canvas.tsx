import { useCallback, useEffect, useRef, useState } from 'react';

import { GV_VIEWPORTS } from '../../../viewports';
import { applyToDocument, storyUrl } from '../lib/frame';
import type { Overrides } from '../lib/overrides';

import type { ToolbarState } from './Toolbar';

type Props = {
  storyId: string;
  toolbar: ToolbarState;
  overrides: Overrides;
};

type Channel = {
  on: (event: string, fn: () => void) => void;
  off: (event: string, fn: () => void) => void;
};

// Storybook's preview frame for one story, sized to the toolbar viewport
// and scaled down when the viewport is wider than the space for it.
// Mode, city and language are frame globals, so changing them reloads the
// frame; overrides are set on the frame's root element without a reload and
// set again whenever Storybook renders the story anew.
const Canvas = ({ storyId, toolbar, overrides }: Props) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(0);
  const latest = useRef({ overrides, mode: toolbar.mode });
  latest.current = { overrides, mode: toolbar.mode };

  const apply = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc?.documentElement) return;
    applyToDocument(doc, latest.current.overrides, latest.current.mode);
  }, []);

  // Each load: apply, and re-apply after every story render.
  const onLoad = useCallback(() => {
    apply();
    const win = frame.current?.contentWindow as
      | (Window & { __STORYBOOK_ADDONS_CHANNEL__?: Channel })
      | null
      | undefined;
    win?.__STORYBOOK_ADDONS_CHANNEL__?.on('storyRendered', apply);
  }, [apply]);

  useEffect(apply, [apply, overrides, toolbar.mode]);

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => setRoom(el.clientWidth - 2));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width, height } = GV_VIEWPORTS[toolbar.viewport].styles;
  const w = parseInt(width, 10);
  const h = parseInt(height, 10);
  const scale = room > 0 && w > room ? room / w : 1;
  const src = storyUrl(storyId, {
    mode: toolbar.mode,
    city: toolbar.city,
    lang: toolbar.lang,
  });

  return (
    <div className="wb-canvas" ref={box}>
      <p className="wb-canvas-size wb-muted">
        {`${w} x ${h}`}
        {scale < 1 && `, shown at ${Math.round(scale * 100)}%`}
      </p>
      <div style={{ width: w * scale, height: h * scale }}>
        <iframe
          ref={frame}
          key={src}
          src={src}
          title={`Story ${storyId}`}
          data-testid="wb-canvas"
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
