import { placeStory } from './gallery';
import {
  BOOT_MS,
  CONCURRENCY,
  createGalleryRenderer,
  GalleryPreview,
  reactContainerOf,
  ThumbState,
} from './galleryFrame';

const MOCKS = [{ handler: 'default' }];
const GLOBALS = { city: 'linz', lang: 'en' };

// A preview that renders a story in 10ms: `own-*` stories bring their own
// mock handlers, `full-*` ones are laid out fullscreen, `broken-*` ones
// throw and `leak-*` ones portal a node into the document's #modal-portal.
const fakePreview = () => {
  const started: string[] = [];
  const torn: string[] = [];
  const update = jest.fn();
  const preview: GalleryPreview = {
    ready: async () => undefined,
    storyRenders: [],
    storyStoreValue: {
      projectAnnotations: { parameters: { msw: MOCKS } },
      userGlobals: { update },
    },
    loadStory: async ({ storyId }) => ({
      id: storyId,
      parameters: {
        msw: storyId.startsWith('own') ? [] : MOCKS,
        layout: storyId.startsWith('full') ? 'fullscreen' : 'padded',
      },
    }),
    renderStoryToElement: (story, el, callbacks) => {
      const render = {
        phase: 'loading',
        isPending: () => render.phase === 'loading',
      };
      preview.storyRenders.push(render);
      started.push(story.id);
      if (story.id.startsWith('leak')) {
        // React keeps the portal's root fiber, and its container, on it.
        const node = document.createElement('div');
        const root = { stateNode: { containerInfo: el } };
        (node as any)['__reactFiber$abc'] = { return: root };
        document.getElementById('modal-portal')?.appendChild(node);
      }
      setTimeout(() => {
        if (story.id.startsWith('broken')) {
          callbacks.showException(new Error('boom'));
        } else {
          el.innerHTML = '<div data-gv-story-box><b>story</b></div>';
        }
        render.phase = 'finished';
      }, 10);
      return async () => {
        torn.push(story.id);
      };
    },
  };
  return { preview, started, torn, update };
};

const until = async (check: () => boolean) => {
  for (let i = 0; i < 200 && !check(); i++) {
    await new Promise((r) => setTimeout(r, 10));
  }
  expect(check()).toBe(true);
};

const entries = (ids: string[]) =>
  ids.map((id, i) => ({
    id,
    radius: 4,
    placement: placeStory({ x: i * 100, y: 0, width: 80, height: 50 }, 320, 1),
  }));

const setup = (ids: string[]) => {
  const fake = fakePreview();
  (window as any).__STORYBOOK_PREVIEW__ = fake.preview;
  const states: Record<string, ThumbState> = {};
  const reports: string[] = [];
  const renderer = createGalleryRenderer(window, GLOBALS, (id, state) => {
    states[id] = state;
    reports.push(`${id} ${state}`);
  });
  renderer.layout(entries(ids), 1);
  return { ...fake, states, reports, renderer };
};

afterEach(() => {
  delete (window as any).__STORYBOOK_PREVIEW__;
  document.body.innerHTML = '';
});

describe('createGalleryRenderer', () => {
  it('renders every card into its own element and reports it', async () => {
    const { states, renderer } = setup(['a', 'b']);
    await until(() => states.a === 'rendered' && states.b === 'rendered');
    const item = document.querySelector<HTMLElement>('[data-gv-thumb="a"]');
    expect(item?.hasAttribute('data-shown')).toBe(true);
    expect(item?.querySelector('#story--a b')?.textContent).toBe('story');
    renderer.dispose();
  });

  it('renders cards near the viewport first, a few at a time', async () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    const fake = fakePreview();
    (window as any).__STORYBOOK_PREVIEW__ = fake.preview;
    const renderer = createGalleryRenderer(window, GLOBALS, () => {});
    renderer.setNear(new Set(['f', 'e']));
    renderer.layout(entries(ids), 1);
    await until(() => fake.started.length >= CONCURRENCY);
    expect(fake.started.slice(0, 2)).toEqual(['e', 'f']);
    expect(fake.started.length).toBe(CONCURRENCY);
    await until(() => fake.started.length === ids.length);
    renderer.dispose();
  });

  it('sends a story with its own mock handlers to a frame of its own', async () => {
    const { states, started, renderer } = setup(['own-a', 'b']);
    await until(
      () => states['own-a'] === 'isolated' && states.b === 'rendered'
    );
    expect(started).toEqual(['b']);
    renderer.dispose();
  });

  it('sends a fullscreen story to a frame of its own', async () => {
    const { states, started, renderer } = setup(['full-a', 'b']);
    await until(
      () => states['full-a'] === 'isolated' && states.b === 'rendered'
    );
    expect(started).toEqual(['b']);
    renderer.dispose();
  });

  it('sends a story that portals out of its element to a frame of its own', async () => {
    const { states, renderer } = setup(['leak-a', 'b']);
    await until(
      () => states['leak-a'] === 'isolated' && states.b === 'rendered'
    );
    const item = document.querySelector<HTMLElement>(
      '[data-gv-thumb="leak-a"]'
    );
    expect(item?.hidden).toBe(true);
    expect(item?.hasAttribute('data-shown')).toBe(false);
    renderer.dispose();
  });

  it('reports nothing once disposed, even mid-render', async () => {
    const { started, reports, renderer } = setup(['a', 'b']);
    await until(() => started.length === 2);
    renderer.dispose();
    await new Promise((r) => setTimeout(r, 100));
    expect(reports).toEqual([]);
  });

  it('sends every card to a frame of its own when the preview fails', async () => {
    const fake = fakePreview();
    fake.preview.ready = () => Promise.reject(new Error('no preview'));
    (window as any).__STORYBOOK_PREVIEW__ = fake.preview;
    const states: Record<string, ThumbState> = {};
    const renderer = createGalleryRenderer(window, GLOBALS, (id, state) => {
      states[id] = state;
    });
    renderer.layout(entries(['a', 'b']), 1);
    await until(() => states.a === 'isolated' && states.b === 'isolated');
    // A card that shows later goes straight to its own frame.
    renderer.layout(entries(['a', 'b', 'c']), 1);
    expect(states.c).toBe('isolated');
    expect(fake.started).toEqual([]);
    renderer.dispose();
  });

  it('sends every card to a frame of its own when the preview never starts', async () => {
    jest.useFakeTimers();
    try {
      const states: Record<string, ThumbState> = {};
      const renderer = createGalleryRenderer(window, GLOBALS, (id, state) => {
        states[id] = state;
      });
      renderer.layout(entries(['a', 'b']), 1);
      await jest.advanceTimersByTimeAsync(BOOT_MS - 1000);
      expect(states).toEqual({});
      await jest.advanceTimersByTimeAsync(2000);
      expect(states).toEqual({ a: 'isolated', b: 'isolated' });
      renderer.dispose();
    } finally {
      jest.useRealTimers();
    }
  });

  it('reports a story that throws without rendering as an error', async () => {
    const { states, renderer } = setup(['broken-a']);
    await until(() => states['broken-a'] === 'error');
    renderer.dispose();
  });

  it('renders every story again when the globals change', async () => {
    const { states, started, torn, update, renderer } = setup(['a']);
    await until(() => states.a === 'rendered');
    renderer.setGlobals({ ...GLOBALS, lang: 'de' });
    expect(update).toHaveBeenLastCalledWith({ ...GLOBALS, lang: 'de' });
    await until(() => started.length === 2 && torn.length === 1);
    expect(document.querySelectorAll('.gvg-story')).toHaveLength(1);
    renderer.dispose();
  });

  it('hides cards the filters leave out', async () => {
    const { states, renderer } = setup(['a', 'b']);
    await until(() => states.b === 'rendered');
    renderer.layout(entries(['a']), 1);
    expect(
      document.querySelector<HTMLElement>('[data-gv-thumb="b"]')?.hidden
    ).toBe(true);
    renderer.dispose();
  });

  it('never shows a hidden card rendered with old globals', async () => {
    const { states, started, renderer } = setup(['a', 'b']);
    await until(() => states.b === 'rendered');
    renderer.layout(entries(['a']), 1);
    renderer.setGlobals({ ...GLOBALS, lang: 'nl-BE' });
    const b = document.querySelector<HTMLElement>('[data-gv-thumb="b"]');
    expect(states.b).toBe('loading');
    expect(b?.hasAttribute('data-shown')).toBe(false);
    await until(() => states.a === 'rendered' && started.length === 3);
    expect(started.filter((id) => id === 'b')).toHaveLength(1);
    renderer.layout(entries(['a', 'b']), 1);
    await until(() => started.length === 4 && states.b === 'rendered');
    expect(b?.hasAttribute('data-shown')).toBe(true);
    renderer.dispose();
  });
});

describe('createGalleryRenderer, a card hidden mid-render', () => {
  it('never shows it with the globals it started with', async () => {
    const { states, started, renderer } = setup(['a', 'b']);
    await until(() => started.length === 2);
    renderer.layout(entries(['a']), 1);
    renderer.setGlobals({ ...GLOBALS, city: 'gent' });
    await until(() => states.a === 'rendered' && started.length === 3);
    await new Promise((r) => setTimeout(r, 50));
    const b = document.querySelector<HTMLElement>('[data-gv-thumb="b"]');
    // Still on the skeleton it started on.
    expect(states.b).toBeUndefined();
    expect(b?.hasAttribute('data-shown')).toBe(false);
    renderer.layout(entries(['a', 'b']), 1);
    expect(b?.hasAttribute('data-shown')).toBe(false);
    await until(() => started.length === 4 && states.b === 'rendered');
    renderer.dispose();
  });
});

describe('reactContainerOf', () => {
  it('follows the fiber of a node up to its root container', () => {
    const container = document.createElement('div');
    const node = document.createElement('div');
    const root = { stateNode: { containerInfo: container } };
    (node as any)['__reactFiber$abc'] = { return: { return: root } };
    expect(reactContainerOf(node)).toBe(container);
    expect(reactContainerOf(document.createElement('p'))).toBeNull();
  });
});
