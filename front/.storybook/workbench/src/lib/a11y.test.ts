import button from '../../../../app/component-library/components/Button/a11y.json';

import {
  A11yResults,
  axeSummary,
  axeTitle,
  Checklist,
  checklistCounts,
  checklistOf,
  checklistsByDir,
  formatDate,
  keyboardStatus,
  reviewedLine,
  sortCriteria,
  StoryResult,
} from './a11y';

const story = (over: Partial<StoryResult> = {}): StoryResult => ({
  title: 'Components/Actions/Button',
  checkedAt: '2026-10-23T05:00:00.000Z',
  violations: [],
  passes: 20,
  incomplete: 0,
  focusable: 1,
  ...over,
});

const results = (stories: Record<string, StoryResult>): A11yResults => ({
  generatedAt: '2026-10-23T05:00:00.000Z',
  axe: '4.10.2',
  tags: [],
  stories,
});

const ref = (id: string, exportName = 'Default') => ({
  id,
  name: exportName,
  exportName,
  state: true,
});

const critical = {
  id: 'label',
  impact: 'critical' as const,
  nodes: 1,
  help: 'Form elements must have labels',
};

describe('reviewedLine', () => {
  it('uses the SPEC wording with counts and the date', () => {
    const c: Checklist = {
      component: 'X',
      reviewedAt: '2026-10-23',
      reviewer: 'agent',
      criteria: [
        ...Array.from({ length: 7 }, (_, i) => ({
          id: `1.${i}`,
          name: 'n',
          result: 'pass' as const,
          confidence: 'high' as const,
          evidence: '',
          note: '',
        })),
        {
          id: '2.1',
          name: 'n',
          result: 'fail',
          confidence: 'high',
          evidence: '',
          note: '',
        },
        {
          id: '2.2',
          name: 'n',
          result: 'needs-human',
          confidence: 'low',
          evidence: '',
          note: '',
        },
      ],
    };
    expect(reviewedLine(c)).toBe(
      'Reviewed by agent on 23 Oct 2026, 7 pass, 1 fail, 1 needs a person'
    );
  });

  it('reads the committed Button checklist', () => {
    const c = button as Checklist;
    const n = checklistCounts(c);
    expect(n.pass + n.fail + n['needs-human'] + n['n/a']).toBe(
      c.criteria.length
    );
    expect(reviewedLine(c)).toMatch(
      /^Reviewed by agent on \d+ \w+ \d{4}, \d+ pass, \d+ fail, \d+ needs? a person$/
    );
    expect(reviewedLine(c)).not.toMatch(/complian|certif|conform/i);
  });

  it('is null for a stub', () => {
    expect(
      reviewedLine({
        component: 'X',
        reviewedAt: null,
        reviewer: 'agent',
        criteria: [],
      })
    ).toBeNull();
  });
});

describe('formatDate and sortCriteria', () => {
  it('formats without the locale', () => {
    expect(formatDate('2026-01-05T23:59:00Z')).toBe('5 Jan 2026');
    expect(formatDate('soon')).toBe('soon');
  });

  it('puts fails first, then by criterion number', () => {
    const row = (id: string, result: Checklist['criteria'][0]['result']) => ({
      id,
      name: '',
      result,
      confidence: 'high' as const,
      evidence: '',
      note: '',
    });
    expect(
      sortCriteria([
        row('2.4.11', 'pass'),
        row('2.4.7', 'pass'),
        row('4.1.2', 'fail'),
        row('1.4.3', 'needs-human'),
      ]).map((r) => r.id)
    ).toEqual(['4.1.2', '1.4.3', '2.4.7', '2.4.11']);
  });
});

describe('checklists', () => {
  it('keys glob modules by the component directory', () => {
    const map = checklistsByDir({
      '../../../../app/component-library/components/Button/a11y.json': button,
      '../../../../app/component-library/components/Bad/a11y.json': { x: 1 },
    });
    expect(Object.keys(map)).toEqual([
      'app/component-library/components/Button',
    ]);
    expect(
      checklistOf(map, {
        file: 'app/component-library/components/Button/index.tsx',
      })?.component
    ).toBe('Button');
    expect(checklistOf(map, { file: undefined })).toBeNull();
  });
});

describe('axeSummary', () => {
  it('counts stories per impact and rules across stories', () => {
    const r = results({
      a: story({ violations: [critical] }),
      b: story({
        violations: [
          critical,
          { id: 'color-contrast', impact: 'serious', nodes: 2, help: 'C' },
        ],
        checkedAt: '2026-10-24T00:00:00.000Z',
      }),
      c: story({ error: 'boom' }),
    });
    const s = axeSummary(r, {
      stories: [ref('a'), ref('b'), ref('c'), ref('d')],
    });
    expect(s).toMatchObject({
      checked: 2,
      stories: 4,
      errors: 1,
      worst: 'critical',
      byImpact: { critical: 2, serious: 1, moderate: 0, minor: 0 },
      checkedAt: '2026-10-24T00:00:00.000Z',
    });
    expect(s.rules.map((x) => [x.id, x.stories])).toEqual([
      ['label', 2],
      ['color-contrast', 1],
    ]);
    expect(axeTitle(s)).toBe(
      'Checked by axe: 2 of 4 stories, 2 with critical, 1 with serious violations'
    );
  });

  it('says when nothing ran', () => {
    expect(axeTitle(axeSummary(null, { stories: [ref('a')] }))).toBe(
      'Not checked by axe yet'
    );
  });
});

describe('keyboardStatus', () => {
  const stories = [ref('d'), ref('k', 'Keyboard')];

  it('is tested only when the Keyboard story played and passed', () => {
    expect(
      keyboardStatus(results({ d: story(), k: story({ play: 'passed' }) }), {
        stories,
      })
    ).toBe('tested');
    expect(
      keyboardStatus(results({ d: story(), k: story({ play: 'failed' }) }), {
        stories,
      })
    ).toBe('failing');
  });

  it('is untested for a focusable component with no Keyboard story', () => {
    expect(
      keyboardStatus(results({ d: story() }), { stories: [ref('d')] })
    ).toBe('untested');
  });

  it('has no badge when there is nothing to tab to, or no results', () => {
    expect(
      keyboardStatus(results({ d: story({ focusable: 0 }) }), {
        stories: [ref('d')],
      })
    ).toBe('none');
    expect(keyboardStatus(null, { stories })).toBe('unknown');
  });
});
