import { lintBlockSource } from './lint';

describe('lintBlockSource', () => {
  it('accepts a clean block', () => {
    const source = [
      "import { React, Box, useProjectsMini } from 'gv-sdk';",
      'export default function Block({ config, msg }) {',
      '  return <Box>{msg("title")}</Box>;',
      '}',
    ].join('\n');

    expect(lintBlockSource(source)).toEqual([]);
  });

  it('flags direct network access with the line number', () => {
    const source = ["const f = () => fetch('/web_api/v1/projects');"].join(
      '\n'
    );

    const diagnostics = lintBlockSource(source);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({ rule: 'no-network', line: 1 });
  });

  it('flags imports outside gv-sdk', () => {
    const diagnostics = lintBlockSource("import axios from 'axios';");
    expect(diagnostics[0]).toMatchObject({ rule: 'imports-whitelist' });
  });

  it('flags eval, storage, raw html and dynamic import', () => {
    const source = [
      'eval("1");',
      'localStorage.getItem("x");',
      '<div dangerouslySetInnerHTML={{ __html: html }} />;',
      'import("x");',
    ].join('\n');

    const rules = lintBlockSource(source).map((d) => d.rule);
    expect(rules).toEqual(
      expect.arrayContaining([
        'no-eval',
        'no-storage',
        'no-raw-html',
        'no-dynamic-import',
      ])
    );
  });
});
