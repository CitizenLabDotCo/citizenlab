import { parseHash } from './router';

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
