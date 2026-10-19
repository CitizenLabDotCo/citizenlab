import { findMatch } from './findMatch';

const marked = (text: string, term: string) => {
  const match = findMatch(text, term);
  return match && text.slice(match.start, match.end);
};

describe('findMatch', () => {
  it('finds the search whatever its case', () => {
    expect(findMatch('City Park renewal', 'park')).toEqual({
      start: 5,
      end: 9,
    });
  });

  it('keeps the offsets right after a letter that grows when lower-cased', () => {
    expect(marked('İzmir Parkı', 'park')).toBe('Park');
  });

  it('marks a letter that grows when lower-cased', () => {
    expect(marked('İzmir Parkı', 'izmir')).toBe('İzmir');
  });

  it('ignores accents on either side', () => {
    expect(marked('Café Central', 'cafe')).toBe('Café');
    expect(marked('Cafe Central', 'café')).toBe('Cafe');
  });

  it('finds nothing when the search is not in the title', () => {
    expect(findMatch('City Park', 'school')).toBeUndefined();
  });
});
