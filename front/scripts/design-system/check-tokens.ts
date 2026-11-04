import fs from 'fs';
import path from 'path';

export type Output = { file: string; content: string };

/**
 * Compares freshly generated outputs with the files on disk. Returns one
 * problem line per output that is missing or would change; empty means the
 * committed files match the source. Used by `ds:tokens -- --check`.
 */
export const checkOutputs = (outputs: Output[], root: string): string[] => {
  const problems: string[] = [];
  for (const { file, content } of outputs) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) {
      problems.push(`${file} is missing`);
      continue;
    }
    const current = fs.readFileSync(abs, 'utf8');
    if (current !== content) {
      const a = current.split('\n');
      const b = content.split('\n');
      let line = 0;
      while (line < Math.max(a.length, b.length) && a[line] === b[line]) {
        line++;
      }
      problems.push(
        `${file} is out of date (first difference on line ${line + 1})`
      );
    }
  }
  return problems;
};
