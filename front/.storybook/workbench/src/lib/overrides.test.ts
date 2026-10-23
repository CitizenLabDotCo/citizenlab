import { act, renderHook } from '@testing-library/react';

import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';

import type { TokenMeta } from './data';
import { openHashes, returnHash, ReturnTo } from './nesting';
import {
  MAX_PAYLOAD_BYTES,
  SNAP_DELTA_E,
  STORAGE_KEY,
  deltaE76,
  encodeOverrides,
  filterOverrides,
  isAllowedValue,
  nearestColour,
  overrideError,
  palette,
  parseColour,
  parseOverrides,
  parseOverridesResult,
  snap,
  snapValue,
  toLab,
  useOverrides,
  withOverrides,
} from './overrides';

const meta = tokensMeta as TokenMeta[];

// base64url of an arbitrary (ASCII) JSON text, bypassing encodeOverrides.
const raw = (json: string) =>
  btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const link = (json: string) => `#/components/a--b?o=${raw(json)}`;

describe('snap', () => {
  it('moves a space value to the nearest step of the scale', () => {
    expect(snap('--gv-space-3', '13px', meta)).toEqual({
      value: '12px',
      snapped: true,
      custom: false,
      to: '--gv-space-3',
    });
    expect(snap('--gv-input-padding', '30px', meta).value).toBe('28px');
    expect(snap('--gv-space-4', '0', meta).value).toBe('0');
  });

  it('moves a radius value to the radius scale', () => {
    expect(snap('--gv-radius-control', '13px', meta)).toMatchObject({
      value: '12px',
      to: '--gv-radius-3',
      snapped: true,
    });
    expect(snap('--gv-radius-control', '600px', meta).value).toBe('999px');
  });

  it('flags a length it cannot read as custom', () => {
    expect(snap('--gv-space-3', '1rem', meta)).toEqual({
      value: '1rem',
      snapped: false,
      custom: true,
    });
  });

  it('snaps a near-black to the nearest palette grey', () => {
    const result = snap('--gv-text-heading', '#1E1E1F', meta);
    expect(result).toMatchObject({ value: '#1E1E1E', custom: false });
    expect(result.snapped).toBe(true);
  });

  it('prefers a tier-1 primitive', () => {
    expect(snap('--gv-text-primary', '#343434', meta)).toMatchObject({
      value: '#333333',
      to: '--gv-grey-800',
    });
  });

  it('keeps a colour far from the palette as custom', () => {
    expect(snap('--gv-primary', '#00ff00', meta)).toEqual({
      value: '#00ff00',
      snapped: false,
      custom: true,
    });
  });

  it('passes other categories through', () => {
    expect(snap('--gv-motion-fast', '120ms', meta)).toEqual({
      value: '120ms',
      snapped: false,
      custom: false,
    });
  });
});

describe('snapValue', () => {
  it('snaps a length to the space scale without a token name', () => {
    expect(snapValue('space', '13px', meta)).toMatchObject({
      value: '12px',
      snapped: true,
      custom: false,
      to: '--gv-space-3',
    });
  });

  it('leaves an unknown kind as typed', () => {
    expect(snapValue(undefined, '17px', meta)).toEqual({
      value: '17px',
      snapped: false,
      custom: false,
    });
  });

  it('prefers a semantic colour over the primitive it equals', () => {
    const r = snapValue('color', '#343434', meta);
    const named = meta.find((t) => t.name === r.to);
    expect(r.value).toBe('#333333');
    expect(named?.tier).toBe(2);
    // Foundations' token snap keeps the primitive.
    expect(snap('--gv-text-primary', '#343434', meta).to).toBe('--gv-grey-800');
  });

  it('matches a short hex semantic twin', () => {
    expect(snapValue('color', '#fefefe', meta).to).toBe('--gv-on-primary');
  });
});

describe('colour distance', () => {
  it('reads hex and rgb colours', () => {
    expect(parseColour('#fff')).toEqual([255, 255, 255, 1]);
    expect(parseColour('#00000080')?.[3]).toBeCloseTo(0.5, 2);
    expect(parseColour('rgb(12.5 0 0)')).toEqual([12.5, 0, 0, 1]);
    expect(parseColour('rgb(100% 0% 50% / 50%)')).toEqual([255, 0, 127.5, 0.5]);
    expect(parseColour('rgb(300 0 0)')).toBeNull();
    expect(parseColour('rgb(1, 2, 3)')).toEqual([1, 2, 3, 1]);
    expect(parseColour('rgba(1,2,3,0.5)')).toEqual([1, 2, 3, 0.5]);
    expect(parseColour('color-mix(in srgb, red, blue)')).toBeNull();
    expect(parseColour('rgb(300, 0, 0)')).toBeNull();
  });

  it('measures Delta E 1976 in CIELAB', () => {
    expect(toLab([255, 255, 255, 1])[0]).toBeCloseTo(100, 1);
    expect(toLab([0, 0, 0, 1])[0]).toBeCloseTo(0, 5);
    // Known value: sRGB #808080 has L* 53.59.
    expect(toLab([128, 128, 128, 1])[0]).toBeCloseTo(53.59, 1);
    expect(deltaE76([50, 0, 0], [53, 4, 0])).toBe(5);
  });

  it('snaps within the threshold and not beyond', () => {
    expect(SNAP_DELTA_E).toBe(6);
    const swatches = palette(meta);
    expect(nearestColour('#333333', swatches)?.distance).toBe(0);
    // The threshold is inclusive.
    const d = nearestColour('#3a3a3a', swatches, 1000)?.distance ?? 0;
    expect(d).toBeGreaterThan(0);
    expect(nearestColour('#3a3a3a', swatches, d)).not.toBeNull();
    expect(nearestColour('#3a3a3a', swatches, d - 0.001)).toBeNull();
    expect(nearestColour('#00ff00', swatches)).toBeNull();
  });

  it('skips translucent colours', () => {
    expect(nearestColour('rgba(51,51,51,0.5)', palette(meta))).toBeNull();
  });
});

describe('share link codec', () => {
  it('round-trips', () => {
    const o = { '--gv-radius-control': '20px', '--gv-primary': '#147985' };
    expect(
      parseOverrides(`#/components/a--b?o=${encodeOverrides(o)}`, meta)
    ).toEqual(o);
  });

  it('reads nothing from a plain route', () => {
    expect(parseOverridesResult('#/review', meta)).toEqual({ overrides: {} });
    expect(parseOverridesResult('', meta)).toEqual({ overrides: {} });
    // An anchor or a bare payload is not a share link.
    expect(parseOverridesResult('#main', meta)).toEqual({ overrides: {} });
    expect(
      parseOverridesResult(encodeOverrides({ '--gv-space-3': '4px' }), meta)
    ).toEqual({ overrides: {} });
  });

  it('writes the parameter into a route hash', () => {
    const o = { '--gv-radius-control': '20px' };
    expect(withOverrides('#/components/a--b', o)).toBe(
      `#/components/a--b?o=${encodeOverrides(o)}`
    );
    expect(withOverrides(`#/review?o=${encodeOverrides(o)}`, {})).toBe(
      '#/review'
    );
  });

  const rejects: [string, string][] = [
    ['a key not in the token set', '{"--gv-nope":"1px"}'],
    ['a key without the --gv- prefix', '{"color":"red"}'],
    ['a value that is not text', '{"--gv-space-3":12}'],
    ['a value over 64 characters', `{"--gv-space-3":"${'1'.repeat(65)}"}`],
    ['url(', '{"--gv-primary":"url(https://x.test/a.png)"}'],
    ['url( in another case', '{"--gv-primary":"URL(x)"}'],
    ['expression', '{"--gv-primary":"expression(alert(1))"}'],
    ['a semicolon', '{"--gv-primary":"red;color:blue"}'],
    ['a closing brace', '{"--gv-primary":"red}body{color:blue"}'],
    ['a less-than sign', '{"--gv-primary":"</style>"}'],
    ['a CSS escape', '{"--gv-primary":"\\\\75rl(x)"}'],
    ['an escaped url( with a space', '{"--gv-primary":"\\\\75 rl(x)"}'],
    ['image-set', '{"--gv-primary":"image-set(\\"http://x.test/1.png\\" 1x)"}'],
    [
      '-webkit-image-set',
      '{"--gv-primary":"-webkit-image-set(\\"http://x.test/1.png\\" 1x)"}',
    ],
    ['image(', '{"--gv-primary":"image(\\"http://x.test/1.png\\")"}'],
    ['cross-fade(', '{"--gv-primary":"cross-fade(\\"a.png\\", \\"b.png\\")"}'],
    ['src(', '{"--gv-primary":"src(\\"http://x.test/1.png\\")"}'],
    ['!important', '{"--gv-primary":"#fff !important"}'],
    ['a comment', '{"--gv-primary":"#fff /* x */"}'],
    ['a named colour', '{"--gv-primary":"red"}'],
    ['another function', '{"--gv-primary":"attr(data-x)"}'],
    ['a colour function with words', '{"--gv-primary":"rgb(from red r g b)"}'],
    ['a length with a unit not allowed', '{"--gv-space-3":"1vw"}'],
    ['a length for a colour', '{"--gv-primary":"12px"}'],
    ['a var() of a non --gv- property', '{"--gv-primary":"var(--x)"}'],
    ['a var() with a bad fallback', '{"--gv-primary":"var(--gv-white, 1x)"}'],
    ['a font family with brackets', '{"--gv-font-family":"Arial(x)"}'],
    ['a font family with stray quotes', '{"--gv-font-family":"Ari\'al"}'],
    ['a shadow with a function', '{"--gv-shadow":"0 0 2px env(x)"}'],
    ['an array', '["--gv-primary"]'],
    ['null', 'null'],
    ['broken JSON', '{"--gv-primary":'],
  ];

  it.each(rejects)('rejects %s', (_, json) => {
    const result = parseOverridesResult(link(json), meta);
    expect(result.overrides).toEqual({});
    expect(result.error).toEqual(expect.any(String));
  });

  const allowed: [string, string][] = [
    ['--gv-space-3', '16px'],
    ['--gv-space-3', '0'],
    ['--gv-space-3', '1.5rem'],
    ['--gv-space-3', '-4px'],
    ['--gv-radius-control', '50%'],
    ['--gv-type-h2-ls', '-0.01em'],
    ['--gv-primary', '#147985'],
    ['--gv-primary', '#fffa'],
    ['--gv-primary', 'rgb(1, 2, 3)'],
    ['--gv-primary', 'rgba(0,0,0,0.5)'],
    ['--gv-primary', 'hsl(200deg 50% 40%)'],
    ['--gv-primary', 'hsla(200, 50%, 40%, 0.5)'],
    ['--gv-primary', 'transparent'],
    ['--gv-primary', 'var(--gv-teal-500)'],
    ['--gv-primary', 'var(--gv-teal-500, #147985)'],
    ['--gv-type-h1-weight', '600'],
    ['--gv-motion-fast', '200ms'],
    ['--gv-shadow', '0 2px 4px rgba(0,0,0,0.1), inset 0 0 0 1px #ccc'],
    ['--gv-shadow', 'none'],
    ['--gv-focus-outline', '3px solid #1a1a1a'],
    ['--gv-font-family', '"Public Sans", Helvetica, sans-serif'],
    ['--gv-font-family', "'Public Sans'"],
  ];

  it.each(allowed)('allows %s: %s', (name, value) => {
    expect(
      parseOverridesResult(link(JSON.stringify({ [name]: value })), meta)
    ).toEqual({ overrides: { [name]: value } });
  });

  it('refuses resource loaders with the allowlist alone', () => {
    const primary = meta.find((t) => t.name === '--gv-primary') as TokenMeta;
    const family = meta.find((t) => t.name === '--gv-font-family') as TokenMeta;
    for (const v of [
      'image-set("x.png" 1x)',
      '-webkit-image-set("x.png" 1x)',
      'image("x.png")',
      'cross-fade("a.png", "b.png")',
      'src("x.png")',
      'url(x.png)',
      '\\75 rl(x.png)',
      'var(--gv-white, url(x.png))',
    ]) {
      expect([v, isAllowedValue(primary, v)]).toEqual([v, false]);
      expect([v, isAllowedValue(family, v)]).toEqual([v, false]);
    }
  });

  it("allows every token's own values from the token set", () => {
    for (const t of meta) {
      for (const value of Object.values(t.values)) {
        const result = parseOverridesResult(
          link(JSON.stringify({ [t.name]: value })),
          meta
        );
        if (value.length <= 64)
          expect([t.name, result.error]).toEqual([t.name, undefined]);
      }
    }
  });

  it('rejects a payload that is not base64url', () => {
    expect(parseOverridesResult('#/x?o=a+b/c', meta).error).toBeDefined();
    expect(parseOverridesResult('#/x?o=%%%', meta).error).toBeDefined();
  });

  it('rejects an oversized payload without decoding it', () => {
    const big = link(
      `{"--gv-primary":"#fff","pad":"${'a'.repeat(MAX_PAYLOAD_BYTES)}"}`
    );
    expect(parseOverridesResult(big, meta)).toEqual({
      overrides: {},
      error: 'the link is too long',
    });
  });

  it('never throws on junk', () => {
    for (const junk of [
      '#/x?o=',
      '#?o=====',
      '#/x?o=\u0000',
      'é',
      '#/x?o=é',
      '#/x?o=Zm9v',
    ]) {
      expect(() => parseOverridesResult(junk, meta)).not.toThrow();
    }
  });
});

describe('per-entry checks', () => {
  it('overrideError uses the share-link allowlist', () => {
    expect(overrideError('--gv-radius-2', '12px', meta)).toBeUndefined();
    expect(overrideError('--gv-primary', '#123456', meta)).toBeUndefined();
    expect(overrideError('--gv-primary', 'expression(1)', meta)).toMatch(
      /not allowed/
    );
    expect(overrideError('--gv-radius-2', '12px; color: red', meta)).toMatch(
      /not allowed/
    );
    expect(overrideError('--gv-nope', '1px', meta)).toMatch(/unknown token/);
    expect(overrideError('--gv-radius-2', 'x'.repeat(65), meta)).toMatch(
      /too long/
    );
  });

  it('gives a shadow of a few layers more room', () => {
    const layer = '0 4px 12px -1px rgba(0,0,0,0.12)';
    const three = [layer, layer, layer].join(', ');
    expect(three.length).toBeGreaterThan(64);
    expect(overrideError('--gv-shadow', three, meta)).toBeUndefined();
    expect(overrideError('--gv-shadow', `${three}, ${three}`, meta)).toMatch(
      /too long/
    );
  });

  it('filterOverrides keeps valid entries and names the dropped ones', () => {
    expect(
      filterOverrides(
        { '--gv-radius-2': '12px', '--gv-primary': 'url(x)', color: 'red' },
        meta
      )
    ).toEqual({
      overrides: { '--gv-radius-2': '12px' },
      dropped: ['--gv-primary', 'color'],
    });
    expect(filterOverrides(['x'], meta)).toEqual({
      overrides: {},
      dropped: [],
    });
    expect(filterOverrides(null, meta)).toEqual({ overrides: {}, dropped: [] });
  });
});

describe('useOverrides', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, '', '#/review');
  });

  it('starts from a share link and keeps it in storage and the hash', () => {
    const o = { '--gv-radius-control': '20px' };
    window.history.replaceState(
      null,
      '',
      `#/components/a--b?o=${encodeOverrides(o)}`
    );
    const { result } = renderHook(() => useOverrides(meta));
    expect(result.current.overrides).toEqual(o);
    expect(result.current.notice).toBeUndefined();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '')).toEqual(
      o
    );

    act(() => result.current.setOverride('--gv-space-3', '16px'));
    expect(parseOverrides(window.location.hash, meta)).toEqual({
      ...o,
      '--gv-space-3': '16px',
    });
    act(() => result.current.reset());
    expect(window.location.hash).toBe('#/components/a--b');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('restores the session from storage', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ '--gv-space-3': '16px' })
    );
    const { result } = renderHook(() => useOverrides(meta));
    expect(result.current.overrides).toEqual({ '--gv-space-3': '16px' });
  });

  it('keeps the stored session when a link is bad, and says so', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ '--gv-space-3': '16px' })
    );
    window.history.replaceState(null, '', link('{"--gv-primary":"url(x)"}'));
    const { result } = renderHook(() => useOverrides(meta));
    expect(result.current.overrides).toEqual({ '--gv-space-3': '16px' });
    expect(result.current.notice).toMatch(/share link was not applied/);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '')).toEqual({
      '--gv-space-3': '16px',
    });
    // The hash carries the session again, not the bad link.
    expect(parseOverrides(window.location.hash, meta)).toEqual({
      '--gv-space-3': '16px',
    });
  });

  const navigate = (hash: string) =>
    act(() => {
      window.history.replaceState(null, '', hash);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

  it('adopts a pasted link and ignores a bad one', () => {
    const { result } = renderHook(() => useOverrides(meta));
    act(() => result.current.setOverride('--gv-space-3', '16px'));

    navigate(link('{"--gv-primary":"image-set(\\"x.png\\" 1x)"}'));
    expect(result.current.overrides).toEqual({ '--gv-space-3': '16px' });
    expect(result.current.notice).toMatch(/not applied/);

    navigate(link('{"--gv-radius-control":"20px"}'));
    expect(result.current.overrides).toEqual({ '--gv-radius-control': '20px' });
    expect(result.current.notice).toBeUndefined();

    // A plain route keeps the session and gets the parameter back.
    navigate('#/review');
    expect(result.current.overrides).toEqual({ '--gv-radius-control': '20px' });
    expect(parseOverrides(window.location.hash, meta)).toEqual({
      '--gv-radius-control': '20px',
    });
  });

  it('keeps edits made in an opened component on Back to the pattern', () => {
    const x = { '--gv-radius-control': '20px' };
    window.history.replaceState(
      null,
      '',
      `#/patterns/p--s?o=${encodeOverrides(x)}`
    );
    const { result } = renderHook(() => useOverrides(meta));
    expect(result.current.overrides).toEqual(x);
    const back: ReturnTo = {
      section: 'patterns',
      storyId: 'p--s',
      path: [0, 1],
      zoom: 'fit',
    };
    const { here, there } = openHashes(window.location.hash, back, 'b--d');
    navigate(there);
    const y = { '--gv-radius-control': '8px' };
    act(() => result.current.setOverride('--gv-radius-control', '8px'));
    expect(parseOverrides(window.location.hash, meta)).toEqual(y);
    // Back by the history entry, and by the chip's link.
    for (const to of [here, returnHash(back)]) {
      navigate(to);
      expect(result.current.overrides).toEqual(y);
      expect(result.current.notice).toBeUndefined();
      expect(parseOverrides(window.location.hash, meta)).toEqual(y);
      expect(window.location.hash).toContain('sel=0.1');
    }
  });

  it('refuses an edit the share-link rules refuse, and keeps the rest', () => {
    const { result } = renderHook(() => useOverrides(meta));
    let error: string | undefined;
    act(() => {
      error = result.current.setOverride('--gv-space-3', '16px');
    });
    expect(error).toBeUndefined();
    act(() => {
      error = result.current.setOverride('--gv-primary', 'url(x)');
    });
    expect(error).toMatch(/not allowed/);
    act(() => {
      error = result.current.setOverride('--gv-radius-2', 'red');
    });
    expect(error).toMatch(/not allowed/);
    expect(result.current.overrides).toEqual({ '--gv-space-3': '16px' });
  });

  it('drops only the bad entries of a stored session', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        '--gv-space-3': '16px',
        '--gv-primary': 'url(x)',
        '--gv-gone': '1px',
      })
    );
    const { result } = renderHook(() => useOverrides(meta));
    expect(result.current.overrides).toEqual({ '--gv-space-3': '16px' });
    expect(result.current.notice).toBeUndefined();
  });

  it('ignores a tampered store', () => {
    window.localStorage.setItem(STORAGE_KEY, '{"color":"red"}');
    const { result } = renderHook(() => useOverrides(meta));
    expect(result.current.overrides).toEqual({});
    expect(result.current.notice).toBeUndefined();
  });
});
