import { pageStatus, redesignScopeStandIn, scoreComponent } from './score';
import { ComponentUsage, Finding, FindingCategory } from './schema';

const f = (category: FindingCategory, n: number, file = 'a.tsx'): Finding[] =>
  Array.from({ length: n }, (_, i) => ({
    file,
    line: i + 1,
    col: 1,
    raw: 'x',
    category,
    confidence: 'high' as const,
  }));

const use = (component: string, file = 'page.tsx'): ComponentUsage => ({
  component,
  file,
  line: 1,
  props: [],
});

describe('scoreComponent', () => {
  it('is on-tokens at >= 0.9', () => {
    // 9 / (9 + 0.5*2 + 0) = 0.9
    const s = scoreComponent(
      [...f('token-var', 9), ...f('legacy-colors', 2)],
      [use('Box'), use('Box', 'other.tsx')],
      ['admin', '']
    );
    expect(s.score).toBe(0.9);
    expect(s.status).toBe('on-tokens');
    expect(s.usageCount).toBe(2);
    expect(s.routes).toEqual(['', 'admin']);
    expect(s.component).toBe('Box');
    expect(s.counts['token-var']).toBe(9);
    expect(s.counts.px).toBe(0);
  });

  it('is partly at >= 0.4', () => {
    // 4 / (4 + 0.5*4 + 4) = 0.4
    const s = scoreComponent(
      [
        ...f('token-var', 4),
        ...f('legacy-theme', 4),
        ...f('px', 2),
        ...f('hex', 2),
      ],
      [use('Button')],
      []
    );
    expect(s.score).toBe(0.4);
    expect(s.status).toBe('partly');
  });

  it('is off-tokens below 0.4; styled blocks do not count', () => {
    // 1 / (1 + 0.5*2 + 3) = 0.2
    const s = scoreComponent(
      [
        ...f('token-var', 1),
        ...f('legacy-bo', 2),
        ...f('layout-spacing', 2),
        ...f('rgba', 1),
        ...f('styled-block', 5),
      ],
      [],
      [],
      {
        component: 'Badge',
        file: 'app/component-library/components/Badge/index.tsx',
      }
    );
    expect(s.score).toBe(0.2);
    expect(s.status).toBe('off-tokens');
    expect(s.component).toBe('Badge');
    expect(s.file).toBe('app/component-library/components/Badge/index.tsx');
  });

  it('scores 1 when there is nothing to read', () => {
    const s = scoreComponent([], [], [], {
      component: 'Divider',
      file: 'd.tsx',
    });
    expect(s.score).toBe(1);
    expect(s.status).toBe('on-tokens');
  });
});

describe('pageStatus', () => {
  const route = { path: 'admin/x', office: 'admin' as const };

  it('is legacy when the page uses no library pieces', () => {
    const p = pageStatus(route, f('px', 3), [], new Set(['Box']));
    expect(p).toEqual({
      path: 'admin/x',
      office: 'admin',
      status: 'legacy',
      libraryPieces: 0,
      localPieces: 0,
      offSpec: 3,
    });
  });

  it('is rebuilt when every piece is an in-scope library component and nothing is off-spec', () => {
    const p = pageStatus(
      route,
      [...f('token-var', 4), ...f('legacy-colors', 1)],
      [use('Box'), use('Button')],
      new Set(['Box', 'Button'])
    );
    expect(p.status).toBe('rebuilt');
    expect(p.libraryPieces).toBe(2);
  });

  it('is partly with an off-spec value, a local styled piece or an out-of-scope component', () => {
    const scope = new Set(['Box', 'Button']);
    expect(pageStatus(route, f('hex', 1), [use('Box')], scope).status).toBe(
      'partly'
    );
    const local = pageStatus(route, f('styled-block', 2), [use('Box')], scope);
    expect(local.status).toBe('partly');
    expect(local.localPieces).toBe(2);
    expect(pageStatus(route, [], [use('Select')], scope).status).toBe('partly');
  });
});

describe('redesignScopeStandIn', () => {
  it('takes on-tokens components with at least one token read, not ones with no reads', () => {
    const read = scoreComponent(f('token-var', 3), [], [], {
      component: 'Box',
      file: 'b.tsx',
    });
    const empty = scoreComponent([], [], [], {
      component: 'Divider',
      file: 'd.tsx',
    });
    const off = scoreComponent(f('px', 3), [], [], {
      component: 'Badge',
      file: 'a.tsx',
    });
    expect(empty.status).toBe('on-tokens');
    expect([...redesignScopeStandIn([read, empty, off])]).toEqual(['Box']);
  });
});
