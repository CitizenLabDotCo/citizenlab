import { useEffect, useRef } from 'react';

import { channelOf, setLayerArgs, whenRendered } from './preview';
import { layerOf, NO_LAYER, StateLayer, StoryFacts } from './storyState';

const BOOT_POLL_MS = 100;
const BOOT_TRIES = 300;

type Loader = {
  loadStory?: (options: { storyId: string }) => Promise<StoryFacts>;
};

const loaderOf = (win: Window) => {
  try {
    return (win as Window & { __STORYBOOK_PREVIEW__?: Loader })
      .__STORYBOOK_PREVIEW__;
  } catch {
    return undefined;
  }
};

// Keeps the pseudo-state classes on the story root: the addon's decorator
// sets the root's classes from the story's own parameters after each render.
const pinClasses = (win: Window, classes: string[]): (() => void) => {
  if (classes.length === 0) return () => {};
  let root: HTMLElement | null = null;
  try {
    root = win.document.getElementById('storybook-root');
  } catch {
    root = null;
  }
  if (!root) return () => {};
  const el = root;
  const add = () =>
    classes.forEach((c) => {
      if (!el.classList.contains(c)) el.classList.add(c);
    });
  add();
  const watch = new MutationObserver(add);
  watch.observe(el, { attributes: true, attributeFilter: ['class'] });
  return () => {
    watch.disconnect();
    classes.forEach((c) => el.classList.remove(c));
  };
};

// Shows the state story `stateId` on top of the frames' story (a variant),
// read against `baseId` (the Default story); null takes the last one off.
// A state with its own render cannot be laid over: `onOwn` gets it.
export const useStoryState = (
  frames: (Window | null)[],
  storyId: string,
  stateId: string | null,
  baseId: string | null,
  loads: number,
  onOwn: (stateId: string) => void
) => {
  const own = useRef(onOwn);
  own.current = onOwn;
  useEffect(() => {
    let gone = false;
    const offs: (() => void)[] = [];
    const apply = (win: Window, layer: StateLayer) => {
      offs.push(
        whenRendered(
          win,
          () => {
            if (gone) return;
            setLayerArgs(win, storyId, layer.args);
            offs.push(pinClasses(win, layer.pseudo));
          },
          storyId
        )
      );
    };
    const start = (win: Window) => {
      if (!stateId || !baseId) {
        apply(win, NO_LAYER);
        return;
      }
      const preview = loaderOf(win);
      if (!preview?.loadStory) return;
      Promise.all([
        preview.loadStory({ storyId: stateId }),
        preview.loadStory({ storyId: baseId }),
      ])
        .then(([state, base]) => {
          if (gone) return;
          const layer = layerOf(state, base);
          if (layer) apply(win, layer);
          else own.current(stateId);
        })
        .catch(() => undefined);
    };
    const timers: number[] = [];
    // A new frame's preview boots after the frame is there.
    frames.forEach((win) => {
      if (!win) return;
      let tries = 0;
      const wait = () => {
        if (gone) return;
        if (loaderOf(win)?.loadStory && channelOf(win)) start(win);
        else if (++tries < BOOT_TRIES) {
          timers.push(window.setTimeout(wait, BOOT_POLL_MS));
        }
      };
      wait();
    });
    return () => {
      gone = true;
      timers.forEach((t) => window.clearTimeout(t));
      offs.forEach((off) => off());
    };
  }, [frames, storyId, stateId, baseId, loads]);
};
