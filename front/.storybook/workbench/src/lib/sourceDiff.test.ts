import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';
import tokensSource from '../../../../app/design-system/tokens/tokens.source.json';

import type { TokenMeta } from './data';
import { sourceChanges, sourcePatch } from './sourceDiff';

const meta = tokensMeta as TokenMeta[];

describe('sourceChanges', () => {
  it('changes $value of a token that is the same in both modes', () => {
    const { changes, unknown } = sourceChanges(
      { '--gv-radius-2': '12px' },
      meta,
      tokensSource
    );
    expect(unknown).toEqual([]);
    expect(changes).toEqual([
      {
        token: '--gv-radius-2',
        modes: 'both',
        pointer: '/primitive/radius/2/$value',
        from: '8px',
        to: '12px',
      },
    ]);
  });

  it('changes both fields of a token with its own redesign value', () => {
    const { changes } = sourceChanges(
      { '--gv-color-text-heading': '#222222' },
      meta,
      tokensSource
    );
    expect(changes.map((c) => [c.modes, c.pointer, c.from, c.to])).toEqual([
      [
        'today',
        '/semantic/color/color-text-heading/$value',
        '#333333',
        '#222222',
      ],
      [
        'redesign',
        '/semantic/color/color-text-heading/$extensions/gv/redesign',
        '#474747',
        '#222222',
      ],
    ]);
  });

  it('writes var() of a token as a source alias, skips no-op changes', () => {
    const { changes } = sourceChanges(
      {
        '--gv-text-secondary': 'var(--gv-grey-800)',
        '--gv-radius-2': '8px',
      },
      meta,
      tokensSource
    );
    expect(changes).toHaveLength(1);
    expect(changes[0].from).toBe('{primitive.color.cool-grey-600}');
    expect(changes[0].to).toBe('{primitive.color.grey-800}');
  });

  it('aliases var() with a fallback, keeps anything longer raw', () => {
    const to = (value: string) =>
      sourceChanges({ '--gv-radius-2': value }, meta, tokensSource).changes[0]
        ?.to;
    expect(to('var(--gv-radius-3, 4px)')).toBe('{primitive.radius.3}');
    expect(to('var(--gv-radius-3, 4px) var(--gv-radius-1)')).toBe(
      'var(--gv-radius-3, 4px) var(--gv-radius-1)'
    );
  });

  it('lists tokens it cannot find', () => {
    expect(
      sourceChanges({ '--gv-nope': '1px' }, meta, tokensSource).unknown
    ).toEqual(['--gv-nope']);
  });
});

describe('sourcePatch', () => {
  it('is a JSON Patch with a test before each replace', () => {
    const { changes } = sourceChanges(
      { '--gv-radius-2': '12px' },
      meta,
      tokensSource
    );
    expect(JSON.parse(sourcePatch(changes))).toEqual([
      { op: 'test', path: '/primitive/radius/2/$value', value: '8px' },
      { op: 'replace', path: '/primitive/radius/2/$value', value: '12px' },
    ]);
  });
});
