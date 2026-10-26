import type { Finding } from './data';

// How much a scan finding needs fixing, for Inspect's off-spec badges.
// Strong: a value no token equals, or local markup where the library has
// a component. Faint: a value typed by hand that equals a token, or a read
// of the old theme. Other categories (a token read) are not marked.
export type Level = 'strong' | 'faint';

const VALUE = new Set<Finding['category']>([
  'px',
  'layout-spacing',
  'hex',
  'rgba',
  'named-color',
]);

export const levelOf = (f: Finding): Level | null => {
  if (f.category === 'styled-block' || f.category === 'duplicate-candidate') {
    return 'strong';
  }
  if (VALUE.has(f.category)) {
    return f.suggestion?.distance === 0 ? 'faint' : 'strong';
  }
  if (f.category.startsWith('legacy-')) return 'faint';
  return null;
};

export type Marked = Finding & { level: Level };

export type FileMarks = {
  // Strong first, then by line.
  findings: Marked[];
  strong: number;
  faint: number;
};

export const marksByFile = (findings: Finding[]): Map<string, FileMarks> => {
  const out = new Map<string, FileMarks>();
  for (const f of findings) {
    const level = levelOf(f);
    if (!level) continue;
    const m = out.get(f.file) ?? { findings: [], strong: 0, faint: 0 };
    m.findings.push({ ...f, level });
    m[level] += 1;
    out.set(f.file, m);
  }
  for (const m of out.values()) {
    m.findings.sort(
      (a, b) =>
        Number(a.level === 'faint') - Number(b.level === 'faint') ||
        a.line - b.line
    );
  }
  return out;
};

// A component's badge: strong when its file has a strong finding, faint
// when it has only faint ones or no story in the workbench, none otherwise.
export const badgeLevel = (
  marks: FileMarks | undefined,
  hasStory: boolean
): Level | null =>
  marks?.strong ? 'strong' : marks?.faint || !hasStory ? 'faint' : null;
