import { placeStory } from './gallery';
import {
  CONCURRENCY,
  createGalleryRenderer,
  GalleryPreview,
  reactContainerOf,
  ThumbState,
} from './galleryFrame';

const MOCKS = [{ handler: 'default' }];
const GLOBALS = { mode: 'today' as const, city: 'linz', lang: 'en' };

// A preview that renders a story in 10ms: `own-*` stories bring their own
// mock handlers, `broken-*` ones throw.
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
      parameters: { msw: storyId.startsWith('own') ? [] : MOCKS },
    }),
    renderStoryToElement: (story, el, callbacks) => {
      const render = {
        phase: 'loading',
        isPending: () => render.phase === 'loading',
      };
      preview.storyRenders.push(render);
      started.push(story.id);
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
  const renderer = createGalleryRenderer(window, GLOBALS, (id, state) => {
    states[id] = state;
  });
  renderer.layout(entries(ids), 1);
  return { ...fake, states, renderer };
};

afterEach(() => {
  delete (window as any).__STORYBOOK_PREVIEW__;
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('data-gv-mode');
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

  it('reports a story that throws without rendering as an error', async () => {
    const { states, renderer } = setup(['broken-a']);
    await until(() => states['broken-a'] === 'error');
    renderer.dispose();
  });

  it('renders every story again when the globals change', async () => {
    const { states, started, torn, update, renderer } = setup(['a']);
    await until(() => states.a === 'rendered');
    renderer.setGlobals({ ...GLOBALS, mode: 'redesign' });
    expect(update).toHaveBeenLastCalledWith({ ...GLOBALS, mode: 'redesign' });
    expect(document.documentElement.getAttribute('data-gv-mode')).toBe(
      'redesign'
    );
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
