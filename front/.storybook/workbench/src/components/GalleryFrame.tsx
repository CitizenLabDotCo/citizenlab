import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { frameScale, placeStory } from '../lib/gallery';
import {
  createGalleryRenderer,
  GalleryEntry,
  GalleryRenderer,
  ThumbState,
} from '../lib/galleryFrame';

import type { FrameGlobals } from '../lib/frame';

// What a card reads from the gallery's frame: its story's state, and where
// to report its preview box.
export type GallerySlot = {
  stateOf: (storyId: string) => ThumbState;
  register: (storyId: string, el: HTMLElement | null) => void;
};

export const GalleryContext = createContext<GallerySlot | null>(null);

// The preview with no story selected: it boots once and the gallery renders
// the cards' stories into it.
const FRAME_SRC = '../iframe.html?viewMode=story';

// Cards this close to the viewport render first.
const NEAR = '600px';

// Stories the shared frame cannot show, for the session: their cards go
// straight to a frame of their own, and a gallery of only such cards
// (Pages) boots no shared frame at all.
const ISOLATED = new Set<string>();

type Props = {
  globals: FrameGlobals;
  // Width each story is laid out at (see StoryThumb).
  frameWidth: number;
  children: ReactNode;
};

// The cards of a gallery with one preview frame over them. The frame
// does not take the pointer or focus; each card stays the link it was.
const GalleryFrame = ({ globals, frameWidth, children }: Props) => {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const renderer = useRef<GalleryRenderer | null>(null);
  const boxes = useRef(new Map<string, HTMLElement>());
  const near = useRef(new Set<string>());
  const [states, setStates] = useState<Record<string, ThumbState>>({});
  const [ids, setIds] = useState<string[]>([]);
  const [size, setSize] = useState({ k: 1, height: 0 });
  const globalsRef = useRef(globals);
  globalsRef.current = globals;

  // Where each card's preview box is, relative to the cards: from its list
  // item, which the card's hover lift does not move.
  const measure = useCallback(() => {
    const root = wrap.current;
    if (!root) return;
    const origin = root.getBoundingClientRect();
    const k = frameScale(origin.width, frameWidth);
    const entries: (GalleryEntry & { el: HTMLElement })[] = [];
    boxes.current.forEach((el, id) => {
      if (ISOLATED.has(id)) return;
      const card = el.parentElement;
      const item = card?.parentElement;
      if (!card || !item || !el.isConnected) return;
      const at = item.getBoundingClientRect();
      const own = el.getBoundingClientRect();
      const rect = {
        // On whole pixels, where a card's own frame is painted.
        x:
          Math.round(at.left + card.clientLeft + el.offsetLeft) -
          Math.round(origin.left),
        y:
          Math.round(at.top + card.clientTop + el.offsetTop) -
          Math.round(origin.top),
        // The padding box: the bottom border is the card's, not the story's.
        width: own.width - (el.offsetWidth - el.clientWidth),
        height: own.height - (el.offsetHeight - el.clientHeight),
      };
      const radius =
        parseFloat(getComputedStyle(card).borderTopLeftRadius) - card.clientTop;
      entries.push({
        id,
        el,
        placement: placeStory(rect, frameWidth, k, el.clientWidth),
        radius: Math.max(0, radius) / k,
      });
    });
    entries.sort((a, b) =>
      a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1
    );
    setSize({ k, height: origin.height });
    renderer.current?.layout(entries, k);
  }, [frameWidth]);

  // One measure per frame, however many cards changed.
  const queued = useRef(0);
  const schedule = useCallback(() => {
    if (queued.current) return;
    queued.current = requestAnimationFrame(() => {
      queued.current = 0;
      measure();
    });
  }, [measure]);

  const resize = useRef<ResizeObserver>();
  const intersect = useRef<IntersectionObserver>();
  useEffect(() => {
    resize.current = new ResizeObserver(schedule);
    intersect.current = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          const id = (r.target as HTMLElement).dataset.gvStory;
          if (!id) continue;
          if (r.isIntersecting) near.current.add(id);
          else near.current.delete(id);
        }
        renderer.current?.setNear(new Set(near.current));
      },
      { rootMargin: NEAR }
    );
    if (wrap.current) resize.current.observe(wrap.current);
    boxes.current.forEach((el) => {
      resize.current?.observe(el);
      intersect.current?.observe(el);
    });
    return () => {
      resize.current?.disconnect();
      intersect.current?.disconnect();
      cancelAnimationFrame(queued.current);
      queued.current = 0;
    };
  }, [schedule]);

  const register = useCallback(
    (storyId: string, el: HTMLElement | null) => {
      const old = boxes.current.get(storyId);
      if (old && old !== el) {
        resize.current?.unobserve(old);
        intersect.current?.unobserve(old);
        boxes.current.delete(storyId);
        near.current.delete(storyId);
      }
      if (el && old !== el) {
        el.dataset.gvStory = storyId;
        boxes.current.set(storyId, el);
        resize.current?.observe(el);
        intersect.current?.observe(el);
      }
      schedule();
      setIds((now) => {
        const next = Array.from(boxes.current.keys());
        return next.join() === now.join() ? now : next;
      });
    },
    [schedule]
  );

  const onLoad = () => {
    const win = frame.current?.contentWindow;
    renderer.current?.dispose();
    renderer.current = null;
    setStates({});
    if (!win) return;
    renderer.current = createGalleryRenderer(
      win,
      globalsRef.current,
      (id, state) => {
        if (state === 'isolated') ISOLATED.add(id);
        setStates((s) => ({ ...s, [id]: state }));
      }
    );
    renderer.current.setNear(new Set(near.current));
    backdrop();
    measure();
  };
  useEffect(() => () => renderer.current?.dispose(), []);

  useEffect(() => {
    renderer.current?.setGlobals(globals);
  }, [globals]);

  // In a dark shell a card's own frame had the browser's opaque white
  // backdrop (its page is light); the stories keep it.
  const backdrop = useCallback(() => {
    renderer.current?.setBackdrop(
      document.documentElement.dataset.wbTheme === 'dark'
    );
  }, []);
  useEffect(() => {
    const observer = new MutationObserver(backdrop);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-wb-theme'],
    });
    return () => observer.disconnect();
  }, [backdrop]);

  const stateOf = useCallback(
    (id: string): ThumbState =>
      states[id] ?? (ISOLATED.has(id) ? 'isolated' : 'loading'),
    [states]
  );
  const slot = useMemo<GallerySlot>(
    () => ({ stateOf, register }),
    [stateOf, register]
  );

  // Only once a card can show in it: with every card in a frame of its
  // own, the shared one would only compete with them.
  const shared = ids.some((id) => stateOf(id) !== 'isolated');
  useEffect(() => {
    if (shared) return;
    renderer.current?.dispose();
    renderer.current = null;
  }, [shared]);

  // The frame cannot be focused (a story that focuses itself would take
  // focus from the page). React 18 does not know the attribute.
  useEffect(() => {
    frame.current?.setAttribute('inert', '');
  }, [shared]);

  // The card under the pointer lifts; its story lifts with it.
  const hoverAt = (target: EventTarget | null) => {
    const card = (target as Element | null)?.closest?.('[data-story]');
    renderer.current?.hover(card?.getAttribute('data-story') ?? null);
  };

  return (
    <GalleryContext.Provider value={slot}>
      <div
        ref={wrap}
        className="wb-gallery-cards"
        onPointerOver={(e) => hoverAt(e.target)}
        onPointerLeave={() => hoverAt(null)}
      >
        {children}
        {shared && (
          <iframe
            ref={frame}
            className="wb-gallery-frame"
            src={FRAME_SRC}
            title="Story previews"
            tabIndex={-1}
            aria-hidden="true"
            data-testid="wb-gallery-frame"
            onLoad={onLoad}
            style={{
              width: `${frameWidth}px`,
              height: `${size.height / size.k}px`,
              transform: `scale(${size.k})`,
            }}
          />
        )}
      </div>
    </GalleryContext.Provider>
  );
};

export default GalleryFrame;
