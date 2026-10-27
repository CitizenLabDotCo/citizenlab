import { blankComments, declsOf } from './cssDecls';

// The template `quasis` were cooked from, as written: ['a: ', ';'] for `a: ${0};`.
const q = (text: string) => text.split(/\$\{\d+\}/);

const short = (quasis: string[]) =>
  declsOf(quasis).map((d) => ({
    prop: d.prop,
    value: d.value,
    selectors: d.selectors,
    atRules: d.atRules,
    important: d.important,
  }));

describe('declsOf', () => {
  it('splits declarations with holes in their values', () => {
    expect(
      short(q('\n  border-radius: ${0};\n  padding: 0 ${1}px;\n'))
    ).toEqual([
      {
        prop: 'border-radius',
        value: ['', 0, ''],
        selectors: [],
        atRules: [],
        important: false,
      },
      {
        prop: 'padding',
        value: ['0 ', 1, 'px'],
        selectors: [],
        atRules: [],
        important: false,
      },
    ]);
  });

  it('keeps nesting paths of selectors and at-rules, holes as ${n}', () => {
    const decls = short(
      q(
        [
          'color: red;',
          '&:hover { color: blue; }',
          '${0} {',
          '  font-size: 14px;',
          '  @media (max-width: ${1}px) {',
          '    margin: 0;',
          '  }',
          '}',
          'gap: 4px',
        ].join('\n')
      )
    );
    expect(decls.map((d) => [d.prop, d.selectors, d.atRules])).toEqual([
      ['color', [], []],
      ['color', ['&:hover'], []],
      ['font-size', ['${0}'], []],
      ['margin', ['${0}'], ['@media (max-width: ${1}px)']],
      // The last declaration needs no `;`.
      ['gap', [], []],
    ]);
  });

  it('flags a hole standing as a statement, and skips lone semicolons', () => {
    // Button/index.tsx:424-425: a conditional declaration, then a mixin.
    const decls = short(
      q('\n  ${0};\n  ${1}\n  color: ${2};\n  ;\n  ${3}: 4px;\n')
    );
    expect(decls.map((d) => [d.prop, d.value])).toEqual([
      ['${0}', []],
      ['${1}', []],
      ['color', ['', 2, '']],
      ['${3}', ['4px']],
    ]);
  });

  it('drops comments as stylis 3 does, but not // inside url()', () => {
    // getButtonStyle's template has `// padding` at Button/index.tsx:422.
    const decls = short(
      q(
        [
          '/* a: 1; */',
          '// padding',
          'padding: ${0};',
          'background: url(//cdn.example.com/a.png); // trailing',
          'content: "// kept";',
        ].join('\n')
      )
    );
    expect(decls.map((d) => [d.prop, d.value])).toEqual([
      ['padding', ['', 0, '']],
      ['background', ['url(//cdn.example.com/a.png)']],
      ['content', ['"// kept"']],
    ]);
    expect(blankComments('a/* b */c')).toBe('a       c');
  });

  it('respects strings and parentheses when splitting', () => {
    const decls = short(
      q(
        'content: \'a;b{c}\';\nbackground: url(data:image/png;base64,xx);\nfont-family: "x:y";'
      )
    );
    expect(decls.map((d) => [d.prop, d.value])).toEqual([
      ['content', ["'a;b{c}'"]],
      ['background', ['url(data:image/png;base64,xx)']],
      ['font-family', ['"x:y"']],
    ]);
  });

  it('lowercases properties but not custom properties, and strips !important', () => {
    const decls = short(q('Color: red !important;\n--My-Var: ${0};'));
    expect(decls).toEqual([
      {
        prop: 'color',
        value: ['red'],
        selectors: [],
        atRules: [],
        important: true,
      },
      {
        prop: '--My-Var',
        value: ['', 0, ''],
        selectors: [],
        atRules: [],
        important: false,
      },
    ]);
  });

  it('skips at-rule statements and text with no property', () => {
    const decls = short(
      q("@import url('x.css');\nnot a declaration;\nwidth: 1px;")
    );
    expect(decls.map((d) => d.prop)).toEqual(['width']);
  });

  it('locates each declaration at its property, from the template text', () => {
    const [a, b] = declsOf(q('\n  color: red;\n  margin: ${0};'));
    expect([a.loc.line, a.loc.col]).toEqual([2, 2]);
    expect([b.loc.line, b.loc.col, b.loc.endLine]).toEqual([3, 2, 3]);
  });

  it('reads nothing from a quasi holding its hole marker', () => {
    expect(declsOf(['a: \u0000;'])).toEqual([]);
  });
});
