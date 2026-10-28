import { ReactNode, useEffect, useMemo, useState } from 'react';

import Icon, { IconName } from '../components/Icon';
import {
  A11yResults,
  axeSummary,
  axeTitle,
  Checklist,
  checklistCounts,
  CriterionResult,
  formatDate,
  IMPACT_LABEL,
  Impact,
  KEYBOARD_CRITERION,
  KEYBOARD_LABEL,
  KEYBOARD_STORY,
  KEYBOARD_TONE,
  keyboardStatus,
  KeyboardStatus,
  RESULT_LABEL,
  RESULT_ORDER,
  reviewedLine,
  sortCriteria,
  worstImpact,
} from '../lib/a11y';

import type { Section as GallerySection, StoryGroup } from '../lib/stories';

type Props = {
  storyId: string;
  storyLabel?: string;
  group: StoryGroup;
  section: GallerySection;
  results: A11yResults | null;
  loaded: boolean;
  checklist: Checklist | null;
};

const RESULT_ICON: Record<CriterionResult, IconName> = {
  pass: 'check',
  fail: 'cross',
  'needs-human': 'question',
  'n/a': 'minus',
};

const KEYBOARD_ICON: Record<KeyboardStatus, IconName> = {
  tested: 'check',
  'tested-fails': 'alert',
  failing: 'cross',
  untested: 'question',
  none: 'minus',
  unknown: 'minus',
};

const CONFIDENCE_TITLE = {
  high: 'Confidence high: a computed check or a keyboard run',
  medium: 'Confidence medium: judged from a screenshot',
  low: 'Confidence low: inferred',
};

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

const Section = ({
  icon,
  title,
  count,
  tools,
  children,
  testId,
}: {
  icon: IconName;
  title: string;
  count?: number;
  tools?: ReactNode;
  children: ReactNode;
  testId?: string;
}) => (
  <section className="wb-usection" data-testid={testId}>
    <header className="wb-usection-head">
      <h3>
        <Icon name={icon} size={16} />
        {title}
        {count !== undefined && <span className="wb-count">{count}</span>}
      </h3>
      {tools}
    </header>
    {children}
  </section>
);

const Empty = ({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: ReactNode;
}) => (
  <div className="wb-panel-empty">
    <span className="wb-panel-empty-icon">
      <Icon name={icon} size={20} />
    </span>
    <strong>{title}</strong>
    <p>{text}</p>
  </div>
);

export const ImpactPill = ({ impact }: { impact: Impact | null }) => (
  <span className={`wb-impact wb-impact-${impact ?? 'unknown'}`}>
    {impact ? IMPACT_LABEL[impact] : 'Unrated'}
  </span>
);

// The three badges of SPEC 7.6, as tiles at the top of the panel.
const Badges = ({
  results,
  group,
  checklist,
}: {
  results: A11yResults | null;
  group: StoryGroup;
  checklist: Checklist | null;
}) => {
  const axe = axeSummary(results, group);
  const kb = keyboardStatus(results, group, checklist);
  const reviewed = checklist && reviewedLine(checklist);
  const counts = checklist && checklistCounts(checklist);
  const axeTone =
    axe.checked === 0
      ? 'none'
      : axe.worst === 'critical'
      ? 'fail'
      : axe.worst
      ? 'warn'
      : 'pass';
  const kbTone = KEYBOARD_TONE[kb];
  return (
    <div className="wb-a11y-badges" data-testid="wb-a11y-badges">
      <div
        className={`wb-a11y-badge wb-a11y-tone-${axeTone}`}
        title={axeTitle(axe)}
      >
        <span className="wb-a11y-badge-icon">
          <Icon name="a11y" size={18} />
        </span>
        <span className="wb-a11y-badge-text">
          <strong>
            {axe.checked > 0 ? 'Checked by axe' : 'Not checked by axe'}
          </strong>
          <span>
            {axe.checked === 0
              ? 'Run npm run ds:a11y'
              : axe.worst
              ? (['critical', 'serious', 'moderate', 'minor'] as Impact[])
                  .filter((i) => axe.byImpact[i] > 0)
                  .map((i, n) =>
                    n === 0
                      ? `${IMPACT_LABEL[i]} in ${axe.byImpact[i]} of ${axe.checked} stories`
                      : `${i} in ${axe.byImpact[i]}`
                  )
                  .join(', ')
              : `${plural(axe.checked, 'story', 'stories')}, no violations`}
          </span>
        </span>
      </div>
      {kb !== 'none' && (
        <div
          className={`wb-a11y-badge wb-a11y-tone-${kbTone}`}
          data-testid="wb-a11y-keyboard"
          data-status={kb}
        >
          <span className="wb-a11y-badge-icon">
            <Icon name="keyboard" size={18} />
          </span>
          <span className="wb-a11y-badge-text">
            <strong>{KEYBOARD_LABEL[kb]}</strong>
            <span>
              {kb === 'tested'
                ? `${KEYBOARD_STORY} story: Tab, focus and keys`
                : kb === 'tested-fails'
                ? `The ${KEYBOARD_STORY} story passes; the checklist fails ${KEYBOARD_CRITERION}`
                : kb === 'failing'
                ? `The ${KEYBOARD_STORY} story's play function throws`
                : kb === 'untested'
                ? `Has focusable parts, no ${KEYBOARD_STORY} story`
                : 'No axe results yet'}
            </span>
          </span>
          <Icon name={KEYBOARD_ICON[kb]} size={16} />
        </div>
      )}
      <div
        className={`wb-a11y-badge wb-a11y-tone-${
          !counts
            ? 'none'
            : counts.fail > 0
            ? 'fail'
            : counts['needs-human'] > 0
            ? 'warn'
            : 'pass'
        }`}
        data-testid="wb-a11y-reviewed"
      >
        <span className="wb-a11y-badge-icon">
          <Icon name="checklist" size={18} />
        </span>
        <span className="wb-a11y-badge-text">
          <strong>
            {reviewed
              ? `Reviewed by ${checklist.reviewer} on ${formatDate(
                  checklist.reviewedAt ?? ''
                )}`
              : 'Not reviewed yet'}
          </strong>
          {counts && reviewed ? (
            <span className="wb-a11y-counts" aria-label={reviewed}>
              <span className="wb-a11y-count wb-a11y-count-pass">
                {counts.pass} pass
              </span>
              <span className="wb-a11y-count wb-a11y-count-fail">
                {counts.fail} fail
              </span>
              <span className="wb-a11y-count wb-a11y-count-needs-human">
                {counts['needs-human']}{' '}
                {counts['needs-human'] === 1 ? 'needs' : 'need'} a person
              </span>
            </span>
          ) : (
            <span>No a11y.json checklist</span>
          )}
        </span>
      </div>
    </div>
  );
};

// axe on the story in the canvas.
const StoryAxe = ({
  storyId,
  storyLabel,
  results,
}: {
  storyId: string;
  storyLabel?: string;
  results: A11yResults | null;
}) => {
  const r = results?.stories[storyId];
  const name = storyLabel ?? 'this story';
  if (!r) {
    return (
      <Empty
        icon="a11y"
        title="Not checked yet"
        text={`axe has not run on ${name}. Run npm run ds:a11y -- --stories '${storyId}'.`}
      />
    );
  }
  if (r.error) {
    return <Empty icon="alert" title="Could not be checked" text={r.error} />;
  }
  const worst = worstImpact(r.violations);
  return (
    <>
      <div
        className={`wb-a11y-story wb-a11y-story-${worst ?? 'clean'}`}
        data-testid="wb-a11y-story"
      >
        <span className="wb-a11y-story-icon">
          <Icon name={r.violations.length ? 'alert' : 'check'} size={18} />
        </span>
        <span className="wb-a11y-story-text">
          <strong>
            {r.violations.length
              ? `${plural(
                  r.violations.length,
                  'rule fails',
                  'rules fail'
                )} in ${name}`
              : `No axe violations in ${name}`}
          </strong>
          <span>
            {`${plural(r.passes, 'rule passes', 'rules pass')}`}
            {r.incomplete > 0 &&
              `, ${plural(r.incomplete, 'needs', 'need')} a look`}
            {r.play &&
              (r.play === 'passed' ? ', play passed' : ', play failed')}
            {` · checked ${formatDate(r.checkedAt)}`}
          </span>
        </span>
      </div>
      {r.violations.length > 0 && (
        <ul className="wb-a11y-violations">
          {r.violations.map((v) => (
            <li
              key={v.id}
              className="wb-a11y-violation"
              data-testid="wb-a11y-violation"
            >
              <ImpactPill impact={v.impact} />
              <span className="wb-a11y-violation-text">
                <span>{v.help}</span>
                <span className="wb-a11y-violation-meta">
                  <code>{v.id}</code>
                  {` · ${plural(v.nodes, 'element', 'elements')}`}
                </span>
              </span>
              {v.helpUrl && (
                <a
                  className="wb-a11y-violation-link"
                  href={v.helpUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`What ${v.id} means and how to fix it`}
                >
                  <Icon name="external" size={14} />
                  <span className="wb-visually-hidden">{`About ${v.id}`}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

// Every story of the component as a square, coloured by its worst axe
// impact, so the bad ones stand out; each links to its story.
const StoryGrid = ({
  group,
  results,
  storyId,
  section,
}: {
  group: StoryGroup;
  results: A11yResults | null;
  storyId: string;
  section: GallerySection;
}) => (
  <ul className="wb-a11y-grid" aria-label="axe per story">
    {group.stories.map((s) => {
      const r = results?.stories[s.id];
      const worst = r && !r.error ? worstImpact(r.violations) : null;
      const tone = !r || r.error ? 'none' : worst ?? 'clean';
      const label = !r
        ? 'not checked'
        : r.error
        ? 'could not be checked'
        : worst
        ? `${plural(
            r.violations.length,
            'rule fails',
            'rules fail'
          )}, worst ${worst}`
        : 'no violations';
      return (
        <li key={s.id}>
          <a
            href={`#/${section}/${encodeURIComponent(s.id)}`}
            className={`wb-a11y-cell wb-a11y-cell-${tone}`}
            aria-current={s.id === storyId ? 'true' : undefined}
            title={`${s.name}: ${label}`}
          >
            <span className="wb-a11y-cell-dot" aria-hidden="true" />
            <span className="wb-a11y-cell-name">{s.name}</span>
            {r && r.violations.length > 0 && (
              <span className="wb-a11y-cell-count">{r.violations.length}</span>
            )}
            <span className="wb-visually-hidden">{`: ${label}`}</span>
          </a>
        </li>
      );
    })}
  </ul>
);

const ChecklistTable = ({ checklist }: { checklist: Checklist }) => {
  const counts = checklistCounts(checklist);
  const [filter, setFilter] = useState<CriterionResult | 'all'>('all');
  useEffect(() => setFilter('all'), [checklist.component]);
  const rows = useMemo(() => sortCriteria(checklist.criteria), [checklist]);
  const shown =
    filter === 'all' ? rows : rows.filter((r) => r.result === filter);
  const total = checklist.criteria.length;
  return (
    <>
      <div className="wb-a11y-bar" aria-hidden="true">
        {RESULT_ORDER.filter((r) => counts[r] > 0).map((r) => (
          <span
            key={r}
            className={`wb-a11y-bar-${r}`}
            style={{ flexGrow: counts[r] }}
          />
        ))}
      </div>
      <ul className="wb-ufilter" aria-label="Results">
        {(['all', ...RESULT_ORDER] as const)
          .filter((r) => r === 'all' || counts[r] > 0)
          .map((r) => (
            <li key={r}>
              <button
                type="button"
                aria-pressed={r === filter}
                onClick={() => setFilter(r)}
                data-result={r}
              >
                {r !== 'all' && (
                  <span
                    className={`wb-a11y-dot wb-a11y-dot-${r}`}
                    aria-hidden="true"
                  />
                )}
                {r === 'all' ? 'All' : RESULT_LABEL[r]}
                <span className="wb-segmented-count">
                  {r === 'all' ? total : counts[r]}
                </span>
              </button>
            </li>
          ))}
      </ul>
      <table className="wb-a11y-table" data-testid="wb-a11y-checklist">
        <thead>
          <tr>
            <th scope="col">
              <span className="wb-visually-hidden">Result</span>
            </th>
            <th scope="col">WCAG 2.2 criterion and evidence</th>
            <th scope="col">
              <span className="wb-visually-hidden">Confidence</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {shown.map((c) => (
            <tr key={c.id} data-result={c.result}>
              <td>
                <span
                  className={`wb-a11y-result wb-a11y-result-${c.result}`}
                  title={RESULT_LABEL[c.result]}
                >
                  <Icon name={RESULT_ICON[c.result]} size={14} />
                  <span className="wb-visually-hidden">
                    {RESULT_LABEL[c.result]}
                  </span>
                </span>
              </td>
              <td>
                <span className="wb-a11y-criterion">
                  <code>{c.id}</code> {c.name}
                </span>
                {c.result !== 'n/a' || c.note ? (
                  <span className="wb-a11y-evidence">{c.evidence}</span>
                ) : null}
                {c.note && <span className="wb-a11y-note">{c.note}</span>}
              </td>
              <td>
                <span
                  className={`wb-conf wb-conf-${c.confidence}`}
                  title={CONFIDENCE_TITLE[c.confidence]}
                >
                  <span className="wb-visually-hidden">
                    {CONFIDENCE_TITLE[c.confidence]}
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

// axe on the current story, the component's stories at a glance, and the
// checklist an agent filled, with the badges of SPEC 7.6 on top. These
// say what was checked and when; they are not a conformance claim.
const A11y = ({
  storyId,
  storyLabel,
  group,
  section,
  results,
  loaded,
  checklist,
}: Props) => {
  if (!loaded) {
    return (
      <div className="wb-controls-loading" aria-label="Loading the axe results">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="wb-skeleton-line" />
        ))}
      </div>
    );
  }
  const axe = axeSummary(results, group);
  return (
    <div className="wb-a11y" data-testid="wb-panel-a11y">
      <Badges results={results} group={group} checklist={checklist} />

      <Section icon="a11y" title="This story" testId="wb-a11y-this">
        {results ? (
          <StoryAxe
            storyId={storyId}
            storyLabel={storyLabel}
            results={results}
          />
        ) : (
          <Empty
            icon="a11y"
            title="No axe results in this build"
            text="a11y-results.json is missing. Run npm run ds:a11y and build again."
          />
        )}
      </Section>

      {results && group.stories.length > 1 && (
        <Section
          icon="components"
          title="All stories"
          count={axe.checked}
          testId="wb-a11y-stories"
        >
          <StoryGrid
            group={group}
            results={results}
            storyId={storyId}
            section={section}
          />
          {axe.rules.length > 0 && (
            <ul className="wb-a11y-rules">
              {axe.rules.map((r) => (
                <li key={r.id}>
                  <ImpactPill impact={r.impact} />
                  <code>{r.id}</code>
                  <span className="wb-muted">
                    {`in ${plural(r.stories, 'story', 'stories')}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <Section
        icon="checklist"
        title="Checklist"
        count={checklist?.criteria.length}
        testId="wb-a11y-checklist-section"
      >
        {checklist && checklist.criteria.length > 0 ? (
          <>
            <ChecklistTable checklist={checklist} />
            <p className="wb-panel-note">
              {`Filled by ${checklist.reviewer} with the a11y-review skill from axe, keyboard runs, contrast and screenshots. Rows that need a person are open questions, not passes.`}
            </p>
          </>
        ) : (
          <Empty
            icon="checklist"
            title="Not reviewed yet"
            text={
              <>
                {'Ask Claude Code on the branch: '}
                <code>{`a11y-review: ${group.name}`}</code>
              </>
            }
          />
        )}
      </Section>
    </div>
  );
};

export default A11y;
