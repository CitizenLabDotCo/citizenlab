import fs from 'fs';
import path from 'path';

import { isFrameFile, matchStyle, styleObjectsOf } from './styleObjects';

const FRONT = path.resolve(__dirname, '../../..');

describe('styleObjectsOf', () => {
  it('indexes a static style object with its entries and lines', () => {
    const code = [
      'const D = (Story) => (',
      "  <div style={{ width: 524, padding: 18, background: 'white' }}>",
      '    <Story />',
      '  </div>',
      ');',
    ].join('\n');
    const [o] = styleObjectsOf('x.stories.tsx', code);
    expect(o.loc.line).toBe(2);
    expect(o.entries).toMatchObject({
      width: { value: 524 },
      padding: { value: 18, loc: { line: 2 } },
      background: { value: 'white' },
    });
  });

  it('leaves a style with a spread or an expression unmatched', () => {
    const code = [
      'const a = <div style={{ ...base, padding: 4 }} />;',
      'const b = <div style={{ padding: size }} />;',
      "const c = <div style={{ ['pad' + 'ding']: 4 }} />;",
    ].join('\n');
    const objs = styleObjectsOf('x.stories.tsx', code);
    expect(objs).toHaveLength(3);
    expect(objs.every((o) => o.entries === undefined)).toBe(true);
    expect(matchStyle(objs, { padding: 4 })).toEqual([]);
  });

  it('reads the real Setup card story frame at its line', () => {
    const file =
      'app/containers/Admin/projects/project/backofficeRedesign/Event/SetupCard.stories.tsx';
    const objs = styleObjectsOf(
      file,
      fs.readFileSync(path.join(FRONT, file), 'utf8')
    );
    const hit = matchStyle(objs, {
      width: 524,
      padding: 18,
      background: 'white',
    });
    expect(hit).toHaveLength(1);
    expect(hit[0].loc.line).toBe(32);
  });
});

describe('matchStyle', () => {
  const objs = styleObjectsOf(
    'x.stories.tsx',
    [
      'const a = <div style={{ padding: 18 }} />;',
      "const b = <div style={{ padding: '18px' }} />;",
      'const c = <div style={{ padding: 18, margin: 0 }} />;',
    ].join('\n')
  );

  it('needs the same keys and strictly equal values', () => {
    expect(matchStyle(objs, { padding: 18 }).map((o) => o.loc.line)).toEqual([
      1,
    ]);
    expect(matchStyle(objs, { padding: '18px' })[0].loc.line).toBe(2);
    expect(matchStyle(objs, { padding: 18, margin: 0 })[0].loc.line).toBe(3);
    expect(matchStyle(objs, { padding: 19 })).toEqual([]);
  });
});

describe('isFrameFile', () => {
  it('takes story files and the Storybook setup, not the workbench', () => {
    expect(isFrameFile('app/a/B.stories.tsx')).toBe(true);
    expect(isFrameFile('.storybook/contexts/index.tsx')).toBe(true);
    expect(isFrameFile('.storybook/workbench/src/App.tsx')).toBe(false);
    expect(isFrameFile('app/a/B.tsx')).toBe(false);
  });
});
