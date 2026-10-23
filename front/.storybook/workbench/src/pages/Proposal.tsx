import { useEffect, useMemo, useState } from 'react';

import Canvas from '../components/Canvas';
import Icon, { IconName } from '../components/Icon';
import LineChart, {
  areaLabel,
  LEGEND,
  markerClass,
} from '../components/LineChart';
import { DEFAULT_TOOLBAR } from '../components/Toolbar';
import {
  loadChanges,
  loadScan,
  loadStoryIndex,
  loadSummary,
  loadTrend,
  ScanOutput,
  StoryIndex,
  TOKEN_META,
  TokenMeta,
} from '../lib/data';
import {
  costOf,
  formatNumber,
  healExample,
  migrationOrder,
  seriesOf,
  Trend,
  TrendTotals,
} from '../lib/proposal';

import type { Overrides } from '../lib/overrides';
import type { DesignChanges } from '../lib/review';

import './proposal.css';

// The page for a frontend developer with ten minutes: the problem in
// numbers, the ask in three rings, how it works, a real heal, the review
// flow, where to start, the drift, what developers decide and the cost.
// Every number is read from the build's data files.

type Summary = Partial<Record<keyof TrendTotals | string, number>>;

type Data = {
  summary: Summary | null;
  trend: Trend | null;
  scan: ScanOutput | null;
  changes: Partial<DesignChanges> | null;
  stories: StoryIndex;
};

const NO_OVERRIDES: Overrides = {};
// Quote reads --gv-radius-control, so it changes between the modes; Button
// does not yet, so it is only the fallback.
const SPLIT_STORY = 'components-data-display-quote--default';
const BUTTON_STORY = 'components-actions-button--back-office-primary';
const REVIEW_EXAMPLE = `#/review?route=${encodeURIComponent('admin/projects')}`;

const asTrend = (t: unknown): Trend | null =>
  t && typeof t === 'object' && Array.isArray((t as Trend).points)
    ? (t as Trend)
    : null;

const asSummary = (s: unknown): Summary | null =>
  s && typeof s === 'object' && typeof (s as Summary).offSpec === 'number'
    ? (s as Summary)
    : null;

const useProposalData = (): Data | null => {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    let live = true;
    Promise.all([
      loadSummary(),
      loadTrend(),
      loadScan(),
      loadChanges(),
      loadStoryIndex(),
    ]).then(([summary, trend, scan, changes, stories]) => {
      if (!live) return;
      setData({
        summary: asSummary(summary),
        trend: asTrend(trend),
        scan: scan.components.length ? scan : null,
        changes: changes as Partial<DesignChanges>,
        stories,
      });
    });
    return () => {
      live = false;
    };
  }, []);
  return data;
};

const n = (v: number | undefined) =>
  typeof v === 'number' ? formatNumber(v) : '?';

// ------------------------------------------------------------ the rings

const RINGS: {
  title: string;
  what: string;
  cost: string;
  icon: IconName;
}[] = [
  {
    title: 'A better Storybook',
    what: 'Stories, a scanner and the Review page, kept current by designers with automation.',
    cost: 'Costs you nothing',
    icon: 'components',
  },
  {
    title: 'Design values as CSS variables',
    what: "Today's values, bridged into the theme so nothing moves. A measured map of off-spec values and small heals with the library you have.",
    cost: 'Costs you a review habit',
    icon: 'tokens',
  },
  {
    title: 'A redesign mode',
    what: 'Scoped to the redesigned project pages, where the redesign already lives. The design lead owns that token set; widening it is yours to decide.',
    cost: 'Your call on scope',
    icon: 'pages',
  },
];

const RingArt = () => (
  <svg
    className="wb-prop-rings-art"
    viewBox="0 0 220 220"
    width="220"
    height="220"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="110" cy="110" r="104" fill="var(--wb-info-subtle)" />
    <circle
      cx="110"
      cy="110"
      r="104"
      fill="none"
      stroke="var(--wb-info-line)"
    />
    <circle cx="110" cy="110" r="70" fill="var(--wb-info-soft)" />
    <circle cx="110" cy="110" r="36" fill="var(--wb-accent-fill)" />
    <text x="110" y="117" className="wb-prop-ring-num wb-prop-ring-num-in">
      1
    </text>
    <text x="110" y="64" className="wb-prop-ring-num">
      2
    </text>
    <text x="110" y="30" className="wb-prop-ring-num">
      3
    </text>
  </svg>
);

const Rings = () => (
  <section className="wb-prop-section" aria-labelledby="wb-prop-rings">
    <h2 id="wb-prop-rings" className="wb-section-title">
      The ask, in three rings
    </h2>
    <p className="wb-prop-note">
      Each ring is a yes on its own. The inner one needs nothing from you.
    </p>
    <div className="wb-prop-rings">
      <ol className="wb-prop-ring-list">
        {RINGS.map((r, i) => (
          <li key={r.title} className="wb-prop-ring">
            <span className={`wb-prop-ring-badge wb-prop-ring-badge-${i + 1}`}>
              {i + 1}
            </span>
            <div>
              <h3>
                <Icon name={r.icon} size={18} />
                {r.title}
              </h3>
              <p>{r.what}</p>
              <span className="wb-prop-cost-chip">{r.cost}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

// ------------------------------------------------------------ problem

const Problem = ({ summary }: { summary: Summary | null }) => {
  if (!summary) {
    return (
      <p className="wb-prop-missing" data-testid="wb-prop-no-summary">
        This build has no scan summary, so the numbers are missing.
      </p>
    );
  }
  const pages =
    (summary.pagesRebuilt ?? 0) +
    (summary.pagesPartly ?? 0) +
    (summary.pagesLegacy ?? 0);
  return (
    <section className="wb-prop-problem" aria-label="The problem in numbers">
      <div className="wb-prop-big" data-testid="wb-prop-number">
        <span className="wb-prop-big-value" data-key="legacy">
          {n(summary.legacy)}
        </span>
        <span className="wb-prop-big-label">
          places read the old theme (<code>theme</code>, <code>colors</code>,{' '}
          <code>bo</code>)
        </span>
      </div>
      <div className="wb-prop-big" data-testid="wb-prop-number">
        <span className="wb-prop-big-value" data-key="offSpec">
          {n(summary.offSpec)}
        </span>
        <span className="wb-prop-big-label">
          fixed values off the spec (px, hex, rgba, spacing)
        </span>
      </div>
      <ul className="wb-prop-small">
        <li>
          <strong>{n(summary.tokenReads)}</strong> token reads so far
        </li>
        <li>
          <strong>
            {n(summary.onTokens)} of {n(summary.components)}
          </strong>{' '}
          components on tokens
        </li>
        <li>
          <strong>
            {n(summary.pagesRebuilt)} of {formatNumber(pages)}
          </strong>{' '}
          pages fully on the library
        </li>
      </ul>
    </section>
  );
};

// ------------------------------------------------------------ mechanism

const STEPS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'file',
    title: 'One source',
    text: 'tokens.source.json generates the CSS, the TypeScript API and the docs.',
  },
  {
    icon: 'tokens',
    title: 'Two tiers',
    text: 'Primitives (--gv-blue-500) under roles (--gv-primary). Code reads roles.',
  },
  {
    icon: 'split',
    title: 'Two modes',
    text: ':root is today. [data-gv-mode="redesign"] swaps the values below it.',
  },
  {
    icon: 'link',
    title: 'Theme bridge',
    text: "The variables start at today's theme values, so nothing changes on screen.",
  },
  {
    icon: 'checklist',
    title: 'Lint',
    text: 'ds:lint fails on new raw values in the component library and design-system folders. It runs in ds:check, not in CI yet.',
  },
];

const Mechanism = () => (
  <section className="wb-prop-section" aria-labelledby="wb-prop-how">
    <h2 id="wb-prop-how" className="wb-section-title">
      How it works
    </h2>
    <ol className="wb-prop-flow">
      {STEPS.map((s) => (
        <li key={s.title}>
          <span className="wb-prop-flow-icon">
            <Icon name={s.icon} size={20} />
          </span>
          <strong>{s.title}</strong>
          <span>{s.text}</span>
        </li>
      ))}
    </ol>
  </section>
);

// Tokens whose value differs between the modes, each with a small picture:
// a corner, a swatch or a type size.
const MODE_TOKENS = [
  '--gv-radius-control',
  '--gv-radius-panel',
  '--gv-tenant-primary',
  '--gv-text-heading',
  '--gv-fs-xxxxl',
];

const TokenPicture = ({ name, value }: { name: string; value: string }) => {
  if (name.startsWith('--gv-radius')) {
    return (
      <span
        className="wb-prop-pic wb-prop-pic-radius"
        style={{ borderTopLeftRadius: value }}
      />
    );
  }
  if (name.startsWith('--gv-fs')) {
    return (
      <span
        className="wb-prop-pic wb-prop-pic-type"
        style={{ fontSize: value }}
      >
        Aa
      </span>
    );
  }
  return (
    <span
      className="wb-prop-pic wb-prop-pic-swatch"
      style={{ background: value }}
    />
  );
};

const ModeTokens = () => {
  const rows = MODE_TOKENS.map((name) =>
    TOKEN_META.find((t) => t.name === name)
  ).filter((t): t is TokenMeta => !!t && t.values.today !== t.values.redesign);
  if (rows.length === 0) return null;
  return (
    <ul className="wb-prop-modes" data-testid="wb-prop-modes">
      {rows.map((t) => (
        <li key={t.name}>
          <code>{t.name}</code>
          <span className="wb-prop-mode-pair">
            <span className="wb-prop-mode-side">
              <TokenPicture name={t.name} value={t.values.today} />
              <span>{t.values.today}</span>
            </span>
            <Icon name="arrow" size={16} />
            <span className="wb-prop-mode-side wb-prop-mode-new">
              <TokenPicture name={t.name} value={t.values.redesign} />
              <span>{t.values.redesign}</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
};

const ModeSplit = ({ storyId }: { storyId: string | null }) => (
  <section className="wb-prop-section" aria-labelledby="wb-prop-modes">
    <h2 id="wb-prop-modes" className="wb-section-title">
      Two modes
    </h2>
    <p className="wb-prop-note">
      A page opts in with <code>data-gv-mode=&quot;redesign&quot;</code>. Below
      it these values change; everything else stays as today.
    </p>
    <ModeTokens />
    <h3 className="wb-prop-subtitle">Quote, live in both modes</h3>
    <p className="wb-prop-note">
      Quote reads <code>--gv-radius-control</code>: 3px corners today, 8px in
      redesign. Button still reads <code>bo.borderRadius</code>, so it looks the
      same in both until it is healed.
    </p>
    {storyId ? (
      <div className="wb-prop-split" data-testid="wb-prop-split">
        {(['today', 'redesign'] as const).map((mode) => (
          <div key={mode} className="wb-prop-split-side">
            <Canvas
              storyId={storyId}
              toolbar={{ ...DEFAULT_TOOLBAR, mode }}
              overrides={NO_OVERRIDES}
              label={mode === 'today' ? 'Today' : 'Redesign'}
            />
          </div>
        ))}
      </div>
    ) : (
      <p className="wb-prop-missing">No Quote or Button story in this build.</p>
    )}
  </section>
);

// ------------------------------------------------------------ the heal

const HealSection = ({
  trend,
  repoUrl,
}: {
  trend: Trend | null;
  repoUrl?: string;
}) => {
  const point = healExample(trend);
  if (!point) return null;
  const { heal } = point;
  const title = point.subject
    .replace(/^design-system\([^)]*\):\s*/, '')
    .replace(/\s*\[AI-assisted\]$/, '');
  const file = heal.file.split('/').slice(-2).join('/');
  const zero = heal.diffs && heal.diffs.today + heal.diffs.redesign === 0;
  return (
    <section className="wb-prop-section" aria-labelledby="wb-prop-heal">
      <h2 id="wb-prop-heal" className="wb-section-title">
        What a heal looks like
      </h2>
      <div className="wb-prop-heal" data-testid="wb-prop-heal">
        <div className="wb-prop-heal-code">
          <p className="wb-prop-heal-title">
            <Icon name="heal" size={18} />
            {title}
          </p>
          <p className="wb-muted wb-prop-heal-file">
            <code>{file}</code>
          </p>
          <pre className="wb-prop-diff">
            {heal.removed.map((l) => (
              <span key={`-${l}`} className="wb-prop-diff-del">
                {`- ${l.trim()}`}
              </span>
            ))}
            {heal.added.map((l) => (
              <span key={`+${l}`} className="wb-prop-diff-add">
                {`+ ${l.trim()}`}
              </span>
            ))}
          </pre>
        </div>
        <div className="wb-prop-heal-side">
          <ul className="wb-prop-heal-facts">
            {heal.score && (
              <li>
                <span className="wb-prop-fact-value">
                  {heal.score.from.toFixed(2)} to {heal.score.to.toFixed(2)}
                </span>
                <span>tokens score of the component</span>
              </li>
            )}
            {heal.diffs && (
              <li>
                <span
                  className={
                    zero
                      ? 'wb-prop-fact-value wb-prop-fact-pass'
                      : 'wb-prop-fact-value'
                  }
                >
                  {zero && <Icon name="check" size={16} />}
                  {heal.diffs.today + heal.diffs.redesign} pixels
                </span>
                <span>changed, in both modes</span>
              </li>
            )}
          </ul>
          <div className="wb-prop-heal-links">
            {repoUrl && (
              <a
                className="wb-button"
                href={`${repoUrl}/commit/${point.sha}`}
                target="_blank"
                rel="noreferrer"
              >
                The commit on GitHub
                <Icon name="external" size={16} />
              </a>
            )}
            {heal.shots &&
              (['before', 'after'] as const).map((when) => (
                <a
                  key={when}
                  className="wb-button"
                  href={`../${heal.shots}/${when}-redesign.png`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="split" size={16} />
                  {when === 'before' ? 'Before' : 'After'}, redesign
                </a>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ------------------------------------------------------------ review flow

const FLOW: { icon: IconName; text: string }[] = [
  { icon: 'edit', text: 'A designer heals a value or edits a token' },
  { icon: 'search', text: 'The scanner and the visual compare check it' },
  { icon: 'review', text: 'The Review page shows the routes it touches' },
  { icon: 'check', text: 'You review a small PR, like any other' },
];

const ReviewFlow = () => (
  <section className="wb-prop-section" aria-labelledby="wb-prop-review">
    <h2 id="wb-prop-review" className="wb-section-title">
      The review flow
    </h2>
    <div className="wb-prop-review">
      <ol className="wb-prop-steps">
        {FLOW.map((s, i) => (
          <li key={s.text}>
            <span className="wb-prop-step-icon">
              <Icon name={s.icon} size={20} />
            </span>
            <span className="wb-prop-step-num">{i + 1}</span>
            <span>{s.text}</span>
          </li>
        ))}
      </ol>
      <a className="wb-button wb-button-primary" href={REVIEW_EXAMPLE}>
        Open a Review example
        <Icon name="arrow" size={16} />
      </a>
    </div>
  </section>
);

// ------------------------------------------------------------ migration

const storyLinks = (index: StoryIndex) => {
  const links = new Map<string, string>();
  Object.values(index.entries).forEach((e) => {
    if (e.type === 'docs' || !e.title.startsWith('Components/')) return;
    const name = e.title.split('/').pop() ?? '';
    if (!links.has(name)) links.set(name, e.id);
  });
  return links;
};

const Migration = ({
  scan,
  stories,
}: {
  scan: ScanOutput | null;
  stories: StoryIndex;
}) => {
  const rows = useMemo(
    () => (scan ? migrationOrder(scan.components) : []),
    [scan]
  );
  const links = useMemo(() => storyLinks(stories), [stories]);
  const max = rows[0]?.weight ?? 1;
  return (
    <section className="wb-prop-section" aria-labelledby="wb-prop-order">
      <h2 id="wb-prop-order" className="wb-section-title">
        Where to start
      </h2>
      <p className="wb-prop-note">
        The scanner&apos;s order: how often a component is used, times its
        off-spec values. Heal the top of the list and most screens improve.
      </p>
      {rows.length === 0 ? (
        <p className="wb-prop-missing">
          This build has no full scan (design-scan.json), so no order.
        </p>
      ) : (
        <ol className="wb-prop-bars" data-testid="wb-prop-order">
          {rows.map((r, i) => {
            const id = links.get(r.component);
            return (
              <li key={`${r.component}-${r.file}`} className="wb-prop-bar">
                <span className="wb-prop-bar-rank">{i + 1}</span>
                <span className="wb-prop-bar-name">
                  {id ? (
                    <a href={`#/components/${encodeURIComponent(id)}`}>
                      {r.component}
                    </a>
                  ) : (
                    r.component
                  )}
                </span>
                <span className="wb-prop-bar-track" aria-hidden="true">
                  <span
                    className="wb-prop-bar-fill"
                    style={{ width: `${Math.max(1, (r.weight / max) * 100)}%` }}
                  />
                </span>
                <span className="wb-prop-bar-math">
                  {formatNumber(r.usage)} uses x {formatNumber(r.offSpec)}{' '}
                  off-spec
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

// ------------------------------------------------------------ trend

const Drift = ({
  trend,
  summary,
}: {
  trend: Trend | null;
  summary: Summary | null;
}) => {
  const off = useMemo(
    () => seriesOf(trend, summary, 'offSpec'),
    [trend, summary]
  );
  const reads = useMemo(
    () => seriesOf(trend, summary, 'tokenReads'),
    [trend, summary]
  );
  return (
    <section className="wb-prop-section" aria-labelledby="wb-prop-drift">
      <h2 id="wb-prop-drift" className="wb-section-title">
        Drift, commit by commit
      </h2>
      <p className="wb-prop-note">
        Each dot is a commit that refreshed the scan. The early jump is the
        scanner learning to count more, not new debt, so the change on top
        counts from the last scanner change.
      </p>
      {off.length === 0 ? (
        <p className="wb-prop-missing">This build has no trend.json.</p>
      ) : (
        <>
          <ul className="wb-prop-legend" aria-label="Legend">
            {LEGEND.map(({ area, label }) => (
              <li key={area}>
                <svg width="12" height="12" aria-hidden="true">
                  <circle className={markerClass(area)} cx="6" cy="6" r="4.5" />
                </svg>
                {label}
              </li>
            ))}
          </ul>
          <div className="wb-prop-charts">
            <LineChart
              title="Off-spec values"
              points={off}
              testId="wb-prop-chart"
            />
            <LineChart
              title="Token reads"
              points={reads}
              testId="wb-prop-chart"
            />
          </div>
          <details className="wb-prop-table">
            <summary>Show as a table</summary>
            <div className="wb-table-wrap">
              <table className="wb-table">
                <thead>
                  <tr>
                    <th scope="col">Commit</th>
                    <th scope="col">Kind</th>
                    <th scope="col">Off-spec</th>
                    <th scope="col">Token reads</th>
                  </tr>
                </thead>
                <tbody>
                  {off.map((p, i) => (
                    <tr key={`${p.sha}-${i}`}>
                      <td>
                        <code>{p.sha ? p.sha.slice(0, 7) : 'build'}</code>
                      </td>
                      <td>{areaLabel(p.area)}</td>
                      <td>{formatNumber(p.value)}</td>
                      <td>{formatNumber(reads[i]?.value ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
};

// ------------------------------------------------------------ decisions

const DECISIONS: { q: string; a: string }[] = [
  {
    q: 'Adopt the variables?',
    a: 'New code reads t.* or var(--gv-*) instead of theme, colors and px.',
  },
  {
    q: 'Put the mode attribute on admin routes?',
    a: 'data-gv-mode="redesign" on the redesigned project pages first, more when you say so.',
  },
  {
    q: 'When does the lint run in CI, and over which folders next?',
    a: 'Add it to CI next to the tests, then widen it one folder at a time, the redesigned project pages first.',
  },
  {
    q: 'Who reviews the design heals?',
    a: 'One frontend owner per area, a few minutes per heal.',
  },
];

const Decisions = () => (
  <section className="wb-prop-section" aria-labelledby="wb-prop-decide">
    <h2 id="wb-prop-decide" className="wb-section-title">
      What you decide
    </h2>
    <ul className="wb-prop-decisions">
      {DECISIONS.map((d) => (
        <li key={d.q}>
          <span className="wb-prop-decision-icon">
            <Icon name="question" size={20} />
          </span>
          <strong>{d.q}</strong>
          <span>
            <span className="wb-prop-suggest">Suggested</span> {d.a}
          </span>
        </li>
      ))}
    </ul>
  </section>
);

// ------------------------------------------------------------ cost

const MANUAL = [
  'Reviewing each heal PR',
  'Choosing the redesign values (the design lead)',
  'Accessibility checks a person has to do',
];

const Cost = ({ changes }: { changes: Partial<DesignChanges> | null }) => {
  const cost = costOf(changes);
  return (
    <section className="wb-prop-section" aria-labelledby="wb-prop-cost">
      <h2 id="wb-prop-cost" className="wb-section-title">
        What it costs
      </h2>
      <div className="wb-prop-cost">
        <div className="wb-prop-cost-tile" data-testid="wb-prop-number">
          <span className="wb-prop-cost-value">
            {formatNumber(cost.commits)}
          </span>
          <span>commits on the branch so far</span>
          <span className="wb-muted">
            {cost.stories} stories, {cost.heals} heals, {cost.lifts} lifts,{' '}
            {cost.tokens} token commits
          </span>
        </div>
        <div className="wb-prop-cost-tile">
          <span className="wb-prop-cost-value wb-prop-cost-tbd">
            To be measured
          </span>
          <span>review minutes per heal</span>
          <span className="wb-muted">Timed on the first real heal PRs</span>
        </div>
        <div className="wb-prop-cost-tile">
          <span className="wb-prop-cost-head">Stays manual</span>
          <ul className="wb-checklist">
            {MANUAL.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

// ------------------------------------------------------------ page

const splitStory = (index: StoryIndex): string | null => {
  const ids = Object.keys(index.entries);
  if (ids.includes(SPLIT_STORY)) return SPLIT_STORY;
  if (ids.includes(BUTTON_STORY)) return BUTTON_STORY;
  return ids.find((id) => /^components-([a-z0-9]+-)*button--/.test(id)) ?? null;
};

const Proposal = () => {
  const data = useProposalData();
  return (
    <article className="wb-page wb-page-wide wb-prop" data-testid="wb-proposal">
      <section className="wb-hero wb-prop-hero">
        <div className="wb-hero-text">
          <p className="wb-eyebrow">For developers, ten minutes</p>
          <h1>Proposal</h1>
          <p className="wb-lead">
            Design values in code, measured, and healed in small reviewed steps.
            Nothing changes on screen until a page asks for the redesign.
          </p>
          <div className="wb-hero-actions">
            <a className="wb-button wb-button-primary" href={REVIEW_EXAMPLE}>
              See a review
              <Icon name="arrow" size={16} />
            </a>
            <a className="wb-button" href="#/components">
              Browse components
            </a>
          </div>
        </div>
        <RingArt />
      </section>

      {data === null ? (
        <div className="wb-prop-loading" aria-busy="true">
          <div className="wb-skeleton-block" />
          <div className="wb-skeleton-block" />
        </div>
      ) : (
        <>
          <Problem summary={data.summary} />
          <Rings />
          <Mechanism />
          <ModeSplit storyId={splitStory(data.stories)} />
          <HealSection trend={data.trend} repoUrl={data.changes?.repoUrl} />
          <ReviewFlow />
          <Migration scan={data.scan} stories={data.stories} />
          <Drift trend={data.trend} summary={data.summary} />
          <Decisions />
          <Cost changes={data.changes} />
        </>
      )}
    </article>
  );
};

export default Proposal;
