import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';

import type { TokenMeta } from './data';
import {
  applyElementEdits,
  changesLook,
  editId,
  ElementEdit,
  inlineValue,
  parseStored,
  subjectOfEdit,
  taskOfEdit,
  valueFits,
} from './elementEdits';
import type { EditTrace } from './trace/codemod';

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

const trace: EditTrace = {
  commit: 'abc1234',
  file: 'app/component-library/components/Button/index.tsx',
  line: 344,
  start: 9000,
  end: 9024,
  context: 'js',
  lineText: '    props.theme.borderRadius;',
  text: 'theme.borderRadius',
};

describe('element edits', () => {
  it('names the commit by the traced code', () => {
    const radius: ElementEdit = {
      ...base,
      rowId: 'radius',
      label: 'Radius',
      from: { raw: '3px', shown: '3' },
      to: { value: '3px', token: '--gv-radius-control' },
      source: trace,
    };
    expect(subjectOfEdit(radius, 'Button', false)).toBe(
      'design-system(heal): Button radius theme.borderRadius \u2192 --gv-radius-control [AI-assisted]'
    );
    expect(subjectOfEdit(base, 'Button', false)).toBe(
      'design-system(heal): Button padding · vertical 9px \u2192 --gv-space-3 [AI-assisted]'
    );
  });

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
    // The fill a city's tenant token gives, as the canvas showed it.
    const fill = {
      ...base,
      from: { raw: 'rgb(22, 58, 125)', shown: '163A7D' },
      to: { value: '#163A7D', token: '--gv-color-tenant-primary' as const },
    };
    expect(changesLook(fill, () => '')).toBe(false);
    expect(changesLook(fill, () => '#ef0071')).toBe(true);
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

  it('formats a traced attach as a heal task at its line', () => {
    const text = taskOfEdit(
      { ...base, source: { ...trace, line: 121, text: "'9px 18px'" } },
      {
        component: 'Button',
        file: trace.file,
        storyId: 'button--default',
        routes: ['admin'],
        layer: 'button "Save changes"',
      }
    );
    expect(text).toBe(
      "heal: Button · app/component-library/components/Button/index.tsx:121 · '9px 18px' → --gv-space-3\n" +
        'why: the workbench traced padding · vertical (button "Save changes") to this line\n' +
        'check: story button--default, routes /admin'
    );
  });

  it('formats an untraced attach and a custom change', () => {
    const ctx = {
      component: 'Button',
      file: 'f.tsx',
      storyId: 's',
      routes: [],
      layer: 'button "Save"',
    };
    expect(taskOfEdit(base, ctx)).toBe(
      'heal: Button · f.tsx · 9px → --gv-space-3\n' +
        'why: padding · vertical set in the workbench (button "Save"); not traced to a line, so find it by hand\n' +
        'check: story s, routes none'
    );
    // The Review page knows no layer: no empty brackets.
    expect(taskOfEdit(base, { ...ctx, layer: '' })).toContain(
      'set in the workbench; not traced'
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
      parseStored(JSON.stringify([{ ...base, source: trace }]), meta)
    ).toHaveLength(1);
    expect(
      parseStored(
        JSON.stringify([{ ...base, source: { ...trace, file: '../x.ts' } }]),
        meta
      )
    ).toEqual([]);
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
