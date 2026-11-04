import { DEMO, inputOfText, problemsOf } from './demo-check';

const row = (over: object = {}) => ({
  row: 'radius',
  value: '3px',
  status: 'traced',
  text: 'props.theme.borderRadius · Button/index.tsx:344',
  ...over,
});

describe('problemsOf', () => {
  it('passes a traced row and a row not traced with its reason', () => {
    expect(
      problemsOf('first', {
        layer: 'button',
        sections: [
          {
            section: 'appearance',
            rows: [
              row(),
              row({
                status: 'untraced',
                text: 'not traced: no styled component owns the winning rule',
              }),
            ],
          },
        ],
      })
    ).toEqual([]);
  });

  it('names a row with no value, no line, a pending line or no reason', () => {
    expect(
      problemsOf('first', {
        layer: 'button',
        sections: [
          {
            section: 'layout',
            rows: [
              row({ row: 'w', value: null }),
              row({ row: 'h', status: null }),
              row({ row: 'gap', status: 'pending' }),
              row({ row: 'padding-v', status: 'untraced', text: 'not traced' }),
            ],
          },
        ],
      })
    ).toEqual([
      'first layout/w: no value',
      'first layout/h: no source line',
      'first layout/gap: source still pending',
      'first layout/padding-v: not traced without a reason',
    ]);
  });

  it('wants a section, and asks selection colours for a value only', () => {
    expect(problemsOf('text', { layer: 'span', sections: [] })).toEqual([
      'text: no Design sections',
    ]);
    expect(
      problemsOf('text', {
        layer: 'span',
        sections: [
          { section: 'selection-colours', rows: [row({ status: null })] },
        ],
      })
    ).toEqual([]);
  });
});

describe('inputOfText', () => {
  it("reads the send script's JSON from the copied text", () => {
    const text = [
      'Workbench changes to send for review.',
      "gh api … > /tmp/gv-send.js && node /tmp/gv-send.js <<'EOF'",
      '{ "branch": "design-system/x", "changes": [1] }',
      'EOF',
      'Tell the person…',
    ].join('\n');
    expect(inputOfText(text)).toEqual({
      branch: 'design-system/x',
      changes: [1],
    });
    expect(inputOfText('no command')).toBeUndefined();
  });
});

it('checks ten components, each with its own story', () => {
  expect(DEMO).toHaveLength(10);
  expect(new Set(DEMO.map((d) => d.story)).size).toBe(10);
});
