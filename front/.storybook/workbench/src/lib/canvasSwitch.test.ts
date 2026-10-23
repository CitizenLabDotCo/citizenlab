import {
  FrameTarget,
  holdStory,
  sameTarget,
  searchFor,
  strayNodes,
  switchPlan,
  targetOfSearch,
} from './canvasSwitch';
import { storyUrl } from './frame';

const at = (
  storyId: string,
  over: Partial<FrameTarget['globals']> = {}
): FrameTarget => ({
  storyId,
  globals: { mode: 'today', city: 'linz', lang: 'en', ...over },
});

const ready = {
  ready: true,
  loading: false,
  idle: true,
  errored: false,
  switching: false,
};

describe('switchPlan', () => {
  it('does nothing when the frame shows what is wanted', () => {
    expect(switchPlan(at('a'), at('a'), ready)).toEqual({ kind: 'none' });
    expect(
      switchPlan(at('a'), at('a'), { ...ready, ready: false, idle: false })
    ).toEqual({ kind: 'none' });
  });

  it('switches the story in place', () => {
    expect(switchPlan(at('a'), at('b'), ready)).toEqual({
      kind: 'switch',
      storyId: 'b',
      globals: undefined,
    });
  });

  it('passes only the globals that change', () => {
    expect(
      switchPlan(at('a'), at('a', { lang: 'nl-BE', mode: 'redesign' }), ready)
    ).toEqual({
      kind: 'switch',
      storyId: undefined,
      globals: { lang: 'nl-BE', mode: 'redesign' },
    });
    expect(switchPlan(at('a'), at('b', { city: 'x' }), ready)).toEqual({
      kind: 'switch',
      storyId: 'b',
      globals: { city: 'x' },
    });
  });

  it('reloads a frame that has not loaded or whose story failed', () => {
    expect(switchPlan(at('a'), at('b'), { ...ready, ready: false })).toEqual({
      kind: 'reload',
    });
    expect(switchPlan(at('a'), at('b'), { ...ready, errored: true })).toEqual({
      kind: 'reload',
    });
  });

  it('waits for a frame that is still loading', () => {
    expect(
      switchPlan(at('a'), at('b'), { ...ready, ready: false, loading: true })
    ).toEqual({ kind: 'wait' });
  });

  it('waits for a story that is busy, and for a switch under way', () => {
    expect(switchPlan(at('a'), at('b'), { ...ready, idle: false })).toEqual({
      kind: 'wait',
    });
    expect(switchPlan(at('a'), at('a'), { ...ready, switching: true })).toEqual(
      { kind: 'wait' }
    );
  });
});

describe('targetOfSearch', () => {
  it('reads back what storyUrl wrote', () => {
    const want = at('components-button--primary', {
      mode: 'redesign',
      city: 'x;y',
      lang: 'nl-BE',
    });
    const url = storyUrl(want.storyId, want.globals);
    expect(targetOfSearch(url.slice(url.indexOf('?')), at('z'))).toEqual(want);
  });

  it('reads the URL the preview writes after a switch', () => {
    expect(
      targetOfSearch(
        '?id=b&viewMode=story&globals=mode%3Aredesign%3Bcity%3Alinz%3Blang%3Ade',
        at('a')
      )
    ).toEqual(at('b', { mode: 'redesign', lang: 'de' }));
  });

  it('keeps the fallback for what the URL lacks', () => {
    expect(
      targetOfSearch('?id=b&globals=lang:de;other:1;bad', at('a'))
    ).toEqual(at('b', { lang: 'de' }));
    expect(targetOfSearch('', at('a', { city: 'c' }))).toEqual(
      at('a', { city: 'c' })
    );
  });
});

describe('searchFor', () => {
  it('writes the story and globals, keeping the other params', () => {
    const t = at('b', { lang: 'nl-BE' });
    const search = searchFor(
      '?id=a&viewMode=story&globals=mode:today&args=x:1&other=2',
      t
    );
    expect(search).toBe(
      '?id=b&viewMode=story&globals=mode:today;city:linz;lang:nl-BE&args=x:1&other=2'
    );
    expect(targetOfSearch(search, at('z'))).toEqual(t);
  });
});

describe('sameTarget', () => {
  it('compares the story and every global', () => {
    expect(sameTarget(at('a'), at('a'))).toBe(true);
    expect(sameTarget(at('a'), at('b'))).toBe(false);
    expect(sameTarget(at('a'), at('a', { lang: 'de' }))).toBe(false);
  });
});

describe('strayNodes', () => {
  it('finds nodes of the old story still on the body', () => {
    document.body.innerHTML =
      '<div id="storybook-root"></div><div class="story" id="tip"></div><div id="sb"></div><div class="story" id="gone"></div>';
    const [root, tip, sb, gone] = Array.from(document.body.children);
    const atStart = [root, tip, sb, gone];
    gone.remove();
    document.body.appendChild(document.createElement('div'));
    expect(
      strayNodes(document.body, atStart, (el) => el.matches('.story'))
    ).toEqual([tip]);
    document.body.innerHTML = '';
  });
});

describe('holdStory', () => {
  const flush = () => new Promise((r) => setTimeout(r, 0));

  it('puts a copy of the old story in the emptied root, without ids', async () => {
    document.body.innerHTML =
      '<div id="storybook-root"><div id="modal-portal"></div><button class="b">Old</button><video></video><iframe></iframe></div>';
    const root = document.getElementById('storybook-root') as HTMLElement;
    const release = holdStory(root);
    root.innerHTML = '';
    await flush();
    expect(root.querySelector('[data-wb-held] button.b')?.textContent).toBe(
      'Old'
    );
    expect(root.querySelector('#modal-portal')).toBeNull();
    expect(root.querySelector('video, iframe')).toBeNull();
    expect((root.querySelector('[data-wb-held]') as HTMLElement).inert).toBe(
      true
    );
    // The new story replaces the root's content.
    root.innerHTML = '<button>New</button>';
    release();
    expect(root.innerHTML).toBe('<button>New</button>');
    document.body.innerHTML = '';
  });

  it('holds nothing while the old story is still there', async () => {
    document.body.innerHTML = '<div id="storybook-root"><p>Old</p></div>';
    const root = document.getElementById('storybook-root') as HTMLElement;
    const release = holdStory(root);
    root.appendChild(document.createElement('span'));
    await flush();
    expect(root.querySelector('[data-wb-held]')).toBeNull();
    release();
    document.body.innerHTML = '';
  });

  it('removes the copy on release', async () => {
    document.body.innerHTML = '<div id="storybook-root"><p>Old</p></div>';
    const root = document.getElementById('storybook-root') as HTMLElement;
    const release = holdStory(root);
    root.innerHTML = '';
    await flush();
    expect(root.childElementCount).toBe(1);
    release();
    expect(root.childElementCount).toBe(0);
    document.body.innerHTML = '';
  });
});
