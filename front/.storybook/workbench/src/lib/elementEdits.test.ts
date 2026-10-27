import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';

import type { Finding, TokenMeta } from './data';
import {
  applyElementEdits,
  changesLook,
  editId,
  ElementEdit,
  inlineValue,
  parseStored,
  taskOfEdit,
  valueFits,
} from './elementEdits';

const meta = tokensMeta as TokenMeta[];

const base: ElementEdit = {
  id: editId('button--default', [0, 1], 'padding-v'),
  storyId: 'button--default',
  path: [0, 1],
  rowId: 'padding-v',
  label: 'Padding · Vertical',
  glyph: 'padding-y',
  props: ['padding-top', 'padding-bottom'],
  from: { raw: '9px', shown: '9' },
  to: { value: '12px', token: '--gv-space-3' },
  kind: 'attach',
  at: 1,
};

describe('element edits', () => {
  it('builds a stable id', () => {
    expect(editId('s', [0, 1], 'fill')).toBe('s|0.1|fill');
    expect(editId('s', null, '12:4')).toBe('s|file|12:4');
  });

  it('knows when the look changes', () => {
    const resolve = (t: string) => (t === '--gv-space-3' ? '12px' : '');
    expect(
      changesLook({ ...base, from: { raw: '12px', shown: '12' } }, resolve)
    ).toBe(false);
    expect(changesLook(base, resolve)).toBe(true);
    expect(
      changesLook({ ...base, kind: 'custom', to: { value: '11px' } }, resolve)
    ).toBe(true);
  });

  it('writes the inline value', () => {
    expect(inlineValue(base)).toBe('var(--gv-space-3)');
    expect(inlineValue({ ...base, to: { value: '11px' } })).toBe('11px');
  });

  it('applies to the element at the path and restores on removal', () => {
    document.body.innerHTML =
      '<div data-gv-story-box><div><i></i><button style="padding-top: 9px">x</button></div></div>';
    const el = document.querySelector('button') as HTMLElement;
    const applied = new Map<string, Map<string, string>>();
    applyElementEdits(document, [base], 'button--default', applied);
    expect(el.style.getPropertyValue('padding-top')).toBe('var(--gv-space-3)');
    expect(el.style.getPropertyValue('padding-bottom')).toBe(
      'var(--gv-space-3)'
    );
    applyElementEdits(document, [], 'button--default', applied);
    expect(el.style.getPropertyValue('padding-top')).toBe('9px');
    expect(el.style.getPropertyValue('padding-bottom')).toBe('');
  });

  it('ignores edits of another story and a path that is gone', () => {
    document.body.innerHTML = '<div data-gv-story-box><div></div></div>';
    const applied = new Map<string, Map<string, string>>();
    expect(() =>
      applyElementEdits(
        document,
        [base, { ...base, storyId: 'other' }],
        'button--default',
        applied
      )
    ).not.toThrow();
  });

  it('formats an attach with a matching finding as a heal task', () => {
    const f: Finding = {
      file: 'app/component-library/components/Button/index.tsx',
      line: 76,
      col: 5,
      raw: '9px',
      category: 'px',
      confidence: 'high',
    };
    const text = taskOfEdit(base, {
      component: 'Button',
      file: f.file,
      storyId: 'button--default',
      routes: ['admin'],
      layer: 'button "Save changes"',
      findings: [f],
    });
    expect(text).toBe(
      'heal: Button · app/component-library/components/Button/index.tsx:76 · 9px → --gv-space-3\n' +
        'why: px, scan confidence high\n' +
        'check: story button--default, routes /admin'
    );
  });

  it('formats an attach without a finding and a custom change', () => {
    const ctx = {
      component: 'Button',
      file: 'f.tsx',
      storyId: 's',
      routes: [],
      layer: 'button "Save"',
      findings: [],
    };
    expect(taskOfEdit(base, ctx)).toBe(
      'heal: Button · f.tsx · 9px → --gv-space-3\n' +
        'why: hard-coded padding · vertical seen in the workbench (button "Save"), scan confidence low\n' +
        'check: story s, routes none'
    );
    expect(
      taskOfEdit({ ...base, kind: 'custom', to: { value: '11px' } }, ctx)
    ).toBe(
      'change: Button · f.tsx · padding-top, padding-bottom 9px → 11px\n' +
        'why: design change from the workbench (custom); it changes the look wherever the component renders, so a token change or its own PR off master\n' +
        'check: story s, routes none'
    );
    expect(
      taskOfEdit(
        {
          ...base,
          kind: 'swap',
          from: { raw: '12px', shown: '12', token: '--gv-space-3' },
          to: { value: '16px', token: '--gv-space-4' },
        },
        ctx
      )
    ).toContain('--gv-space-3 → var(--gv-space-4)\n');
  });

  it('drops bad stored entries', () => {
    expect(parseStored(JSON.stringify([base]), meta)).toHaveLength(1);
    expect(
      parseStored(JSON.stringify([{ ...base, to: { value: 'url(x)' } }]), meta)
    ).toEqual([]);
    expect(
      parseStored(
        JSON.stringify([
          { ...base, to: { value: '12px', token: '--gv-nope' } },
        ]),
        meta
      )
    ).toEqual([]);
    expect(parseStored('nonsense', meta)).toEqual([]);
    expect(
      parseStored(
        JSON.stringify([
          {
            ...base,
            from: { raw: '9px', shown: '9', token: '--gv-space-2' },
            to: { value: '#ff0000' },
          },
        ]),
        meta
      )
    ).toEqual([]);
  });

  it('takes an opacity share, a listed choice and a whole added stroke', () => {
    expect(valueFits('opacity', '0.5')).toBe(true);
    expect(valueFits('opacity', '1')).toBe(true);
    expect(valueFits('opacity', '1.5')).toBe(false);
    expect(valueFits('opacity', '50%')).toBe(false);
    expect(valueFits('direction', 'column')).toBe(true);
    expect(valueFits('direction', 'sideways')).toBe(false);
    expect(valueFits('text-align', 'center')).toBe(true);
    expect(valueFits('stroke', '1px solid #000000')).toBe(true);
    expect(valueFits('shadow', '0px 4px 4px rgba(0, 0, 0, 0.25)')).toBe(true);
    expect(valueFits('stroke-width-2', '2px')).toBe(true);
    expect(valueFits('stroke-color-0', '#00ff00')).toBe(true);
    expect(valueFits('stroke-color-0', 'banana')).toBe(false);
  });

  it('paints an icon, a path inside it untouched', () => {
    document.body.innerHTML =
      '<div data-gv-story-box><svg viewBox="0 0 24 24"><path d="M0 0"/></svg></div>';
    const svg = document.querySelector('svg') as SVGElement;
    const applied = new Map<string, Map<string, string>>();
    const fill: ElementEdit = {
      ...base,
      id: editId('button--default', [0], 'icon-fill'),
      path: [0],
      rowId: 'icon-fill',
      props: ['fill'],
      to: { value: '#00ff00' },
      kind: 'custom',
    };
    applyElementEdits(document, [fill], 'button--default', applied);
    expect(svg.style.getPropertyValue('fill')).toBe('#00ff00');
    expect(
      (svg.firstElementChild as SVGElement).style.getPropertyValue('fill')
    ).toBe('');
  });
});
