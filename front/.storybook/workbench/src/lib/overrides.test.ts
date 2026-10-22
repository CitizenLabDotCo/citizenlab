import { act, renderHook } from '@testing-library/react';

import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';

import type { TokenMeta } from './data';
import {
  MAX_PAYLOAD_BYTES,
  SNAP_DELTA_E,
  STORAGE_KEY,
  deltaE76,
  encodeOverrides,
  nearestColour,
  palette,
  parseColour,
  parseOverrides,
  parseOverridesResult,
  snap,
  toLab,
  useOverrides,
  withOverrides,
} from './overrides';

const meta = tokensMeta as TokenMeta[];

// base64url of an arbitrary (ASCII) JSON text, bypassing encodeOverrides.
const raw = (json: string) =>
  btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

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

describe('colour distance', () => {
  it('reads hex and rgb colours', () => {
    expect(parseColour('#fff')).toEqual([255, 255, 255, 1]);
    expect(parseColour('#00000080')?.[3]).toBeCloseTo(0.5, 2);
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
    expect(parseOverrides(encodeOverrides(o), meta)).toEqual(o);
    expect(
      parseOverrides(`#/components/a--b?o=${encodeOverrides(o)}`, meta)
    ).toEqual(o);
  });

  it('reads nothing from a plain route', () => {
    expect(parseOverridesResult('#/start', meta)).toEqual({ overrides: {} });
    expect(parseOverridesResult('', meta)).toEqual({ overrides: {} });
  });

  it('writes the parameter into a route hash', () => {
    const o = { '--gv-radius-control': '20px' };
    expect(withOverrides('#/components/a--b', o)).toBe(
      `#/components/a--b?o=${encodeOverrides(o)}`
    );
    expect(withOverrides(`#/start?o=${encodeOverrides(o)}`, {})).toBe(
      '#/start'
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
    ['an array', '["--gv-primary"]'],
    ['null', 'null'],
    ['broken JSON', '{"--gv-primary":'],
  ];

  it.each(rejects)('rejects %s', (_, json) => {
    const result = parseOverridesResult(raw(json), meta);
    expect(result.overrides).toEqual({});
    expect(result.error).toEqual(expect.any(String));
  });

  it('rejects a payload that is not base64url', () => {
    expect(parseOverridesResult('#/x?o=a+b/c', meta).error).toBeDefined();
    expect(parseOverridesResult('#/x?o=%%%', meta).error).toBeDefined();
  });

  it('rejects an oversized payload without decoding it', () => {
    const big = raw(
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
      '#/x?o=Zm9v',
    ]) {
      expect(() => parseOverridesResult(junk, meta)).not.toThrow();
    }
  });
});

describe('useOverrides', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, '', '#/start');
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

  it('applies nothing from a bad link and says so', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ '--gv-space-3': '16px' })
    );
    window.history.replaceState(
      null,
      '',
      `#/start?o=${raw('{"--gv-primary":"url(x)"}')}`
    );
    const { result } = renderHook(() => useOverrides(meta));
    expect(result.current.overrides).toEqual({});
    expect(result.current.notice).toMatch(/share link was not applied/);
  });

  it('ignores a tampered store', () => {
    window.localStorage.setItem(STORAGE_KEY, '{"color":"red"}');
    const { result } = renderHook(() => useOverrides(meta));
    expect(result.current.overrides).toEqual({});
    expect(result.current.notice).toBeUndefined();
  });
});
