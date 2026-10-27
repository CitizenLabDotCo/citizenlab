import { commitLink, shortFile, sourceLine, tracedWords } from './sourceLine';
import type { PropTrace, TraceSource } from './trace/types';

const BUTTON = 'app/component-library/components/Button/index.tsx';
const STYLES = 'app/component-library/utils/styleUtils.ts';

const src = (over: Partial<TraceSource>): TraceSource => ({
  read: 'theme',
  text: 'props.theme.borderRadius',
  file: BUTTON,
  line: 344,
  col: 4,
  start: 100,
  end: 124,
  via: [],
  ...over,
});

const trace = (over: Partial<PropTrace>): PropTrace => ({
  prop: 'border-top-left-radius',
  value: '3px',
  status: 'traced',
  ...over,
});

describe('sourceLine', () => {
  it('names a theme leaf, its line and where it is defined', () => {
    const corners = [
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
    ].map((prop) =>
      trace({
        prop,
        source: src({
          def: { file: STYLES, line: 242 },
          legacyKey: 'theme.borderRadius',
        }),
      })
    );
    const line = sourceLine(corners, 'abc123');
    expect(line).toMatchObject({
      status: 'traced',
      read: 'theme',
      text: 'props.theme.borderRadius',
      place: { file: BUTTON, line: 344 },
      def: { file: STYLES, line: 242 },
      legacyKey: 'theme.borderRadius',
    });
    expect(line?.differ).toBeUndefined();
    expect(line?.trace).toBeUndefined();
    expect(line?.place?.href).toBe(
      'https://github.com/CitizenLabDotCo/citizenlab/blob/abc123/front/app/component-library/components/Button/index.tsx#L344'
    );
  });

  it('names the map key and the other keys that share the entry', () => {
    const line = sourceLine(
      [
        trace({
          value: '8px',
          source: src({
            read: 'const',
            text: 'bo.borderRadius',
            line: 75,
            mapKey: 'bo-primary',
          }),
          sharedBy: ['bo-primary', 'bo-secondary', 'bo-text'],
        }),
      ],
      'c'
    );
    expect(line?.text).toBe('bo.borderRadius for bo-primary');
    expect(line?.shared).toEqual(['bo-secondary', 'bo-text']);
  });

  it('says a prop is set where the component is used', () => {
    const line = sourceLine(
      [
        trace({
          prop: 'background-color',
          source: src({ read: 'prop', text: 'props.bgColor', prop: 'bgColor' }),
        }),
      ],
      'c'
    );
    expect(line?.text).toBe('prop bgColor, set where the component is used');
  });

  it('gives the reason when a value is not traced', () => {
    const line = sourceLine(
      [trace({ status: 'untraced', why: 'unknown-read' })],
      'c'
    );
    expect(line?.text).toBe(
      'not traced: the code computes it in a way the index does not follow'
    );
    expect(line?.place).toBeUndefined();
  });

  it('points a story frame at its line in the story file', () => {
    const line = sourceLine(
      [
        trace({
          prop: 'padding-top',
          value: '18px',
          status: 'inline',
          decl: {
            template: 'style',
            file: 'app/x/SetupCard.stories.tsx',
            line: 32,
            storyFrame: true,
          },
        }),
      ],
      'c'
    );
    expect(line).toMatchObject({
      status: 'inline',
      text: 'story frame',
      storyFrame: true,
      place: { file: 'app/x/SetupCard.stories.tsx', line: 32 },
    });
  });

  it('marks a row whose longhands trace to different places', () => {
    const line = sourceLine(
      [
        trace({ source: src({}) }),
        trace({ source: src({ start: 300, end: 310, line: 350 }) }),
      ],
      'c'
    );
    expect(line?.differ).toBe(true);
  });

  it('keeps a token only when every longhand reads it', () => {
    const both = sourceLine(
      [
        trace({ token: '--gv-radius-control' }),
        trace({ token: '--gv-radius-control' }),
      ],
      'c'
    );
    expect(both?.token).toBe('--gv-radius-control');
    const one = sourceLine(
      [trace({ token: '--gv-radius-control' }), trace({})],
      'c'
    );
    expect(one?.token).toBeUndefined();
  });
});

describe('the edit a row allows', () => {
  const editable = {
    file: BUTTON,
    start: 100,
    end: 124,
    context: 'js' as const,
    lineText: '    props.theme.borderRadius;',
    line: 344,
  };

  it('carries the traced expression with the commit and its words', () => {
    const line = sourceLine(
      [
        trace({
          source: src({ legacyKey: 'theme.borderRadius' }),
          editable,
        }),
        trace({
          prop: 'border-top-right-radius',
          source: src({ legacyKey: 'theme.borderRadius' }),
          editable,
        }),
      ],
      'abc123'
    );
    expect(line?.trace).toEqual({
      commit: 'abc123',
      ...editable,
      text: 'theme.borderRadius',
    });
    expect(line?.byHand).toBeUndefined();
  });

  it('gives the reason when a person must edit it', () => {
    const no = sourceLine(
      [trace({ source: src({}), editable: { no: 'the value is a prop' } })],
      'c'
    );
    expect(no?.trace).toBeUndefined();
    expect(no?.byHand).toBe('the value is a prop');
    const split = sourceLine(
      [
        trace({ source: src({}), editable }),
        trace({ source: src({}), editable: { ...editable, part: 1 } }),
      ],
      'c'
    );
    expect(split?.byHand).toBe('its sides are written in different places');
  });
});

describe('words', () => {
  it('shortens a path and counts the traced values', () => {
    expect(shortFile(BUTTON)).toBe('Button/index.tsx');
    expect(tracedWords(9, 12)).toBe('traced 9 of 12');
    expect(commitLink('c', 'app/a.ts', 3)).toMatch(
      /\/blob\/c\/front\/app\/a\.ts#L3$/
    );
  });
});
