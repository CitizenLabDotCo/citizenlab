import type { TokenMeta } from './data';
import {
  atPath,
  candidatesFor,
  colourText,
  declarations,
  defaultTarget,
  fitsProp,
  labelOf,
  parentTarget,
  pathOf,
  pxText,
  rowSpec,
  shortName,
  shownFamily,
  varsOf,
} from './inspect';

describe('declarations', () => {
  it('splits a rule into property and value pairs', () => {
    expect(
      declarations(
        'padding: var(--gv-space-3) var(--gv-space-6); color: red !important;'
      )
    ).toEqual([
      ['padding', 'var(--gv-space-3) var(--gv-space-6)'],
      ['color', 'red'],
    ]);
  });

  it('keeps a semicolon inside brackets', () => {
    expect(
      declarations('background: url(data:image/png;base64,AAA); width: 1px')
    ).toEqual([
      ['background', 'url(data:image/png;base64,AAA)'],
      ['width', '1px'],
    ]);
  });

  it('skips empty and broken parts', () => {
    expect(declarations(';;nonsense; :x; a: ')).toEqual([]);
  });
});

describe('varsOf', () => {
  it('lists the tokens a value reads, once each', () => {
    expect(
      varsOf('var(--gv-a) var(--gv-b, var(--gv-c)) var(--gv-a) var(--other)')
    ).toEqual(['--gv-a', '--gv-b', '--gv-c']);
  });
});

describe('candidatesFor', () => {
  it('finds a longhand through its shorthand, the last declaration first', () => {
    const decls: [string, string][] = [
      ['padding', 'var(--gv-space-2)'],
      ['padding-top', 'var(--gv-space-4)'],
      ['color', 'var(--gv-text)'],
    ];
    expect(candidatesFor('padding-top', decls)).toEqual([
      '--gv-space-4',
      '--gv-space-2',
    ]);
    expect(candidatesFor('padding-left', decls)).toEqual(['--gv-space-2']);
    expect(candidatesFor('background-color', decls)).toEqual([]);
  });

  it('reads the background shorthand for the fill', () => {
    expect(
      candidatesFor('background-color', [
        ['background', 'var(--gv-tenant-primary)'],
      ])
    ).toEqual(['--gv-tenant-primary']);
  });
});

describe('formatting', () => {
  it('writes colours as Figma does', () => {
    expect(colourText('rgb(253, 253, 253)')).toBe('FDFDFD');
    expect(colourText('rgba(0, 0, 0, 0.5)')).toBe('000000 50%');
    expect(colourText('rgb(0 12 46 / 1)')).toBe('000C2E');
    expect(colourText('currentcolor')).toBe('currentcolor');
  });

  it('drops px from lengths', () => {
    expect(pxText('12px')).toBe('12');
    expect(pxText('12.456px')).toBe('12.46');
    expect(pxText('1.5')).toBe('1.5');
  });

  it('names the first family the document can draw', () => {
    const stack =
      'LentiaNova-Neutral, "Space Grotesk", "Public Sans", sans-serif';
    expect(shownFamily(stack, (f) => f !== 'LentiaNova-Neutral')).toBe(
      'Space Grotesk'
    );
    expect(shownFamily(stack, () => false)).toBe('LentiaNova-Neutral');
  });

  it('shortens token names', () => {
    expect(shortName('--gv-tenant-primary')).toBe('tenant-primary');
  });
});

describe('layers', () => {
  const doc = () => {
    document.body.innerHTML = `
      <div id="storybook-root"><div data-gv-story-box="">
        <div class="wrap"><div class="inner">
          <button aria-label="Save">Save changes</button><span>Hi</span>
        </div></div>
      </div></div>`;
    return document;
  };

  it('selects the outer element through wrappers that hold one element', () => {
    const d = doc();
    expect(defaultTarget(d)?.className).toBe('inner');
  });

  it('finds a selection again by its path', () => {
    const d = doc();
    const button = d.querySelector('button') as Element;
    const path = pathOf(button);
    expect(path).toEqual([0, 0, 0]);
    expect(atPath(d, path as number[])).toBe(button);
    expect(atPath(d, [0, 5])).toBeNull();
  });

  it('steps to the parent, never to the story box', () => {
    const d = doc();
    const wrap = d.querySelector('.wrap') as Element;
    expect(parentTarget(d.querySelector('.inner') as Element)).toBe(wrap);
    expect(parentTarget(wrap)).toBeNull();
  });

  it('names a layer by its label or text', () => {
    const d = doc();
    expect(labelOf(d.querySelector('button') as Element)).toBe('button "Save"');
    expect(labelOf(d.querySelector('span') as Element)).toBe('span "Hi"');
    expect(labelOf(d.querySelector('.wrap') as Element)).toBe(
      'div "Save changesHi"'
    );
    const empty = d.createElement('div');
    expect(labelOf(empty)).toBe('div');
  });
});

describe('rowSpec', () => {
  it('maps a padding pair to its two longhands', () => {
    expect(rowSpec('padding-v')).toEqual({
      props: ['padding-top', 'padding-bottom'],
      glyph: 'padding-y',
      half: true,
      editable: true,
      snap: 'space',
    });
    expect(rowSpec('padding-2').props).toEqual(['padding-bottom']);
    expect(rowSpec('padding').props).toHaveLength(4);
  });

  it('maps radius pairs diagonally', () => {
    expect(rowSpec('radius-v').props).toEqual([
      'border-top-left-radius',
      'border-bottom-right-radius',
    ]);
    expect(rowSpec('radius-h').props).toEqual([
      'border-top-right-radius',
      'border-bottom-left-radius',
    ]);
  });

  it('keeps size and shadow read-only', () => {
    expect(rowSpec('w')).toMatchObject({
      editable: false,
      glyph: 'width',
      half: true,
    });
    expect(rowSpec('shadow')).toMatchObject({
      editable: false,
      glyph: 'shadow',
    });
  });

  it('gives text rows their glyph and no snap', () => {
    expect(rowSpec('size')).toMatchObject({
      props: ['font-size'],
      glyph: 'font-size',
      half: true,
    });
    expect(rowSpec('size').snap).toBeUndefined();
    expect(rowSpec('color')).toMatchObject({
      props: ['color'],
      glyph: 'text',
      snap: 'color',
      half: false,
    });
    expect(rowSpec('fill')).toMatchObject({
      props: ['background-color'],
      glyph: 'fill',
      snap: 'color',
    });
  });
});

describe('fitsProp', () => {
  const t = (name: string, category: string, tier: 1 | 2 = 2) =>
    ({
      name,
      category,
      tier,
      values: { today: '', redesign: '' },
      legacy: [],
    } as unknown as TokenMeta);
  it('matches colours to colour longhands and space to padding', () => {
    expect(fitsProp('background-color')?.(t('--gv-white', 'color'))).toBe(true);
    expect(fitsProp('border-color')?.(t('--gv-white', 'color'))).toBe(true);
    expect(fitsProp('padding-left')?.(t('--gv-space-2', 'space'))).toBe(true);
    expect(fitsProp('padding-left')?.(t('--gv-white', 'color'))).toBe(false);
    expect(fitsProp('width')).toBeUndefined();
  });
});
