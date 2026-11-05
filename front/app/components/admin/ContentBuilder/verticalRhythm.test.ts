import { getBoundaryMargin } from './verticalRhythm';

describe('getBoundaryMargin', () => {
  it('returns undefined when either role is missing', () => {
    expect(getBoundaryMargin(undefined, 'flow', false)).toBeUndefined();
    expect(getBoundaryMargin('flow', undefined, false)).toBeUndefined();
  });

  it('keeps consecutive bands flush', () => {
    expect(getBoundaryMargin('band', 'band', false)).toBe('0px');
  });

  it('separates bands from other roles with the section margin', () => {
    expect(getBoundaryMargin('flow', 'band', false)).toBe('48px');
    expect(getBoundaryMargin('band', 'card', false)).toBe('48px');
    expect(getBoundaryMargin('card', 'band', true)).toBe('32px');
  });

  it('keeps consecutive cards tight', () => {
    expect(getBoundaryMargin('card', 'card', false)).toBe('12px');
    expect(getBoundaryMargin('card', 'card', true)).toBe('8px');
  });

  it('uses the flow margin for remaining boundaries', () => {
    expect(getBoundaryMargin('flow', 'flow', false)).toBe('32px');
    expect(getBoundaryMargin('flow', 'card', false)).toBe('32px');
    expect(getBoundaryMargin('card', 'flow', true)).toBe('24px');
  });
});
