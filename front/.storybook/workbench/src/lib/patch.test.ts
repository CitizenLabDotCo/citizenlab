import {
  EditSource,
  lineEditFrom,
  lineEditOf,
  rawUrl,
  resolveItems,
} from './patch';
import { Item, lineEditOfUndo } from './send';

const BUTTON = [
  '  const borderRadius =',
  '    props.borderRadius ||',
  '    get(defaultStyleValues, `${props.buttonStyle}.borderRadius`) ||',
  '    props.theme.borderRadius;',
  '  return `',
  '    border-radius: ${(props) => props.theme.borderRadius};',
  "    padding: '3px 6px';",
  '    color: rgba(colors.black, 0.5);',
  '  `;',
].join('\n');

const legacy = (line: number, col: number) => ({
  line,
  col,
  raw: 'props.theme.borderRadius',
  category: 'legacy-theme' as const,
});

describe('lineEditOf', () => {
  it('writes a legacy read in code as a string', () => {
    expect(lineEditOf(BUTTON, legacy(4, 5), '--gv-radius-1')).toEqual({
      line: 4,
      old: '    props.theme.borderRadius;',
      new: "    'var(--gv-radius-1)';",
    });
  });

  it('writes a legacy read inside a template as CSS, arrow and all', () => {
    expect(lineEditOf(BUTTON, legacy(6, 33), '--gv-radius-1')).toEqual({
      line: 6,
      old: '    border-radius: ${(props) => props.theme.borderRadius};',
      new: '    border-radius: var(--gv-radius-1);',
    });
  });

  it('finds the read when the column moved, if it is alone on the line', () => {
    expect(lineEditOf(BUTTON, legacy(4, 1), '--gv-radius-1')?.new).toBe(
      "    'var(--gv-radius-1)';"
    );
  });

  it('replaces a literal in a string in place', () => {
    expect(
      lineEditOf(
        BUTTON,
        { line: 7, col: 15, raw: '3px', category: 'px' },
        '--gv-space-1'
      )
    ).toEqual({
      line: 7,
      old: "    padding: '3px 6px';",
      new: "    padding: 'var(--gv-space-1) 6px';",
    });
  });

  it('leaves code, spacing call sites and lost lines to a person', () => {
    const rgba = {
      line: 8,
      col: 12,
      raw: 'rgba(colors.black, 0.5)',
      category: 'rgba' as const,
    };
    expect(lineEditOf(BUTTON, rgba, '--gv-grey-500')).toBeUndefined();
    expect(
      lineEditOf(
        BUTTON,
        { line: 7, col: 15, raw: '3px', category: 'layout-spacing' },
        '--gv-space-1'
      )
    ).toBeUndefined();
    expect(lineEditOf(BUTTON, legacy(2, 5), '--gv-radius-1')).toBeUndefined();
    expect(lineEditOf(BUTTON, legacy(40, 5), '--gv-radius-1')).toBeUndefined();
    expect(
      lineEditOf(
        BUTTON,
        { ...legacy(4, 5), raw: 'props.theme\n.borderRadius' },
        '--gv-radius-1'
      )
    ).toBeUndefined();
  });
});

const source = (over: Partial<EditSource> = {}): EditSource => ({
  file: 'app/component-library/components/Button/index.tsx',
  story: 'components-actions-button--default',
  subject: 'design-system(design): Button radius 3px → --gv-radius-1',
  token: '--gv-radius-1',
  candidates: [legacy(4, 5)],
  words: ['radius'],
  ...over,
});

describe('lineEditFrom', () => {
  it('edits the one candidate, from the repository root', () => {
    expect(lineEditFrom(BUTTON, source())).toEqual({
      subject: 'design-system(design): Button radius 3px → --gv-radius-1',
      story: 'components-actions-button--default',
      file: 'front/app/component-library/components/Button/index.tsx',
      line: 4,
      old: '    props.theme.borderRadius;',
      new: "    'var(--gv-radius-1)';",
    });
  });

  it("picks among several by the row's words, else gives up", () => {
    const px = { line: 7, col: 15, raw: '3px', category: 'px' as const };
    expect(
      lineEditFrom(BUTTON, source({ candidates: [px, legacy(6, 33)] }))?.line
    ).toBe(6);
    expect(
      lineEditFrom(
        BUTTON,
        source({ candidates: [legacy(4, 5), legacy(6, 33)] })
      )
    ).toBeUndefined();
  });
});

describe('resolveItems', () => {
  const item = (over: Partial<Item> = {}): Item => ({
    key: 'k',
    value: '--gv-radius-1',
    task: 'heal: Button',
    undo: 'put back: Button',
    ...over,
  });

  it('gives an item its edit and a put-back that is an edit too', async () => {
    const [a, b] = await resolveItems(
      [item({ source: source() }), item({ key: 'plain' })],
      async () => BUTTON
    );
    expect(a.edit?.new).toBe("    'var(--gv-radius-1)';");
    expect(lineEditOfUndo(a.undo)?.new).toBe('    props.theme.borderRadius;');
    expect(b).toEqual(item({ key: 'plain' }));
  });

  it('keeps the task when GitHub does not answer', async () => {
    const [a] = await resolveItems(
      [item({ source: source() })],
      async () => undefined
    );
    expect(a.edit).toBeUndefined();
    expect(a.undo).toBe('put back: Button');
  });
});

it('reads files from the workbench branch on GitHub', () => {
  expect(rawUrl('app/x.tsx')).toBe(
    'https://raw.githubusercontent.com/CitizenLabDotCo/citizenlab/refs/heads/design-system/workbench/front/app/x.tsx'
  );
});
