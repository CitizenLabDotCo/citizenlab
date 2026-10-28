import { parse as babelParse } from '@babel/parser';

import { EditSource, lineEditFrom, rawUrl, resolveItems } from './patch';
import { Item, lineEditOfUndo } from './send';
import type { Parse } from './trace/codemod';

const parse: Parse = (code) =>
  babelParse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
    tokens: true,
  }) as unknown as ReturnType<Parse>;

const BUTTON = [
  'const f = (props) => {',
  '  const borderRadius =',
  '    props.borderRadius ||',
  '    props.theme.borderRadius;',
  '  return borderRadius;',
  '};',
].join('\n');

const LINE = '    props.theme.borderRadius;';
const START = BUTTON.indexOf('props.theme.borderRadius');

const source = (over: Partial<EditSource> = {}): EditSource => ({
  file: 'app/component-library/components/Button/index.tsx',
  story: 'components-forms-button--default',
  subject: 'design-system(heal): Button radius [AI-assisted]',
  token: '--gv-radius-1',
  trace: {
    commit: 'abc1234',
    file: 'app/component-library/components/Button/index.tsx',
    line: 4,
    start: START,
    end: START + 'props.theme.borderRadius'.length,
    context: 'js',
    lineText: LINE,
  },
  ...over,
});

describe('lineEditFrom', () => {
  it('writes the traced expression as the token, path from the repo root', () => {
    expect(lineEditFrom(BUTTON, source(), parse)).toEqual({
      subject: 'design-system(heal): Button radius [AI-assisted]',
      story: 'components-forms-button--default',
      file: 'front/app/component-library/components/Button/index.tsx',
      line: 4,
      old: LINE,
      new: "    'var(--gv-radius-1)';",
    });
  });

  it('says why when the line moved', () => {
    expect(lineEditFrom(`\n${BUTTON}`, source(), parse)).toEqual({
      byHand: 'the code moved since the trace',
    });
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
      async () => BUTTON,
      async () => parse
    );
    expect(a.edit?.new).toBe("    'var(--gv-radius-1)';");
    expect(lineEditOfUndo(a.undo)?.new).toBe(LINE);
    expect(b).toEqual(item({ key: 'plain' }));
  });

  it('keeps the task with the reason when there is no plain edit', async () => {
    const [a] = await resolveItems(
      [item({ source: source() })],
      async () => undefined,
      async () => parse
    );
    expect(a.edit).toBeUndefined();
    expect(a.undo).toBe('put back: Button');
    expect(a.task).toBe('heal: Button\nby hand: GitHub did not answer');
    const [b] = await resolveItems(
      [item({ source: source() })],
      async () => `\n${BUTTON}`,
      async () => parse
    );
    expect(b.task).toBe(
      'heal: Button\nby hand: the code moved since the trace'
    );
  });

  it('loads no parser when nothing has a source', async () => {
    const parser = jest.fn();
    const items = [item()];
    expect(await resolveItems(items, async () => '', parser)).toBe(items);
    expect(parser).not.toHaveBeenCalled();
  });
});

it('reads files from the workbench branch on GitHub', () => {
  expect(rawUrl('app/x.tsx')).toBe(
    'https://raw.githubusercontent.com/CitizenLabDotCo/citizenlab/refs/heads/design-system/workbench/front/app/x.tsx'
  );
});

describe('a named value changed where it is defined', () => {
  it('writes the definition line, not the component', () => {
    const text = "export const theme = {\n  borderRadius: '3px',\n};\n";
    const s: EditSource = {
      file: 'app/component-library/utils/styleUtils.ts',
      story: 'components-actions-button--default',
      subject: 'design-system(design): theme.borderRadius → 6px',
      token: '',
      define: { line: 2, key: 'borderRadius', value: '6px' },
    };
    expect(lineEditFrom(text, s, parse)).toEqual({
      subject: s.subject,
      story: s.story,
      file: 'front/app/component-library/utils/styleUtils.ts',
      line: 2,
      old: "  borderRadius: '3px',",
      new: "  borderRadius: '6px',",
    });
  });
});
