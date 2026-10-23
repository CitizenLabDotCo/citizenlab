import { checkMode, normValue, parseArgs } from './mode-check';
import { portals, redesignScope, ScopeGraph } from './mode-scope';

// A tiny graph: file -> [source, imports as `spec` or `spec:Name`].
const graph = (files: Record<string, [string, string[]]>): ScopeGraph => ({
  files: Object.keys(files),
  source: (f) => files[f][0],
  imports: (f) =>
    files[f][1].map((s) => {
      const [spec, name] = s.split(':');
      return {
        spec,
        line: 1,
        dynamic: false,
        typeOnly: false,
        names: name ? [{ local: name, imported: name, typeOnly: false }] : [],
      };
    }),
  resolve: (_from, spec) => (spec in files ? spec : undefined),
});

const base = {
  'app/page/index.tsx': ['', ['app/page/Workspace.tsx', 'app/page/Event.tsx']],
  'app/page/Workspace.tsx': [
    '<ModeScope><Panel /></ModeScope>',
    [
      'app/page/Panel.tsx',
      'app/page/Shared.tsx',
      'app/component-library/Button.tsx',
    ],
  ],
  'app/page/Panel.tsx': ['', ['app/page/Leaf.tsx']],
  'app/page/Leaf.tsx': ['', []],
  'app/page/Event.tsx': ['', ['app/page/Shared.tsx']],
  'app/page/Shared.tsx': ['', ['app/page/SharedLeaf.tsx']],
  'app/page/SharedLeaf.tsx': ['', []],
  'app/component-library/Button.tsx': ['', []],
} as Record<string, [string, string[]]>;

describe('redesignScope', () => {
  it('keeps the root and what only the root renders', () => {
    const s = redesignScope(graph(base));
    expect([...s].sort()).toEqual([
      'app/page/Leaf.tsx',
      'app/page/Panel.tsx',
      'app/page/Workspace.tsx',
    ]);
  });

  it('drops a file an outside importer reaches, and its children', () => {
    const s = redesignScope(graph(base));
    expect(s.has('app/page/Shared.tsx')).toBe(false);
    expect(s.has('app/page/SharedLeaf.tsx')).toBe(false);
    expect(s.has('app/page/Event.tsx')).toBe(false);
  });

  it('never includes library files', () => {
    expect(
      redesignScope(graph(base)).has('app/component-library/Button.tsx')
    ).toBe(false);
  });

  it('ignores tests and stories as importers', () => {
    const g = graph({
      ...base,
      'app/page/Panel.stories.tsx': ['', ['app/page/Panel.tsx']],
      'app/page/Leaf.test.tsx': ['', ['app/page/Leaf.tsx']],
    });
    const s = redesignScope(g);
    expect(s.has('app/page/Panel.tsx')).toBe(true);
    expect(s.has('app/page/Leaf.tsx')).toBe(true);
  });

  it('drops files that portal, and what only they render', () => {
    const g = graph({
      ...base,
      'app/page/Panel.tsx': [
        '',
        ['app/page/Leaf.tsx', 'components/UI/Modal:default'],
      ],
      'app/page/Leaf.tsx': ['createPortal(<div />, document.body)', []],
    });
    const s = redesignScope(g);
    expect(s.has('app/page/Panel.tsx')).toBe(false);
    expect(s.has('app/page/Leaf.tsx')).toBe(false);
    expect(portals(g, 'app/page/Panel.tsx')).toBe(true);
  });

  it('is empty without a ModeScope root', () => {
    const g = graph({
      'app/a.tsx': ['', ['app/b.tsx']],
      'app/b.tsx': ['', []],
    });
    expect(redesignScope(g).size).toBe(0);
  });
});

describe('normValue', () => {
  it('makes equal colours and lengths compare equal', () => {
    expect(normValue('rgb(51, 51, 51)')).toBe(normValue('#333'));
    expect(normValue('rgba(51,51,51,1)')).toBe('#333333');
    expect(normValue('#333333FF')).toBe('#333333');
    expect(normValue('rgba(0, 0, 0, 0.5)')).toBe('#00000080');
    expect(normValue('0px')).toBe('0');
    expect(normValue('8')).toBe('8px');
  });
});

describe('parseArgs', () => {
  const ok = ['--file', 'a', '--token', 't', '--now', '1px'];
  it('rejects unknown flags and modes', () => {
    expect(() => parseArgs([...ok, '--mdoe', 'today'])).toThrow(
      'Unknown argument'
    );
    expect(() => parseArgs([...ok, '--mode', 'bo'])).toThrow('Unknown mode');
    expect(() => parseArgs(['--file', 'a'])).toThrow('Missing --token');
  });
  it('defaults the mode to both', () => {
    expect(parseArgs(ok).mode).toBe('both');
  });
});

describe('checkMode', () => {
  const token = {
    name: '--gv-radius-control',
    values: { today: '3px', redesign: '8px' },
  };
  const run = (inScope: boolean, mode: string, now: string) =>
    checkMode({ file: 'f', token, now, mode, routes: ['admin/x'], inScope }).ok;

  it('outside the scope, needs the today value whatever the mode', () => {
    expect(run(false, 'both', '8px')).toBe(false);
    expect(run(false, 'redesign', '8px')).toBe(false);
    expect(run(false, 'both', '3px')).toBe(true);
  });
  it('inside the scope, only mode redesign may change the look', () => {
    expect(run(true, 'both', '8px')).toBe(true);
    expect(run(true, 'both', '3px')).toBe(false);
    expect(run(true, 'redesign', '3px')).toBe(true);
  });
});

describe('redesignScope on the app', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { SourceTree } = require('./scan/routes');
  const tree = new SourceTree(require('path').resolve(__dirname, '..', '..'));
  const s = redesignScope({
    files: tree.files,
    source: (f) => tree.source(f),
    imports: (f) => tree.importsOf(f),
    resolve: (from, spec) => tree.resolver.resolve(from, spec),
  });
  const p = 'app/containers/Admin/projects/project/';

  it('holds ProjectWorkspace and the phase content it renders', () => {
    expect(s.has(`${p}backofficeRedesign/index.tsx`)).toBe(true);
    expect(s.has(`${p}backofficeRedesign/Phase/ViewContent.tsx`)).toBe(true);
  });

  it('leaves out Event, NewPhase and UnsavedChangesGuard (siblings of the workspace)', () => {
    [
      'Event/DateFieldSegment.tsx',
      'Event/index.tsx',
      'NewPhase/index.tsx',
      'UnsavedChangesGuard.tsx',
    ].forEach((f) => {
      const file = `${p}backofficeRedesign/${f}`;
      expect(tree.files).toContain(file);
      expect(s.has(file)).toBe(false);
    });
  });
});
