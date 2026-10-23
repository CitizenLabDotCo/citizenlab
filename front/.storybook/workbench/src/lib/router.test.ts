import { act, renderHook } from '@testing-library/react';

import { parseHash, redirectOf, useRoute } from './router';

describe('parseHash foundations token', () => {
  it('reads a third segment as the token to show', () => {
    expect(parseHash('#/foundations/space/--gv-space-3')).toEqual({
      name: 'foundations',
      category: 'space',
      token: '--gv-space-3',
    });
    expect(parseHash('#/foundations/color')).toEqual({
      name: 'foundations',
      category: 'color',
    });
  });

  it('still rejects a third segment elsewhere and a fourth anywhere', () => {
    expect(parseHash('#/components/a/b').name).toBe('not-found');
    expect(parseHash('#/foundations/a/b/c').name).toBe('not-found');
  });
});

describe('parseHash defaults and redirects', () => {
  it('opens Components for the empty hash, `#/` and the old `#/start`', () => {
    ['', '#', '#/', '#/start', '#/start/'].forEach((h) =>
      expect(parseHash(h)).toEqual({ name: 'components' })
    );
  });

  it('opens Colour for `#/foundations`, which has no overview', () => {
    expect(parseHash('#/foundations')).toEqual({
      name: 'foundations',
      category: 'color',
    });
    expect(parseHash('#/foundations/')).toEqual({
      name: 'foundations',
      category: 'color',
    });
  });

  it('keeps unknown paths and `#/start/<x>` as not found', () => {
    expect(parseHash('#/nowhere')).toEqual({
      name: 'not-found',
      path: '/nowhere',
    });
    expect(parseHash('#/start/x').name).toBe('not-found');
  });
});

describe('redirectOf', () => {
  it('names the hash to replace, keeping the share link part', () => {
    expect(redirectOf('')).toBe('#/components');
    expect(redirectOf('#/')).toBe('#/components');
    expect(redirectOf('#/start?o=abc')).toBe('#/components?o=abc');
    expect(redirectOf('#/foundations')).toBe('#/foundations/color');
    expect(redirectOf('#/foundations/?o=abc')).toBe(
      '#/foundations/color?o=abc'
    );
  });

  it('is null for a page that opens as it is', () => {
    expect(redirectOf('#/components')).toBeNull();
    expect(redirectOf('#/foundations/color')).toBeNull();
    expect(redirectOf('#/foundations/space/--gv-space-3')).toBeNull();
    expect(redirectOf('#/nowhere')).toBeNull();
  });
});

describe('useRoute', () => {
  it('replaces a redirected hash, so Back does not land on it', () => {
    window.history.replaceState(null, '', '#/foundations');
    const before = window.history.length;
    const { result } = renderHook(() => useRoute());
    expect(result.current).toEqual({ name: 'foundations', category: 'color' });
    expect(window.location.hash).toBe('#/foundations/color');
    expect(window.history.length).toBe(before);
  });

  it('follows hash changes, through the redirects', () => {
    window.history.replaceState(null, '', '#/review');
    const { result } = renderHook(() => useRoute());
    expect(result.current).toEqual({ name: 'review' });
    act(() => {
      window.history.replaceState(null, '', '#/start');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toEqual({ name: 'components' });
    expect(window.location.hash).toBe('#/components');
  });
});
