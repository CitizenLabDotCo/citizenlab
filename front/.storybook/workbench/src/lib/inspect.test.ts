import type { TokenMeta } from './data';
import {
  atPath,
  choiceText,
  colourText,
  ColourUse,
  declarations,
  defaultTarget,
  fitsProp,
  groupColours,
  holdsText,
  kindOf,
  labelOf,
  layerOf,
  opacityText,
  opacityValue,
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

  it("edits an icon's own paint, not its text colour", () => {
    expect(rowSpec('icon-fill')).toMatchObject({
      props: ['fill'],
      glyph: 'fill',
      editable: true,
      snap: 'color',
    });
    expect(rowSpec('icon-stroke')).toMatchObject({
      props: ['stroke'],
      glyph: 'stroke',
      editable: true,
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
      value: '',
      legacy: [],
    } as unknown as TokenMeta);
  it('matches colours to colour longhands and space to padding', () => {
    expect(fitsProp('background-color')?.(t('--gv-white', 'color'))).toBe(true);
    expect(fitsProp('border-color')?.(t('--gv-white', 'color'))).toBe(true);
    expect(fitsProp('padding-left')?.(t('--gv-space-2', 'space'))).toBe(true);
    expect(fitsProp('padding-left')?.(t('--gv-white', 'color'))).toBe(false);
    expect(fitsProp('fill')?.(t('--gv-green-500', 'color'))).toBe(true);
    expect(fitsProp('stroke')?.(t('--gv-green-500', 'color'))).toBe(true);
    expect(fitsProp('width')).toBeUndefined();
  });
});

describe('holdsText', () => {
  const html = (markup: string) => {
    const box = document.createElement('div');
    box.innerHTML = markup;
    return box.firstElementChild as Element;
  };
  it('gives Text to an element with text of its own or a field', () => {
    expect(holdsText(html('<span>Configure project settings</span>'))).toBe(
      true
    );
    expect(holdsText(html('<div>A Badge with label <b>!</b></div>'))).toBe(
      true
    );
    expect(holdsText(html('<input value="x">'))).toBe(true);
    expect(holdsText(html('<input type="checkbox">'))).toBe(false);
  });
  it('gives no Text to a box of other elements or an icon', () => {
    expect(holdsText(html('<div>\n  <span>Label</span>\n</div>'))).toBe(false);
    expect(
      holdsText(html('<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>'))
    ).toBe(false);
    expect(
      holdsText(html('<svg><text>Axis</text></svg>').firstElementChild!)
    ).toBe(true);
  });
});

const html = (markup: string) => {
  const box = document.createElement('div');
  box.innerHTML = markup;
  return box.firstElementChild as Element;
};

describe('kindOf', () => {
  const PLAIN: Record<string, string> = {
    'background-color': 'rgba(0, 0, 0, 0)',
    'background-image': 'none',
    'box-shadow': 'none',
  };
  const looks =
    (over: Record<string, string> = {}) =>
    (prop: string) =>
      over[prop] ??
      PLAIN[prop] ??
      (/-width$|^padding/.test(prop)
        ? '0px'
        : /-style$/.test(prop)
        ? 'none'
        : '');

  it('reads an icon, an image and a field', () => {
    const svg = html('<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>');
    expect(kindOf(svg, looks())).toBe('icon');
    expect(kindOf(svg.firstElementChild!, looks())).toBe('icon');
    expect(kindOf(html('<img alt="">'), looks())).toBe('image');
    expect(kindOf(html('<input value="x">'), looks())).toBe('field');
    expect(kindOf(html('<textarea></textarea>'), looks())).toBe('field');
  });

  it('reads text with nothing drawn around it as text', () => {
    expect(
      kindOf(html('<span>Configure project settings</span>'), looks())
    ).toBe('text');
    expect(
      kindOf(html('<svg><text>Axis</text></svg>').firstElementChild!, looks())
    ).toBe('text');
  });

  it('reads text in a box of its own as a box', () => {
    const badge = html('<span>Default</span>');
    expect(kindOf(badge, looks({ 'background-color': 'rgb(1, 2, 3)' }))).toBe(
      'box'
    );
    expect(kindOf(badge, looks({ 'padding-left': '8px' }))).toBe('box');
    expect(
      kindOf(
        badge,
        looks({ 'border-top-width': '1px', 'border-top-style': 'solid' })
      )
    ).toBe('box');
    // A border with no style draws nothing.
    expect(kindOf(badge, looks({ 'border-top-width': '1px' }))).toBe('text');
  });

  it('reads text beside other elements, and a checkbox, as a box', () => {
    expect(kindOf(html('<div>Hello <b>you</b></div>'), looks())).toBe('box');
    expect(kindOf(html('<input type="checkbox">'), looks())).toBe('box');
    expect(kindOf(html('<div><span>Label</span></div>'), looks())).toBe('box');
  });
});

describe('layerOf', () => {
  it('picks the whole icon for a click on its path', () => {
    const svg = html('<svg viewBox="0 0 24 24"><g><path d="M0 0"/></g></svg>');
    expect(layerOf(svg.querySelector('path')!)).toBe(svg);
    expect(layerOf(svg)).toBe(svg);
  });

  it('keeps any other element', () => {
    const span = html('<span>Hi</span>');
    expect(layerOf(span)).toBe(span);
  });
});

describe('opacity', () => {
  it("reads a typed opacity as Figma's percent", () => {
    expect(opacityValue('50')).toBe('0.5');
    expect(opacityValue('50%')).toBe('0.5');
    expect(opacityValue(' 100 % ')).toBe('1');
    expect(opacityValue('0')).toBe('0');
    expect(opacityValue('12.5')).toBe('0.125');
    expect(opacityValue('101')).toBeUndefined();
    expect(opacityValue('-5')).toBeUndefined();
    expect(opacityValue('half')).toBeUndefined();
  });

  it('shows it as a percent', () => {
    expect(opacityText('0.5')).toBe('50%');
    expect(opacityText('1')).toBe('100%');
    expect(opacityText('0.125')).toBe('13%');
  });
});

describe('choices', () => {
  it('names layout and text values as Figma does', () => {
    expect(rowSpec('direction')).toMatchObject({
      props: ['flex-direction'],
      editable: true,
    });
    expect(choiceText('direction', 'column')).toBe('Vertical');
    expect(choiceText('wrap', 'wrap')).toBe('Wrap');
    expect(choiceText('justify', 'space-between')).toBe('Space between');
    expect(choiceText('text-align', 'center')).toBe('Centre');
    // A value the list does not have reads as it is.
    expect(choiceText('align', 'self-start')).toBe('self-start');
  });
});

describe('stroke rows', () => {
  it('edits each side of a border on its own', () => {
    expect(rowSpec('stroke-width-2').props).toEqual(['border-bottom-width']);
    expect(rowSpec('stroke-color-3').props).toEqual(['border-left-color']);
    expect(rowSpec('stroke-width-h').props).toEqual([
      'border-left-width',
      'border-right-width',
    ]);
    expect(rowSpec('stroke')).toMatchObject({ props: ['border'] });
    expect(fitsProp('border-left-color')).toBeDefined();
  });
});

describe('groupColours', () => {
  const el = document.createElement('div');
  const use = (rowId: string, raw: string, token?: string): ColourUse => ({
    el,
    rowId,
    value: { raw, shown: colourText(raw), token: token as never },
  });

  it('lists each colour once, the most used first', () => {
    const groups = groupColours([
      use('fill', 'rgb(255, 255, 255)'),
      use('color', 'rgb(0, 0, 0)'),
      use('color', 'rgb(0,0,0)'),
    ]);
    expect(groups.map((g) => [g.value.shown, g.uses.length])).toEqual([
      ['000000', 2],
      ['FFFFFF', 1],
    ]);
  });

  it('groups a bound colour by its token, a plain one by its value', () => {
    const groups = groupColours([
      use('fill', 'rgb(4, 136, 76)', '--gv-green-500'),
      use('color', 'rgb(4, 136, 76)'),
      use('icon-fill', 'rgb(4, 136, 76)', '--gv-success'),
    ]);
    expect(groups).toHaveLength(3);
  });
});
