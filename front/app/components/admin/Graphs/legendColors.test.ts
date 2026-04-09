import { EMPTY_COLOR, legendColorMap, legendColors } from './legendColors';

const SCHEME = ['#AAA', '#BBB', '#CCC'];

describe('legendColorMap', () => {
  it('assigns sequential colors from the scheme to non-null keys', () => {
    const map = legendColorMap(['a', 'b', 'c'], SCHEME);
    expect(map.get('a')).toBe('#AAA');
    expect(map.get('b')).toBe('#BBB');
    expect(map.get('c')).toBe('#CCC');
  });

  it('assigns EMPTY_COLOR to null keys', () => {
    const map = legendColorMap(['a', null, 'c'], SCHEME);
    expect(map.get(null)).toBe(EMPTY_COLOR);
    expect(map.get('a')).toBe('#AAA');
    expect(map.get('c')).toBe('#CCC');
  });

  it('wraps colors when legend exceeds scheme length', () => {
    const map = legendColorMap(['a', 'b', 'c', 'd'], SCHEME);
    expect(map.get('d')).toBe('#AAA'); // 3 % 3 = 0
  });

  it('returns an empty map for an empty legend', () => {
    const map = legendColorMap([], SCHEME);
    expect(map.size).toBe(0);
  });

  it('handles numeric keys', () => {
    const map = legendColorMap([1, 2, null], SCHEME);
    expect(map.get(1)).toBe('#AAA');
    expect(map.get(2)).toBe('#BBB');
    expect(map.get(null)).toBe(EMPTY_COLOR);
  });
});

describe('legendColors', () => {
  it('returns an ordered array matching legend positions', () => {
    expect(legendColors(['a', 'b', 'c'], SCHEME)).toEqual([
      '#AAA',
      '#BBB',
      '#CCC',
    ]);
  });

  it('uses EMPTY_COLOR for null entries', () => {
    expect(legendColors(['a', null, 'c'], SCHEME)).toEqual([
      '#AAA',
      EMPTY_COLOR,
      '#CCC',
    ]);
  });

  it('is consistent with legendColorMap', () => {
    const legend: (string | null)[] = ['x', null, 'y', 'z'];
    const map = legendColorMap(legend, SCHEME);
    const arr = legendColors(legend, SCHEME);

    legend.forEach((key, i) => {
      expect(arr[i]).toBe(map.get(key));
    });
  });

  it('returns an empty array for an empty legend', () => {
    expect(legendColors([], SCHEME)).toEqual([]);
  });
});
