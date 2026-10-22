import type { Finding } from './data';
import { formatHealTask, healToken, MAX_TASK_ROUTES } from './healTask';

const finding = (partial: Partial<Finding>): Finding => ({
  file: 'app/component-library/components/Button/index.tsx',
  line: 74,
  col: 15,
  raw: '16px',
  category: 'px',
  suggestion: { token: '--gv-space-4', distance: 0 },
  confidence: 'high',
  component: 'BO_GEOMETRY',
  ...partial,
});

describe('formatHealTask', () => {
  it('writes the three lines of the heal task format', () => {
    expect(
      formatHealTask(
        finding({}),
        'Button',
        'components-actions-button--default',
        ['admin', 'admin/projects/$projectId', ''],
        'both'
      )
    ).toBe(
      [
        'heal: Button · app/component-library/components/Button/index.tsx:74 · 16px → --gv-space-4 · mode both',
        'why: px, scan confidence high',
        'check: story components-actions-button--default, routes /admin, /admin/projects/$projectId, /',
      ].join('\n')
    );
  });

  it('names the token a legacy read maps to', () => {
    const task = formatHealTask(
      finding({
        line: 169,
        raw: 'colors.textSecondary',
        category: 'legacy-colors',
        suggestion: undefined,
      }),
      'Button',
      'components-actions-button--default',
      ['admin'],
      'redesign'
    );
    expect(task.split('\n')[0]).toBe(
      'heal: Button · app/component-library/components/Button/index.tsx:169 · colors.textSecondary → --gv-text-secondary · mode redesign'
    );
    expect(task.split('\n')[1]).toBe(
      'why: legacy-colors, scan confidence high'
    );
  });

  it('flattens a value written over several lines', () => {
    const task = formatHealTask(
      finding({ raw: 'props.theme\n    .colors.textSecondary' }),
      'Button',
      'b--default',
      [],
      'today'
    );
    expect(task.split('\n')[0]).toContain(
      '· props.theme.colors.textSecondary →'
    );
  });

  it('says when no token fits and when no route renders the component', () => {
    const task = formatHealTask(
      finding({ raw: '13px', suggestion: undefined, confidence: 'low' }),
      'Button',
      'b--default',
      [],
      'today'
    );
    expect(task).toBe(
      [
        'heal: Button · app/component-library/components/Button/index.tsx:74 · 13px → (choose a token) · mode today',
        'why: px, scan confidence low',
        'check: story b--default, routes none',
      ].join('\n')
    );
  });

  it('lists the first routes and counts the rest', () => {
    const routes = Array.from({ length: MAX_TASK_ROUTES + 3 }, (_, i) =>
      String.fromCharCode(97 + i)
    );
    const line = formatHealTask(finding({}), 'Button', 's', routes, 'both')
      .split('\n')
      .pop();
    expect(line).toBe(
      `check: story s, routes ${routes
        .slice(0, MAX_TASK_ROUTES)
        .map((r) => `/${r}`)
        .join(', ')} and 3 more`
    );
  });
});

describe('healToken', () => {
  it('reads the token from the suggestion, the legacy name or nothing', () => {
    expect(healToken(finding({}))).toEqual(['--gv-space-4']);
    expect(
      healToken(
        finding({
          raw: 'bo.borderRadius',
          category: 'legacy-bo',
          suggestion: undefined,
        })
      )
    ).toEqual(['--gv-radius-control']);
    expect(
      healToken(
        finding({
          raw: 'props.theme.colors',
          category: 'legacy-theme',
          suggestion: undefined,
        })
      )
    ).toEqual([]);
  });
});
