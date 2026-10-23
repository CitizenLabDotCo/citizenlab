import {
  cancelArgs,
  holdFrame,
  resetArgs,
  resyncArgs,
  updateArgs,
} from './preview';

// A frame window with the parts of the preview the args queue reads.
const fakeFrame = () => {
  const listeners = new Map<string, Set<(p: unknown) => void>>();
  const sent: [string, unknown][] = [];
  const render = {
    id: 'a',
    phase: 'finished',
    story: { id: 'a', initialArgs: { label: 'Save', size: 'm' } },
  };
  const stored: Record<string, unknown> = { label: 'Save', size: 'm' };
  const channel = {
    on: (e: string, fn: (p: unknown) => void) => {
      if (!listeners.has(e)) listeners.set(e, new Set());
      listeners.get(e)?.add(fn);
    },
    off: (e: string, fn: (p: unknown) => void) => listeners.get(e)?.delete(fn),
    emit: (e: string, p: unknown) => {
      sent.push([e, p]);
    },
  };
  const fire = (e: string, p: unknown) =>
    [...(listeners.get(e) ?? [])].forEach((fn) => fn(p));
  const win = {
    document: document.implementation.createHTMLDocument('f'),
    __STORYBOOK_ADDONS_CHANNEL__: channel,
    __STORYBOOK_PREVIEW__: {
      currentRender: render,
      storyStoreValue: { args: { get: () => stored } },
    },
  } as unknown as Window;
  return { win, sent, fire, render };
};

const updates = (sent: [string, unknown][]) =>
  sent.filter(([e]) => e === 'updateStoryArgs').map(([, p]) => p);

describe('the args queue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('merges the edits made while the frame is held, in order', () => {
    const { win, sent, fire } = fakeFrame();
    const release = holdFrame(win);
    [1, 2, 3].forEach((n) => updateArgs(win, 'a', { size: n }));
    updateArgs(win, 'a', { label: 'Go' });
    jest.advanceTimersByTime(200);
    expect(sent).toEqual([]);
    release();
    jest.advanceTimersByTime(60);
    expect(updates(sent)).toEqual([
      { storyId: 'a', updatedArgs: { size: 3, label: 'Go' } },
    ]);
    // In the store: remounted, and the frame is held until that renders.
    fire('storyArgsUpdated', { storyId: 'a' });
    expect(sent[sent.length - 1]).toEqual(['forceRemount', { storyId: 'a' }]);
    updateArgs(win, 'a', { size: 4 });
    jest.advanceTimersByTime(200);
    expect(updates(sent)).toHaveLength(1);
    fire('storyRendered', 'a');
    jest.advanceTimersByTime(60);
    expect(updates(sent)[1]).toEqual({
      storyId: 'a',
      updatedArgs: { size: 4 },
    });
  });

  it('sends a reset first, as the initial args under later edits', () => {
    const { win, sent } = fakeFrame();
    const release = holdFrame(win);
    updateArgs(win, 'a', { size: 1 });
    resetArgs(win, 'a');
    updateArgs(win, 'a', { label: 'Go' });
    release();
    jest.advanceTimersByTime(60);
    expect(updates(sent)).toEqual([
      { storyId: 'a', updatedArgs: { label: 'Go', size: 'm' } },
    ]);
  });

  it('waits for a story that is still rendering', () => {
    const { win, sent, render } = fakeFrame();
    render.phase = 'rendering';
    updateArgs(win, 'a', { size: 1 });
    jest.advanceTimersByTime(500);
    expect(sent).toEqual([]);
    render.phase = 'completed';
    jest.advanceTimersByTime(60);
    expect(updates(sent)).toHaveLength(1);
  });

  it('drops the edits of a story the frame no longer shows', () => {
    const { win, sent, render } = fakeFrame();
    const release = holdFrame(win);
    updateArgs(win, 'a', { size: 1 });
    render.id = 'b';
    release();
    jest.advanceTimersByTime(200);
    expect(sent).toEqual([]);
  });

  it('does not count the time the canvas holds the frame', () => {
    const { win, sent } = fakeFrame();
    const release = holdFrame(win);
    updateArgs(win, 'a', { size: 1 });
    jest.advanceTimersByTime(6000);
    release();
    jest.advanceTimersByTime(60);
    expect(updates(sent)).toHaveLength(1);
  });

  it('drops the edits when the story stays busy, and when cancelled', () => {
    const busy = fakeFrame();
    busy.render.phase = 'rendering';
    updateArgs(busy.win, 'a', { size: 1 });
    jest.advanceTimersByTime(6000);
    busy.render.phase = 'finished';
    jest.advanceTimersByTime(200);
    expect(busy.sent).toEqual([]);

    const cancelled = fakeFrame();
    const release = holdFrame(cancelled.win);
    updateArgs(cancelled.win, 'a', { size: 1 });
    cancelArgs(cancelled.win);
    release();
    jest.advanceTimersByTime(200);
    expect(cancelled.sent).toEqual([]);
  });

  it('sends a frame the edits it dropped, after a dropped reset', () => {
    const { win, sent } = fakeFrame();
    resyncArgs(win, 'a', { label: 'Save' });
    expect(sent).toEqual([]);
    resyncArgs(win, 'a', { label: 'Go', size: 'm' });
    expect(updates(sent)).toEqual([
      { storyId: 'a', updatedArgs: { label: 'Go' } },
    ]);

    const stale = fakeFrame();
    const stored = (
      stale.win as unknown as {
        __STORYBOOK_PREVIEW__: {
          storyStoreValue: { args: { get: () => Record<string, unknown> } };
        };
      }
    ).__STORYBOOK_PREVIEW__.storyStoreValue.args.get();
    stored.size = 'l';
    resyncArgs(stale.win, 'a', { label: 'Go' });
    expect(updates(stale.sent)).toEqual([
      { storyId: 'a', updatedArgs: { label: 'Go', size: 'm' } },
    ]);
  });
});
