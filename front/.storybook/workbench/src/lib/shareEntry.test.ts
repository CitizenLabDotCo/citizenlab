import { isOwnShare, markShare, valueIn } from './shareEntry';

describe('share links in the history', () => {
  it('reads the value of a parameter', () => {
    expect(valueIn('#/patterns/x?o=abc&p=def', 'p')).toBe('def');
    expect(valueIn('#/patterns/x?o=abc', 'p')).toBeNull();
    expect(valueIn('#/patterns/x', 'o')).toBeNull();
  });

  it('marks the value the session wrote, keeping the rest of the state', () => {
    const state = markShare({ wbOpened: true }, 'p', 'old');
    expect(state.wbOpened).toBe(true);
    expect(isOwnShare(state, 'p', 'old')).toBe(true);
    const both = markShare(state, 'o', null);
    expect(isOwnShare(both, 'p', 'old')).toBe(true);
    expect(isOwnShare(both, 'o', null)).toBe(true);
  });

  // The bug: edits, a story switch, more edits, then Back. The older
  // entry's `p` is the session's own, older value: not a pasted link.
  it('tells an older entry of the session from a pasted link', () => {
    const older = markShare(null, 'p', 'v1');
    expect(isOwnShare(older, 'p', 'v1')).toBe(true);
    // A pasted link is a new entry: no state, or a state without the mark.
    expect(isOwnShare(null, 'p', 'v1')).toBe(false);
    expect(isOwnShare({ wbOpened: true }, 'p', 'v1')).toBe(false);
    // An entry marked with another value (the URL was edited by hand).
    expect(isOwnShare(older, 'p', 'v2')).toBe(false);
    expect(isOwnShare(older, 'o', 'v1')).toBe(false);
    expect(isOwnShare('junk', 'p', 'v1')).toBe(false);
  });
});
