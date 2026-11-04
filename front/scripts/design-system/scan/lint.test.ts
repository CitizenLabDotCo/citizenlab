import { lintFindings, parseAddedLines } from './lint';
import { Finding, FindingCategory } from './schema';

const DIFF = `diff --git a/app/component-library/components/Box/index.tsx b/app/component-library/components/Box/index.tsx
index 1111111..2222222 100644
--- a/app/component-library/components/Box/index.tsx
+++ b/app/component-library/components/Box/index.tsx
@@ -10,0 +11,2 @@ const Box = styled.div\`
+  padding: 13px;
+  color: #ff0000;
@@ -20 +22 @@ export default Box;
-  margin: 4px;
+  margin: 5px;
diff --git a/app/containers/Foo/index.tsx b/app/containers/Foo/index.tsx
--- a/app/containers/Foo/index.tsx
+++ b/app/containers/Foo/index.tsx
@@ -1,0 +2 @@
+  padding: 3px;
diff --git a/app/design-system/old.ts b/app/design-system/old.ts
deleted file mode 100644
--- a/app/design-system/old.ts
+++ /dev/null
@@ -1 +0,0 @@
-export const x = '1px';
`;

const f = (
  file: string,
  line: number,
  category: FindingCategory,
  raw: string
): Finding => ({ file, line, col: 3, raw, category, confidence: 'high' });

describe('parseAddedLines', () => {
  it('collects added line numbers per new file path', () => {
    const added = parseAddedLines(DIFF);
    expect([...added.keys()].sort()).toEqual([
      'app/component-library/components/Box/index.tsx',
      'app/containers/Foo/index.tsx',
    ]);
    expect([
      ...(added.get(
        'app/component-library/components/Box/index.tsx'
      ) as Set<number>),
    ]).toEqual([11, 12, 22]);
  });

  it('counts context lines when the diff has them', () => {
    const withContext = `+++ b/app/design-system/a.ts
@@ -1,3 +1,4 @@
 one
-two
+deux
+trois
 four
`;
    expect([
      ...(parseAddedLines(withContext).get(
        'app/design-system/a.ts'
      ) as Set<number>),
    ]).toEqual([2, 3]);
  });
});

describe('lintFindings', () => {
  const BOX = 'app/component-library/components/Box/index.tsx';
  const findings = [
    f(BOX, 11, 'px', '13px'),
    f(BOX, 12, 'hex', '#ff0000'),
    f(BOX, 13, 'px', '2px'), // unchanged line
    f(BOX, 22, 'legacy-colors', 'colors.black'), // not off-spec
    f(BOX, 22, 'styled-block', 'styled.div'), // not off-spec
    f('app/containers/Foo/index.tsx', 2, 'px', '3px'), // outside the lint scope
    f('app/design-system/new.ts', 40, 'named-color', 'red'), // whole file added
  ];

  it('keeps off-spec findings on added lines under the library and design-system', () => {
    const added = parseAddedLines(DIFF);
    added.set('app/design-system/new.ts', 'all');
    expect(
      lintFindings(findings, added).map((x) => `${x.file}:${x.line} ${x.raw}`)
    ).toEqual([
      `${BOX}:11 13px`,
      `${BOX}:12 #ff0000`,
      'app/design-system/new.ts:40 red',
    ]);
  });
});
