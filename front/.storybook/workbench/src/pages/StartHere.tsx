import { ReactNode, useEffect, useState } from 'react';

import a11yKnown from '../../../../scripts/design-system/a11y-known.json';
import Icon, { IconName } from '../components/Icon';
import { formatDate, needsHumanRows } from '../lib/a11y';
import { CHECKLISTS } from '../lib/checklists';
import { loadAll, missing, StoryEntry } from '../lib/data';

import './starthere.css';

// The first page: what this is, a tour of the pages, the first heal step by
// step, the rules, accessibility thresholds and what needs a person, how to
// run it on a Mac, how to refresh the data, where files live, what the
// preview can show, and which data files this build lacks.

type BuildData = {
  stories: number;
  tokens: number;
  missing: string[];
  // Component name to its first story, for the needs-a-person links.
  storyOf: Record<string, string>;
};

// The first story of each Components/... title, Default first. index.json
// may be valid JSON of another shape, so every field is optional here.
type LooseIndex = { entries?: Record<string, Partial<StoryEntry> | null> };

const storiesByComponent = (
  index: LooseIndex | null
): Record<string, string> => {
  const out: Record<string, string> = {};
  Object.values(index?.entries ?? {}).forEach((e) => {
    if (!e?.id || !e.title || e.type === 'docs') return;
    if (!e.title.startsWith('Components/')) return;
    const name = e.title.split('/').pop() as string;
    if (!(name in out) || e.exportName === 'Default') out[name] = e.id;
  });
  return out;
};

const useBuildData = (): BuildData | null => {
  const [state, setState] = useState<BuildData | null>(null);
  useEffect(() => {
    let live = true;
    loadAll()
      .then(([, tokens, raw]) => {
        if (!live) return;
        // index.json may be valid JSON of another shape: count what is there.
        const index = raw as LooseIndex | null;
        const stories = Object.values(index?.entries ?? {}).filter(
          (e) => e?.type !== 'docs'
        ).length;
        setState({
          stories,
          tokens: tokens.length,
          missing: [...missing],
          storyOf: storiesByComponent(index),
        });
      })
      .catch(() => {
        if (!live) return;
        setState({
          stories: 0,
          tokens: 0,
          missing: [...missing, 'index.json (unreadable)'],
          storyOf: {},
        });
      });
    return () => {
      live = false;
    };
  }, []);
  return state;
};

// ------------------------------------------------------------ copy

const FIVE_LINES = [
  'The design values of the platform as named tokens, in code.',
  'Library components in their states, built on those tokens.',
  'A scanner that counts where the code skips the tokens.',
  'A Review page that shows the real platform before and after.',
  'Skills that let Claude Code heal the code, one small commit at a time.',
];

type TourPage = {
  name: IconName;
  label: string;
  hash: string;
  text: string;
  art: ReactNode;
};

const TOUR: TourPage[] = [
  {
    name: 'foundations',
    label: 'Foundations',
    hash: '#/foundations',
    text: 'Every token by category, today and redesign side by side. Edit one live and share the link.',
    art: <FoundationsArt />,
  },
  {
    name: 'components',
    label: 'Components',
    hash: '#/components',
    text: 'Library components with their score and accessibility badges. Open one for its states and panels.',
    art: <ComponentsArt />,
  },
  {
    name: 'patterns',
    label: 'Patterns',
    hash: '#/patterns',
    text: 'Components put together: form rows, filter bars, tables with a toolbar.',
    art: <PatternsArt />,
  },
  {
    name: 'pages',
    label: 'Pages',
    hash: '#/pages',
    text: 'The redesigned admin pages, as their pieces move into the library.',
    art: <PagesArt />,
  },
  {
    name: 'review',
    label: 'Review',
    hash: '#/review',
    text: 'The real platform before and after, desktop and mobile. A pull request links here.',
    art: <ReviewArt />,
  },
  {
    name: 'proposal',
    label: 'Proposal',
    hash: '#/proposal',
    text: 'The case for developers in ten minutes, with live numbers and the trend.',
    art: <ProposalArt />,
  },
];

type Step = {
  icon: IconName;
  title: string;
  text: ReactNode;
  link?: { hash: string; label: string };
};

const FIRST_HEAL: Step[] = [
  {
    icon: 'components',
    title: 'Pick a component',
    text: 'Open it from the gallery. The Usage panel shows where it appears and what is off the spec.',
    link: { hash: '#/components', label: 'Components' },
  },
  {
    icon: 'tokens',
    title: 'Change a token',
    text: 'In the Tokens panel or on a Foundations page. Values snap to the scale or the palette.',
    link: { hash: '#/foundations', label: 'Foundations' },
  },
  {
    icon: 'review',
    title: 'Open Review',
    text: 'See the real pages that use it, before and after, at desktop and mobile width.',
    link: { hash: '#/review', label: 'Review' },
  },
  {
    icon: 'copy',
    title: 'Copy the heal task',
    text: 'The Heal button on a token or a finding copies a short task for Claude Code.',
  },
  {
    icon: 'heal',
    title: 'Run heal',
    text: (
      <>
        In <code>front/</code>, start <code>claude</code> and paste the task. It
        edits, checks, screenshots and commits.
      </>
    ),
  },
  {
    icon: 'external',
    title: 'Push',
    text: (
      <>
        Refresh the change list (<code>npm run ds:changes</code>), commit it,
        then <code>git push</code>. The preview rebuilds from the branch.
      </>
    ),
  },
  {
    icon: 'check',
    title: 'See the number drop',
    text: 'The off-spec count and the trend on the Proposal page move with every heal.',
    link: { hash: '#/proposal', label: 'Proposal' },
  },
];

const RULES: { icon: IconName; title: string; text: ReactNode; key?: true }[] =
  [
    {
      icon: 'alert',
      title: "Today's look stays",
      key: true,
      text: (
        <>
          A heal never changes today&apos;s rendering of a shared component,
          even with mode <code>both</code>. The heal skill checks and stops. A
          deliberate change to the front office goes through a token commit: the
          token&apos;s today value in <code>tokens.source.json</code>.
        </>
      ),
    },
    {
      icon: 'tokens',
      title: 'Tokens only',
      text: (
        <>
          A heal reads a token, never a new hand-typed value. A new value goes
          into <code>tokens.source.json</code> first.
        </>
      ),
    },
    {
      icon: 'heal',
      title: 'One heal per commit',
      text: 'Small commits, each marked AI-assisted, one component at a time, so a developer can review each one.',
    },
    {
      icon: 'a11y',
      title: 'Checked, never compliant',
      text: 'Say "checked by axe", "keyboard tested" or "reviewed by agent on a date". Never "compliant".',
    },
  ];

type Command = {
  title: string;
  code: string;
  note?: ReactNode;
};

const MAC_STEPS: Command[] = [
  {
    title: 'Node 24',
    code: 'node -v',
    note: (
      <>
        24.14 or later. With nvm: <code>nvm install 24</code>.
      </>
    ),
  },
  {
    title: 'Get the branch',
    code: 'git clone https://github.com/CitizenLabDotCo/citizenlab.git\ncd citizenlab\ngit switch design-system/workbench\ncd front',
  },
  {
    title: 'Install',
    code: 'npm ci',
    note: 'Takes a few minutes the first time.',
  },
  {
    title: 'Start the workbench',
    code: 'npm run storybook',
    note: (
      <>
        Then open <code>http://localhost:6006/workbench/</code>. Storybook
        itself stays at <code>http://localhost:6006</code>.
      </>
    ),
  },
  {
    title: 'Add the MCP servers, once',
    code: 'claude mcp add --transport http --scope user storybook http://localhost:6006/mcp\nclaude mcp add --transport http --scope user figma https://mcp.figma.com/mcp',
    note: (
      <>
        With Storybook running. <code>--scope user</code> makes both servers
        work from any folder. Figma&apos;s is the remote server, so no desktop
        app is needed: in Claude Code type <code>/mcp</code>, pick figma, then
        Authenticate. Which Figma seats and plans can use it, and how many calls
        they get:{' '}
        <a
          href="https://www.figma.com/pricing/"
          target="_blank"
          rel="noreferrer"
        >
          Figma&apos;s pricing page
        </a>
        .
      </>
    ),
  },
  {
    title: 'Claude Code',
    code: 'claude',
    note: 'From front/, so it finds the skills.',
  },
  {
    title: 'Screenshots and axe',
    code: '(mkdir -p ~/pw && cd ~/pw && npm i playwright && npx playwright install chromium)\nexport GV_PLAYWRIGHT_DIR=~/pw',
    note: 'Playwright lives outside the repo. Put the export in your shell profile.',
  },
  {
    title: 'Long visual runs',
    code: 'NODE_OPTIONS=--max-old-space-size=4096 npm run ds:visual -- --compare <dir>',
    note: 'More memory for a run over every story.',
  },
];

const REFRESH: Command[] = [
  {
    title: 'Route ids',
    code: 'npm run ds:routes-fixture',
    note: 'After the test platform is reseeded. It lists the ids it could not fill; add those by hand.',
  },
  {
    title: 'Change list and trend',
    code: 'npm run ds:changes',
    note: (
      <>
        After a heal and before each push. Commit{' '}
        <code>design-changes.json</code> and <code>trend.json</code> together.
      </>
    ),
  },
  {
    title: 'Scan totals',
    code: 'npm run ds:scan',
    note: 'After any code change. Heals commit the summary with their change.',
  },
  {
    title: 'Accessibility results',
    code: 'npm run ds:a11y',
    note: 'With Storybook running, before a push. Then npm run ds:check.',
  },
];

const FILES: { icon: IconName; path: string; text: string }[] = [
  {
    icon: 'tokens',
    path: 'app/design-system/tokens/tokens.source.json',
    text: 'The one token source. Edit this, never the generated files.',
  },
  {
    icon: 'components',
    path: 'app/component-library/components/<Name>/',
    text: 'Each component with its stories and, once reviewed, its a11y.json checklist.',
  },
  {
    icon: 'heal',
    path: '.claude/skills/',
    text: 'heal, lift, story, new-component, audit, a11y-review, propose.',
  },
  {
    icon: 'file',
    path: '.storybook/AGENTS.md',
    text: 'Notes for agents: every command and file explained.',
  },
  {
    icon: 'usage',
    path: '.storybook/static/',
    text: 'The data this workbench reads: scan, changes, trend, axe results.',
  },
  {
    icon: 'sliders',
    path: 'scripts/design-system/',
    text: 'The scanner and the other ds:* scripts.',
  },
  {
    icon: 'start',
    path: '.storybook/workbench/',
    text: 'This workbench, a small React app.',
  },
  {
    icon: 'proposal',
    path: '.storybook/PR_TEMPLATE.md',
    text: 'The pull request text the propose skill fills.',
  },
];

const PREVIEW_CAN = [
  'The workbench with the data committed on the branch.',
  'Real platform pages in Review, with your token edits applied.',
  'Share links that open the workbench with your edits.',
];

const PREVIEW_CANNOT = [
  'Anything not pushed yet: it rebuilds from the branch.',
  'Fresh axe or visual results: they run on your machine and are committed.',
  'The Storybook MCP server: it runs with npm run storybook only.',
  'Highlights for components outside the library: UI and admin components carry no tag.',
  'Exact baselines for code heals: the Before host needs its own login, and its data differs.',
  'Fresh instance audits: ds:audit runs on your machine with a stored admin session; once an audit is committed under audits/, its component page shows it, without screenshots.',
];

const PREVIEW_NOTES = [
  'Route reach is per file: a component in a shared file shows on many routes.',
  'Contrast pairs are inferred from the tokens a component reaches.',
  'The preview address is temporary.',
];

// ------------------------------------------------------------ page

const StartHere = () => {
  const data = useBuildData();
  const needs = needsHumanRows(CHECKLISTS);
  // One review date for every row goes in the note, not on each row.
  const dates = new Set(needs.map((r) => r.reviewedAt));
  const oneDate =
    dates.size === 1 ? needs[0]?.reviewedAt ?? undefined : undefined;
  const knownCriticals = a11yKnown.known.length;

  return (
    <article className="wb-page wb-page-wide wb-start">
      <section className="wb-hero">
        <div className="wb-hero-text">
          <p className="wb-eyebrow">Design workbench</p>
          <h1>Start here</h1>
          <ul className="wb-start-five">
            {FIVE_LINES.map((l) => (
              <li key={l}>
                <Icon name="check" size={16} />
                <span>{l}</span>
              </li>
            ))}
          </ul>
          <div className="wb-hero-actions">
            <a className="wb-button wb-button-primary" href="#/components">
              Browse components
              <Icon name="arrow" size={16} />
            </a>
            <a className="wb-button" href="#/review">
              Open Review
            </a>
          </div>
        </div>
        <HeroArt />
      </section>

      <Section
        title="The pages"
        note="Six places, one job each. The tour below uses them in order."
      >
        <ul className="wb-start-tour" data-testid="wb-tour">
          {TOUR.map((p) => (
            <li key={p.hash}>
              <a className="wb-card wb-start-tour-card" href={p.hash}>
                <span className="wb-start-tour-art">{p.art}</span>
                <span className="wb-start-tour-body">
                  <span className="wb-card-title">
                    <Icon name={p.name} size={18} />
                    {p.label}
                  </span>
                  <span className="wb-card-text">{p.text}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Your first heal"
        note="From a token idea to a smaller off-spec count, in seven steps."
      >
        <ol className="wb-start-steps">
          {FIRST_HEAL.map((s, i) => (
            <li key={s.title}>
              <span className="wb-start-step-num" aria-hidden="true">
                {i + 1}
              </span>
              <span className="wb-start-step-icon">
                <Icon name={s.icon} size={18} />
              </span>
              <strong>{s.title}</strong>
              <span className="wb-start-step-text">{s.text}</span>
              {s.link && (
                <a className="wb-start-step-link" href={s.link.hash}>
                  {s.link.label}
                  <Icon name="arrow" size={14} />
                </a>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="The rules">
        <ul className="wb-start-rules">
          {RULES.map((r) => (
            <li
              key={r.title}
              className={
                r.key ? 'wb-start-rule wb-start-rule-key' : 'wb-start-rule'
              }
              data-testid={r.key ? 'wb-rule-today' : undefined}
            >
              <span className="wb-start-rule-icon">
                <Icon name={r.icon} size={20} />
              </span>
              <span>
                <strong>{r.title}</strong>
                <span className="wb-start-rule-text">{r.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Accessibility"
        note="Checked by machine where it can be, reviewed by an agent where a machine cannot, and left to a person for the rest."
      >
        <ul className="wb-start-thresholds">
          <li className="wb-start-threshold wb-start-threshold-block">
            <span className="wb-start-threshold-label">Blocks a commit</span>
            <p>
              A critical axe violation in a Components story that is not on the
              known list: <code>npm run ds:check</code> fails.
            </p>
            <p className="wb-start-threshold-foot">
              <strong>{knownCriticals}</strong> known today, in{' '}
              <code>a11y-known.json</code>. Fix one, remove its entry.
            </p>
          </li>
          <li className="wb-start-threshold">
            <span className="wb-start-threshold-label">
              Shown, not blocking
            </span>
            <p>
              Serious, moderate and minor violations show as badges in the
              gallery and the A11y panel. So does <em>keyboard: untested</em> on
              a component with no Keyboard story.
            </p>
          </li>
          <li className="wb-start-threshold">
            <span className="wb-start-threshold-label">Where it runs</span>
            <p>
              On your machine: <code>npm run ds:a11y</code> runs axe on every
              story at 1280 wide in mode today, WCAG 2.0, 2.1 and 2.2 A and AA.
              Nothing runs axe in CI.
            </p>
          </li>
        </ul>

        <h3 className="wb-start-subtitle">
          Needs a person <span className="wb-count">{needs.length}</span>
        </h3>
        <p className="wb-section-note">
          The checklist criteria an agent could not settle. Try each one on a
          real page and update the component&apos;s <code>a11y.json</code>.
          {oneDate && ` Reviewed by agent on ${formatDate(oneDate)}.`}
        </p>
        {needs.length === 0 ? (
          <p className="wb-muted" data-testid="wb-needs-human-none">
            Nothing waits for a person.
          </p>
        ) : (
          <ul className="wb-start-needs" data-testid="wb-needs-human">
            {needs.map((r) => {
              const story = data?.storyOf[r.component];
              return (
                <li key={`${r.component}-${r.id}`}>
                  <span className="wb-start-needs-who">
                    {story ? (
                      <a href={`#/components/${encodeURIComponent(story)}`}>
                        {r.component}
                      </a>
                    ) : (
                      <strong>{r.component}</strong>
                    )}
                    <span className="wb-badge wb-badge-accent">
                      {r.id} {r.name}
                    </span>
                  </span>
                  <span className="wb-start-needs-note">{r.note}</span>
                  {r.reviewedAt && !oneDate && (
                    <span className="wb-start-needs-date">
                      Reviewed by agent on {formatDate(r.reviewedAt)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section
        title="Run it on your Mac"
        note="Once, then steps 4 and 6 every day. Run every command in front/."
      >
        <Commands items={MAC_STEPS} testId="wb-run-steps" />
      </Section>

      <Section
        title="Keep the data fresh"
        note="The workbench reads committed files. These commands rewrite them."
      >
        <Commands items={REFRESH} compact />
      </Section>

      <Section title="Where files live" note="Paths from front/.">
        <ul className="wb-start-files">
          {FILES.map((f) => (
            <li key={f.path}>
              <span className="wb-start-file-icon">
                <Icon name={f.icon} size={18} />
              </span>
              <span>
                <code>{f.path}</code>
                <span className="wb-start-file-text">{f.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="What the preview can show"
        note="The epic preview is a build of this branch, for review. Some things only happen on your machine."
      >
        <div className="wb-start-preview">
          <div className="wb-start-preview-col wb-start-preview-can">
            <h3>
              <Icon name="check" size={18} />
              Shows
            </h3>
            <ul>
              {PREVIEW_CAN.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="wb-start-preview-col wb-start-preview-cannot">
            <h3>
              <Icon name="minus" size={18} />
              Cannot show
            </h3>
            <ul>
              {PREVIEW_CANNOT.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="wb-start-preview-notes">
          <h3>
            <Icon name="alert" size={18} />
            Read with care
          </h3>
          <ul>
            {PREVIEW_NOTES.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Data in this build">
        {data === null ? (
          <p className="wb-muted">Loading.</p>
        ) : (
          <div className="wb-data">
            <div className="wb-stats">
              <div className="wb-stat">
                <span className="wb-stat-value">{data.stories}</span>
                <span className="wb-stat-label">stories</span>
              </div>
              <div className="wb-stat">
                <span className="wb-stat-value">{data.tokens}</span>
                <span className="wb-stat-label">tokens</span>
              </div>
            </div>
            {data.missing.length === 0 ? (
              <p className="wb-data-note" data-testid="wb-missing-none">
                <span className="wb-badge wb-badge-live">Complete</span> All
                data files were found.
              </p>
            ) : (
              <div className="wb-data-note">
                <p>
                  These data files are not in this build, so the pages that use
                  them show less:
                </p>
                <ul className="wb-file-list" data-testid="wb-missing">
                  {data.missing.map((m) => (
                    <li key={m}>
                      <code>{m.replace(/^\.\.\//, '')}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Section>
    </article>
  );
};

const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) => (
  <section className="wb-start-section">
    <h2 className="wb-section-title">{title}</h2>
    {note && <p className="wb-section-note">{note}</p>}
    {children}
  </section>
);

const Commands = ({
  items,
  compact,
  testId,
}: {
  items: Command[];
  compact?: boolean;
  testId?: string;
}) => (
  <ol
    className={
      compact ? 'wb-start-cmds wb-start-cmds-compact' : 'wb-start-cmds'
    }
    data-testid={testId}
  >
    {items.map((c, i) => (
      <li key={c.title}>
        <span className="wb-start-cmd-head">
          {!compact && (
            <span className="wb-start-step-num" aria-hidden="true">
              {i + 1}
            </span>
          )}
          <strong>{c.title}</strong>
        </span>
        <pre className="wb-start-code">
          <code>{c.code}</code>
        </pre>
        {c.note && <span className="wb-start-cmd-note">{c.note}</span>}
      </li>
    ))}
  </ol>
);

// ------------------------------------------------------------ art
// Small previews of each page, in token colours. Decorative.

function Art({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 110"
      width="200"
      height="110"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function FoundationsArt() {
  return (
    <Art>
      {['--gv-blue-700', '--gv-blue-400', '--gv-teal-400', '--gv-teal-200'].map(
        (c, i) => (
          <rect
            key={c}
            x={20 + i * 30}
            y="20"
            width="24"
            height="24"
            rx="6"
            fill={`var(${c})`}
          />
        )
      )}
      <g fill="var(--gv-teal-200)">
        {[4, 8, 12, 16, 24].map((h, i) => (
          <rect
            key={h}
            x={20 + i * 14}
            y={84 - h}
            width="8"
            height={h}
            rx="1"
          />
        ))}
      </g>
      <g fill="none" stroke="var(--wb-accent)" strokeWidth="1.5">
        <rect x="106" y="62" width="22" height="22" rx="2" />
        <rect x="136" y="62" width="22" height="22" rx="7" />
        <rect x="166" y="62" width="22" height="22" rx="11" />
      </g>
    </Art>
  );
}

function ComponentsArt() {
  return (
    <Art>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${16 + i * 60} 18)`}>
          <rect
            width="52"
            height="74"
            rx="6"
            fill="var(--gv-white)"
            stroke="var(--wb-border-strong)"
          />
          <rect
            x="8"
            y="10"
            width="36"
            height="12"
            rx="6"
            fill="var(--wb-accent)"
          />
          <rect
            x="8"
            y="30"
            width="28"
            height="5"
            rx="2.5"
            fill="var(--gv-grey-300)"
          />
          <rect
            x="8"
            y="58"
            width="22"
            height="8"
            rx="4"
            fill="var(--gv-teal-100)"
          />
        </g>
      ))}
    </Art>
  );
}

function PatternsArt() {
  return (
    <Art>
      <rect
        x="16"
        y="14"
        width="168"
        height="82"
        rx="6"
        fill="var(--gv-white)"
        stroke="var(--wb-border-strong)"
      />
      <rect
        x="26"
        y="24"
        width="60"
        height="12"
        rx="6"
        fill="var(--gv-grey-200)"
      />
      <rect
        x="128"
        y="24"
        width="46"
        height="12"
        rx="6"
        fill="var(--wb-accent)"
      />
      {[46, 60, 74].map((y) => (
        <g key={y}>
          <rect x="26" y={y} width="148" height="1" fill="var(--gv-grey-200)" />
          <rect
            x="26"
            y={y + 4}
            width="40"
            height="5"
            rx="2.5"
            fill="var(--gv-grey-300)"
          />
          <rect
            x="96"
            y={y + 4}
            width="56"
            height="5"
            rx="2.5"
            fill="var(--gv-grey-200)"
          />
        </g>
      ))}
    </Art>
  );
}

function PagesArt() {
  return (
    <Art>
      <rect
        x="16"
        y="14"
        width="168"
        height="82"
        rx="6"
        fill="var(--gv-white)"
        stroke="var(--wb-border-strong)"
      />
      <rect
        x="16"
        y="14"
        width="40"
        height="82"
        rx="6"
        fill="var(--gv-grey-100)"
      />
      {[26, 38, 50].map((y) => (
        <rect
          key={y}
          x="24"
          y={y}
          width="24"
          height="5"
          rx="2.5"
          fill="var(--gv-grey-300)"
        />
      ))}
      <rect
        x="66"
        y="24"
        width="70"
        height="9"
        rx="4.5"
        fill="var(--gv-grey-300)"
      />
      <rect
        x="66"
        y="42"
        width="108"
        height="44"
        rx="6"
        fill="var(--gv-teal-50)"
        stroke="var(--gv-teal-200)"
      />
      <rect
        x="74"
        y="50"
        width="40"
        height="10"
        rx="5"
        fill="var(--wb-accent)"
      />
    </Art>
  );
}

function ReviewArt() {
  return (
    <Art>
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${16 + i * 88} 14)`}>
          <rect
            width="80"
            height="82"
            rx="6"
            fill="var(--gv-white)"
            stroke={i ? 'var(--wb-accent)' : 'var(--wb-border-strong)'}
            strokeWidth={i ? 1.5 : 1}
          />
          <rect
            x="8"
            y="8"
            width="30"
            height="5"
            rx="2.5"
            fill="var(--gv-grey-300)"
          />
          <rect
            x="8"
            y="22"
            width="64"
            height="24"
            rx={i ? 8 : 2}
            fill={i ? 'var(--gv-teal-100)' : 'var(--gv-grey-100)'}
          />
          <rect
            x="8"
            y="56"
            width="28"
            height="10"
            rx={i ? 5 : 1}
            fill="var(--wb-accent)"
          />
        </g>
      ))}
    </Art>
  );
}

function ProposalArt() {
  return (
    <Art>
      <circle
        cx="50"
        cy="55"
        r="38"
        fill="var(--gv-teal-50)"
        stroke="var(--gv-teal-200)"
      />
      <circle cx="50" cy="55" r="25" fill="var(--gv-teal-100)" />
      <circle cx="50" cy="55" r="12" fill="var(--wb-accent)" />
      <polyline
        points="106,30 126,38 146,52 166,66 186,80"
        fill="none"
        stroke="var(--wb-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="106" y="92" width="80" height="1" fill="var(--gv-grey-300)" />
    </Art>
  );
}

// Shapes in token colours: a swatch, a spacing ladder, a card with a button.
const HeroArt = () => (
  <svg
    className="wb-hero-art"
    viewBox="0 0 320 220"
    width="320"
    height="220"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      x="20"
      y="24"
      width="180"
      height="128"
      rx="14"
      fill="var(--gv-white)"
      stroke="var(--wb-border-strong)"
    />
    <rect
      x="36"
      y="42"
      width="72"
      height="10"
      rx="5"
      fill="var(--gv-grey-300)"
    />
    <rect
      x="36"
      y="62"
      width="120"
      height="8"
      rx="4"
      fill="var(--gv-grey-200)"
    />
    <rect
      x="36"
      y="76"
      width="96"
      height="8"
      rx="4"
      fill="var(--gv-grey-200)"
    />
    <rect
      x="36"
      y="110"
      width="72"
      height="26"
      rx="13"
      fill="var(--wb-accent)"
    />
    <rect
      x="116"
      y="110"
      width="60"
      height="26"
      rx="13"
      fill="none"
      stroke="var(--wb-accent)"
      strokeWidth="1.5"
    />
    <g transform="translate(220 24)">
      <rect width="80" height="26" rx="6" fill="var(--gv-blue-700)" />
      <rect y="30" width="80" height="26" rx="6" fill="var(--gv-blue-400)" />
      <rect y="60" width="80" height="26" rx="6" fill="var(--gv-teal-400)" />
      <rect y="90" width="80" height="26" rx="6" fill="var(--gv-teal-200)" />
      <rect
        y="120"
        width="80"
        height="26"
        rx="6"
        fill="var(--gv-teal-50)"
        stroke="var(--wb-border)"
      />
    </g>
    <g transform="translate(20 172)" fill="var(--gv-teal-200)">
      <rect y="28" width="8" height="4" rx="1" />
      <rect x="14" y="24" width="8" height="8" rx="1" />
      <rect x="28" y="20" width="8" height="12" rx="1" />
      <rect x="42" y="16" width="8" height="16" rx="1" />
      <rect x="56" y="8" width="8" height="24" rx="1" />
      <rect x="70" y="0" width="8" height="32" rx="1" fill="var(--wb-accent)" />
    </g>
    <g
      transform="translate(130 176)"
      fill="none"
      stroke="var(--wb-accent)"
      strokeWidth="1.5"
    >
      <rect width="28" height="28" rx="2" />
      <rect x="40" width="28" height="28" rx="8" />
      <rect x="80" width="28" height="28" rx="14" />
    </g>
  </svg>
);

export default StartHere;
