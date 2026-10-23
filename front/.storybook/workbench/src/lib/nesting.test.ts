import {
  chainOf,
  decodeReturn,
  encodeReturn,
  firstChildTarget,
  headerInstanceOf,
  instanceOf,
  nestKey,
  openHashes,
  paramOf,
  parsePath,
  parseZoom,
  returnHash,
  ReturnTo,
  storyHash,
  storyOfComponent,
  withParams,
} from './nesting';
import type { StoryGroup } from './stories';

// A Spotlight story as the canvas renders it: a layout Box around the
// widget, a Title, and a Button whose label is a span.
const spotlight = () => {
  document.body.innerHTML = `
    <div id="storybook-root"><div data-gv-story-box>
      <div data-gv-component="Box" id="outer">
        <section id="widget">
          <h2 data-gv-component="Title" id="title">People</h2>
          <div data-gv-component="Box" id="actions">
            <button data-gv-component="Button" id="button">
              <style></style>
              <span id="label">Join other residents</span>
            </button>
          </div>
        </section>
      </div>
    </div></div>`;
  const $ = (id: string) => document.getElementById(id) as Element;
  return $;
};

const names = (s: ReturnType<typeof chainOf>) =>
  s.map((x) => `${x.kind}:${x.name}${x.current ? '*' : ''}`);

describe('instanceOf', () => {
  it('finds the nearest library component, skipping layout wrappers', () => {
    const $ = spotlight();
    expect(instanceOf($('label'))).toBe($('button'));
    expect(instanceOf($('button'))).toBe($('button'));
    expect(instanceOf($('widget'))).toBeNull();
    expect(instanceOf($('actions'))).toBeNull();
  });

  it('names a selected Box in the header, not a hovered one', () => {
    const $ = spotlight();
    expect(headerInstanceOf($('actions'))).toBe($('actions'));
    expect(headerInstanceOf($('label'))).toBe($('button'));
    expect(headerInstanceOf($('widget'))).toBeNull();
    expect(headerInstanceOf(null)).toBeNull();
  });
});

describe('chainOf', () => {
  it('reads story, instances, then the selection', () => {
    const $ = spotlight();
    const chain = chainOf($('label'), 'Spotlight');
    expect(names(chain)).toEqual([
      'story:Spotlight',
      'instance:Button',
      'element:span "Join other residents"*',
    ]);
    expect(chain[1].el).toBe($('button'));
    expect(chain[0].el).toBeNull();
  });

  it('shows a Box only when it is the selection', () => {
    const $ = spotlight();
    expect(names(chainOf($('actions'), 'Spotlight'))).toEqual([
      'story:Spotlight',
      'instance:Box*',
    ]);
    expect(names(chainOf($('button'), 'Spotlight'))).toEqual([
      'story:Spotlight',
      'instance:Button*',
    ]);
  });

  it("merges the story component's own root into the story segment", () => {
    document.body.innerHTML = `<div data-gv-story-box>
      <button data-gv-component="Button" id="b"><span id="s">Save</span></button>
    </div>`;
    const b = document.getElementById('b') as Element;
    const chain = chainOf(document.getElementById('s') as Element, 'Button');
    expect(names(chain)).toEqual(['story:Button', 'element:span "Save"*']);
    expect(chain[0].el).toBe(b);
    expect(names(chainOf(b, 'Button'))).toEqual(['story:Button*']);
  });
});

describe('keys', () => {
  it('maps Figma keys', () => {
    expect(nestKey({ key: 'Enter', shiftKey: false })).toBe('child');
    expect(nestKey({ key: 'Enter', shiftKey: true })).toBe('parent');
    expect(nestKey({ key: '\\', shiftKey: false })).toBe('parent');
    expect(nestKey({ key: 'Escape', shiftKey: false })).toBe('parent');
    expect(nestKey({ key: 'Enter', shiftKey: false, metaKey: true })).toBe(
      null
    );
    expect(nestKey({ key: 'a', shiftKey: false })).toBe(null);
  });

  it('picks the first child that is part of the story', () => {
    const $ = spotlight();
    expect(firstChildTarget($('button'))).toBe($('label'));
    expect(firstChildTarget($('label'))).toBeNull();
    expect(firstChildTarget($('widget'), (c) => c.id !== 'title')).toBe(
      $('actions')
    );
  });
});

describe('storyOfComponent', () => {
  const group = (over: Partial<StoryGroup>): StoryGroup => ({
    title: 'x',
    name: 'Button',
    category: '',
    section: 'components',
    stories: [],
    defaultId: 'x--default',
    office: 'shared',
    status: 'unscanned',
    ...over,
  });

  it("prefers the library's own Button page", () => {
    const groups = [
      group({ defaultId: 'ui-button--default', file: 'app/components/UI/B' }),
      group({
        defaultId: 'components-actions-button--primary',
        file: 'app/component-library/components/Button/Button.stories.tsx',
      }),
      group({ section: 'patterns', defaultId: 'patterns-button--default' }),
    ];
    expect(storyOfComponent(groups, 'Button')?.storyId).toBe(
      'components-actions-button--primary'
    );
  });

  it('is null for a component without a story', () => {
    expect(storyOfComponent([group({})], 'Image')).toBeNull();
  });
});

describe('the return', () => {
  const back: ReturnTo = {
    section: 'patterns',
    storyId: 'homepagebuilder-spotlight--standard',
    path: [0, 0, 1, 0],
    zoom: 1.5,
  };

  it('round-trips', () => {
    expect(decodeReturn(encodeReturn(back))).toEqual(back);
    const none = { ...back, path: null, zoom: 'fit' as const };
    expect(decodeReturn(encodeReturn(none))).toEqual(none);
  });

  it('refuses anything off shape', () => {
    for (const bad of [
      null,
      '',
      'review/x:0:fit',
      'patterns/<b>:0:fit',
      'patterns/x:0.a:fit',
      'patterns/x:0:huge',
      'patterns/x:0:99',
    ]) {
      expect(decodeReturn(bad)).toBeNull();
    }
    expect(parsePath('1..2')).toBeNull();
    expect(parseZoom('0')).toBeNull();
  });

  it('writes the hashes of an open, keeping the share link', () => {
    const { here, there } = openHashes(
      '#/patterns/homepagebuilder-spotlight--standard?o=abc',
      back,
      'components-actions-button--primary'
    );
    expect(paramOf(here, 'sel')).toBe('0.0.1.0');
    expect(paramOf(here, 'zoom')).toBe('1.5');
    // Edits made on the component page would read as an old link on Back.
    expect(paramOf(here, 'o')).toBeNull();
    expect(
      there.startsWith('#/components/components-actions-button--primary?')
    ).toBe(true);
    expect(paramOf(there, 'o')).toBe('abc');
    expect(decodeReturn(paramOf(there, 'from'))).toEqual(back);
    expect(returnHash(back)).toBe(
      '#/patterns/homepagebuilder-spotlight--standard?sel=0.0.1.0&zoom=1.5'
    );
  });

  it('sets and removes parameters', () => {
    expect(withParams('#/a/b?x=1', { x: null, y: '2' })).toBe('#/a/b?y=2');
    expect(withParams('#/a/b', { x: null })).toBe('#/a/b');
    expect(storyHash('#/a/b?from=z', 'components', 'c--d')).toBe(
      '#/components/c--d'
    );
  });
});
