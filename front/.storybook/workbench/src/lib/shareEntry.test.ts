import { isOwnShare, markShare, valueIn } from './shareEntry';

describe('share links in the history', () => {
  it('reads the value of a parameter', () => {
    expect(valueIn('#/patterns/x?x=abc&o=def', 'o')).toBe('def');
    expect(valueIn('#/patterns/x?x=abc', 'o')).toBeNull();
    expect(valueIn('#/patterns/x', 'x')).toBeNull();
  });

  it('marks the value the session wrote, keeping the rest of the state', () => {
    const state = markShare({ wbOther: true }, 'o', 'old');
    expect(state.wbOther).toBe(true);
    expect(isOwnShare(state, 'o', 'old')).toBe(true);
    const both = markShare(state, 'x', null);
    expect(isOwnShare(both, 'o', 'old')).toBe(true);
    expect(isOwnShare(both, 'x', null)).toBe(true);
  });

  // The bug: edits, a story switch, more edits, then Back. The older
  // entry's `o` is the session's own, older value: not a pasted link.
  it('tells an older entry of the session from a pasted link', () => {
    const older = markShare(null, 'o', 'v1');
    expect(isOwnShare(older, 'o', 'v1')).toBe(true);
    // A pasted link is a new entry: no state, or a state without the mark.
    expect(isOwnShare(null, 'o', 'v1')).toBe(false);
    expect(isOwnShare({ wbOther: true }, 'o', 'v1')).toBe(false);
    // An entry marked with another value (the URL was edited by hand).
    expect(isOwnShare(older, 'o', 'v2')).toBe(false);
    expect(isOwnShare(older, 'x', 'v1')).toBe(false);
    expect(isOwnShare('junk', 'o', 'v1')).toBe(false);
  });
});
