import { namesOf } from './evaluate';
import { buttonRenderer } from './fixture';
import {
  baseHashOf,
  checkFiber,
  checkInternals,
  contextOf,
  determineTheme,
  execContext,
  Fiber,
} from './internals';

const renderButton = buttonRenderer();

// A styled fiber as React 18 and styled-components 5.3.9 lay it out.
const fakeFiber = (patch: Record<string, unknown> = {}): Fiber => ({
  elementType: {
    styledComponentId: 'sc-abc',
    attrs: [],
    componentStyle: {
      rules: ['color: red;'],
      componentId: 'sc-abc',
      isStatic: false,
      baseHash: baseHashOf('sc-abc'),
    },
    ...patch,
  },
  memoizedProps: { size: 's' },
  dependencies: { firstContext: { memoizedValue: { colors: {} } } },
});

const fakeFrame = (version: string | undefined, fiber?: Fiber) => {
  const doc = document.implementation.createHTMLDocument('x');
  if (version) {
    const style = doc.createElement('style');
    style.setAttribute('data-styled-version', version);
    doc.head.appendChild(style);
  }
  const el = doc.createElement('div');
  el.className = 'sc-abc kZhvwV';
  if (fiber)
    (el as unknown as Record<string, unknown>)['__reactFiber$x1'] = fiber;
  doc.body.appendChild(el);
  return { frame: { document: doc } as unknown as Window, el };
};

describe('the internals guard', () => {
  it('passes on the fields 5.3.9 and React 18 have', () => {
    const { frame } = fakeFrame('5.3.9', fakeFiber());
    expect(checkInternals(frame)).toEqual({ ok: true });
  });

  it('names what changed', () => {
    const el = fakeFrame(undefined).el;
    expect(checkFiber(undefined, el)).toEqual({
      ok: false,
      missing: 'the element fiber (__reactFiber$)',
    });
    expect(checkFiber(fakeFiber({ attrs: undefined }), el)).toEqual({
      ok: false,
      missing: 'attrs',
    });
    const noRules = fakeFiber({
      componentStyle: { componentId: 'sc-abc', isStatic: false },
    });
    expect(checkFiber(noRules, el)).toEqual({
      ok: false,
      missing: 'componentStyle.rules',
    });
    const rehashed = fakeFiber({
      componentStyle: {
        rules: [],
        componentId: 'sc-abc',
        isStatic: false,
        baseHash: 1,
      },
    });
    expect(checkFiber(rehashed, el)).toMatchObject({ ok: false });
    const noContext = { ...fakeFiber(), dependencies: null };
    expect(checkFiber(noContext, el)).toEqual({
      ok: false,
      missing: 'dependencies.firstContext.memoizedValue',
    });
  });

  it('fails on another styled-components version, and caches per document', () => {
    const { frame } = fakeFrame('6.0.0', fakeFiber());
    const r = checkInternals(frame);
    expect(r).toEqual({
      ok: false,
      missing: 'styled-components 5.3.9 (found 6.0.0)',
    });
    expect(checkInternals(frame)).toBe(r);
  });

  it('checks nothing until a styled element renders', () => {
    const { frame } = fakeFrame(undefined);
    frame.document.body.innerHTML = '';
    expect(checkInternals(frame)).toEqual({ ok: true });
  });
});

describe('the execution context', () => {
  it('picks the theme as 5.3.9 does', () => {
    const provided = { a: 1 };
    expect(determineTheme({}, provided)).toBe(provided);
    expect(determineTheme({ theme: { b: 2 } }, provided)).toEqual({ b: 2 });
    const dflt = { theme: { c: 3 } };
    expect(determineTheme({ theme: dflt.theme }, provided, dflt)).toBe(
      provided
    );
    expect(determineTheme({}, undefined, dflt)).toBe(dflt.theme);
  });

  it('merges attrs into the props, className with earlier attrs only', () => {
    const ctx = contextOf({ t: 1 }, { size: 's', className: 'own' }, [
      { className: 'one', size: 'm' },
      (c: Record<string, unknown>) => ({ className: 'two', seen: c.size }),
    ]);
    expect(ctx).toEqual({
      size: 'm',
      className: 'one two',
      seen: 'm',
      theme: { t: 1 },
    });
  });
});

describe('the generated class names', () => {
  it("are the Container's own, in development and in production", () => {
    const dev = renderButton({ buttonStyle: 'primary' });
    const ctx = execContext(dev.fiber) as Record<string, unknown>;
    const [prodName, devName] = namesOf(dev.style, ctx);
    expect(dev.div.classList.contains(devName)).toBe(true);

    // 5.3.9 reads NODE_ENV on each render: strings are hashed only
    // outside production.
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const prod = renderButton({ buttonStyle: 'primary' });
      expect(prod.div.classList.contains(prodName)).toBe(true);
      expect(prod.div.classList.contains(devName)).toBe(false);
    } finally {
      process.env.NODE_ENV = env;
    }
  });
});
