// Go Vocal never loads the workbench: no file the platform builds imports
// .storybook/ (the workbench, its mocks), scripts/design-system/ or
// Storybook itself. Stories, tests, mocks and the Storybook helpers in
// app/utils/storybook/ may; the tokens (app/design-system/) are the
// platform's to read once the setup lands.
import fs from 'fs';
import path from 'path';

const FRONT = path.resolve(__dirname, '../..');

const TOOLING =
  /\.stories\.tsx$|\.test\.tsx?$|\/__mocks__\/|^app\/utils\/storybook\/|^app\/design-system\//;
const WORKBENCH = /\.storybook\b|scripts\/design-system|^@?storybook(\/|$)/;

const sources = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return sources(file);
    return /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [file] : [];
  });

const importsOf = (text: string) =>
  Array.from(
    text.matchAll(
      /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\(\s*)['"]([^'"]+)['"]/g
    ),
    (m) => m[1]
  );

it('the platform imports nothing of the workbench or Storybook', () => {
  const found = sources(path.join(FRONT, 'app'))
    .map((file) => path.relative(FRONT, file).split(path.sep).join('/'))
    .filter((file) => !TOOLING.test(file))
    .flatMap((file) =>
      importsOf(fs.readFileSync(path.join(FRONT, file), 'utf8'))
        .filter((spec) => WORKBENCH.test(spec))
        .map((spec) => `${file} imports ${spec}`)
    );
  expect(found).toEqual([]);
});

it('reads the imports it checks', () => {
  expect(
    importsOf(
      "import a from '../../.storybook/mocks';\nconst b = await import('storybook/test');\nimport 'x.css';"
    )
  ).toEqual(['../../.storybook/mocks', 'storybook/test', 'x.css']);
});
