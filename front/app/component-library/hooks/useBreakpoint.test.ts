import mediaQuery from 'css-mediaquery';

import { renderHook } from '../utils/testUtils/rtl';

import useBreakpoint from './useBreakpoint';

function createMatchMedia(width: number) {
  return (query: any) => ({
    matches: mediaQuery.match(query, {
      width,
    }),
    media: query,
    onchange: null,
    addListener: () => jest.fn(),
    removeListener: () => jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
}

describe('useBreakpoint', () => {
  it('should return the correct breakpoints when it is phone', () => {
    window.matchMedia = createMatchMedia(350);
    const { result } = renderHook(() => useBreakpoint('phone'));
    expect(result.current).toEqual(true);
  });
  it('should return the correct breakpoints when it is not phone', () => {
    window.matchMedia = createMatchMedia(800);
    const { result } = renderHook(() => useBreakpoint('phone'));
    expect(result.current).toEqual(false);
  });

  it('should return the correct breakpoints when it is large tablet', () => {
    window.matchMedia = createMatchMedia(1000);
    const { result } = renderHook(() => useBreakpoint('tablet'));
    expect(result.current).toEqual(true);
  });
  it('should return the correct breakpoints when it is not large tablet', () => {
    window.matchMedia = createMatchMedia(1300);
    const { result } = renderHook(() => useBreakpoint('tablet'));
    expect(result.current).toEqual(false);
  });

  it('should return the correct breakpoints when it is small desktop', () => {
    window.matchMedia = createMatchMedia(1300);
    const { result } = renderHook(() => useBreakpoint('smallDesktop'));
    expect(result.current).toEqual(true);
  });
  it('should return the correct breakpoints when it is not small desktop', () => {
    window.matchMedia = createMatchMedia(1600);
    const { result } = renderHook(() => useBreakpoint('smallDesktop'));
    expect(result.current).toEqual(false);
  });
});
