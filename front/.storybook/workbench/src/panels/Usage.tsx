import { ReactNode, useEffect, useMemo, useState } from 'react';

import { CopiedText, HealButton, useCopy } from '../components/HealCopy';
import Icon, { IconName } from '../components/Icon';
import Segmented from '../components/Segmented';
import {
  CATEGORY_LABEL,
  fileFindings,
  githubLink,
  propCounts,
  reviewLink,
  routesByOffice,
  usageFiles,
} from '../lib/componentPanels';
import type { Finding } from '../lib/data';
import {
  formatHealTask,
  HealMode,
  healToken,
  isHealable,
  routeLabel,
} from '../lib/healTask';
import type { StoryGroup } from '../lib/stories';
import type { Indexes } from '../lib/useScanIndexes';

type Props = {
  storyId: string;
  group: StoryGroup;
  indexes: Indexes;
  healMode: HealMode;
  onHealMode: (mode: HealMode) => void;
};

type Office = 'admin' | 'public';

const OFFICE_LABEL: Record<Office, string> = {
  admin: 'Back office',
  public: 'Front office',
};

export const HEAL_MODE_LABEL: Record<HealMode, string> = {
  both: 'Both modes',
  today: 'Today',
  redesign: 'Redesign',
};

// Rows of a list shown before "Show all".
const FIRST = { files: 6, routes: 8, findings: 10, props: 10 };

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

const More = ({
  total,
  first,
  open,
  onToggle,
  noun,
}: {
  total: number;
  first: number;
  open: boolean;
  onToggle: () => void;
  noun: string;
}) =>
  total > first ? (
    <button
      type="button"
      className="wb-ulist-more"
      aria-expanded={open}
      onClick={onToggle}
    >
      {open ? 'Show fewer' : `Show all ${total} ${noun}`}
    </button>
  ) : null;

const Empty = ({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: string;
}) => (
  <div className="wb-panel-empty">
    <span className="wb-panel-empty-icon">
      <Icon name={icon} size={20} />
    </span>
    <strong>{title}</strong>
    <p>{text}</p>
  </div>
);

const fileParts = (file: string) => {
  const parts = file.split('/');
  // `Button/index.tsx` reads better as `Button`.
  const last = parts.pop() ?? file;
  const name =
    /^index\.[jt]sx?$/.test(last) && parts.length ? parts.pop() : last;
  return { name: name ?? last, dir: parts.join('/') };
};

const CONFIDENCE_TITLE = {
  high: 'Scan confidence high',
  medium: 'Scan confidence medium',
  low: 'Scan confidence low',
};

const FindingRow = ({ f, task }: { f: Finding; task?: string }) => {
  const { copied, copy, clear } = useCopy(task);
  const tokens = isHealable(f) ? healToken(f) : [];
  return (
    <li className="wb-finding" data-testid="wb-usage-finding">
      <div className="wb-finding-row">
        <a
          className="wb-line"
          href={githubLink(f.file, f.line)}
          target="_blank"
          rel="noreferrer"
          title="Open the line on GitHub"
        >
          L{f.line}
        </a>
        <span className="wb-finding-change">
          <code className="wb-finding-raw">{f.raw.replace(/\s+/g, '')}</code>
          {isHealable(f) && (
            <>
              <Icon name="arrow" size={12} />
              {tokens.length > 0 ? (
                <code className="wb-finding-token">{tokens[0]}</code>
              ) : (
                <span className="wb-muted">no token yet</span>
              )}
            </>
          )}
        </span>
        <span
          className={`wb-conf wb-conf-${f.confidence}`}
          title={CONFIDENCE_TITLE[f.confidence]}
        >
          <span className="wb-visually-hidden">
            {CONFIDENCE_TITLE[f.confidence]}
          </span>
        </span>
        {task && (
          <HealButton
            iconOnly
            label="Copy heal task"
            onClick={() => copy(task)}
            testId="wb-usage-heal"
          />
        )}
      </div>
      {f.component && (
        <span className="wb-finding-where">in {f.component}</span>
      )}
      <CopiedText copied={copied} onClose={clear} />
    </li>
  );
};

// Where the component is used (files, routes by office, props) and what
// the scan found in its file, each finding with its heal task.
const Usage = ({ storyId, group, indexes, healMode, onHealMode }: Props) => {
  const { scan } = indexes;
  const component = group.score?.component ?? group.name;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [office, setOffice] = useState<Office>('admin');
  const [category, setCategory] = useState<Finding['category'] | 'all'>('all');
  useEffect(() => {
    setOpen({});
    setCategory('all');
  }, [storyId]);
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const data = useMemo(() => {
    if (!scan) return null;
    const routes = group.score?.routes ?? [];
    return {
      files: usageFiles(scan, component, group.file),
      props: propCounts(scan, component),
      offices: routesByOffice(scan, routes),
      routes,
      findings: fileFindings(scan, group.file),
    };
  }, [scan, component, group.file, group.score]);

  // The office with routes, admin first.
  useEffect(() => {
    if (data && data.offices.admin.length === 0 && data.offices.public.length)
      setOffice('public');
  }, [data]);

  if (!indexes.loaded) {
    return (
      <div className="wb-controls-loading" aria-label="Loading the scan">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="wb-skeleton-line" />
        ))}
      </div>
    );
  }
  if (!data) {
    return (
      <Empty
        icon="usage"
        title="No scan in this build"
        text="design-scan.json is missing, so there is no usage to show. Run npm run ds:scan and build again."
      />
    );
  }

  const { files, props, offices, findings } = data;
  const routeList = offices[office];
  const categories = [...new Set(findings.map((f) => f.category))];
  const shownFindings =
    category === 'all'
      ? findings
      : findings.filter((f) => f.category === category);
  const cap = <T,>(list: T[], key: keyof typeof FIRST) =>
    open[key] ? list : list.slice(0, FIRST[key]);
  const uses = files.reduce((n, f) => n + f.count, 0);

  return (
    <div className="wb-usage" data-testid="wb-panel-usage">
      <dl className="wb-ustats">
        <div>
          <dt>Uses</dt>
          <dd>{group.score?.usageCount ?? uses}</dd>
        </div>
        <div>
          <dt>Files</dt>
          <dd>{files.length}</dd>
        </div>
        <div>
          <dt>Routes</dt>
          <dd>{data.routes.length}</dd>
        </div>
      </dl>

      <Section
        icon="file"
        title="Files"
        count={files.length}
        testId="wb-usage-files"
      >
        {files.length === 0 ? (
          <p className="wb-panel-none">
            {group.score
              ? 'No file outside the library uses it yet.'
              : 'The scan does not know this component.'}
          </p>
        ) : (
          <>
            <ul className="wb-ulist">
              {cap(files, 'files').map((u) => {
                const { name, dir } = fileParts(u.file);
                return (
                  <li key={u.file}>
                    <a
                      className="wb-ufile"
                      href={githubLink(u.file, u.line)}
                      target="_blank"
                      rel="noreferrer"
                      title={u.file}
                      data-testid="wb-usage-file"
                    >
                      <span className="wb-ufile-text">
                        <span className="wb-ufile-name">{name}</span>
                        <span className="wb-ufile-dir">{dir}</span>
                      </span>
                      {u.count > 1 && (
                        <span className="wb-count" title="Uses in the file">
                          {u.count}
                        </span>
                      )}
                      <Icon name="external" size={14} />
                    </a>
                  </li>
                );
              })}
            </ul>
            <More
              total={files.length}
              first={FIRST.files}
              open={!!open.files}
              onToggle={() => toggle('files')}
              noun="files"
            />
          </>
        )}
        {props.length > 0 && (
          <div className="wb-uprops">
            <span className="wb-uprops-label">Props set most</span>
            <ul className="wb-chip-row">
              {cap(props, 'props').map(([p, n]) => (
                <li key={p} className="wb-chip">
                  <code>{p}</code>
                  <span className="wb-muted">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section
        icon="route"
        title="Routes"
        count={data.routes.length}
        testId="wb-usage-routes"
      >
        {data.routes.length === 0 ? (
          <p className="wb-panel-none">No route renders it.</p>
        ) : (
          <>
            <Segmented<Office>
              label="Office"
              value={office}
              onChange={setOffice}
              testId="wb-usage-office"
              options={(['admin', 'public'] as Office[]).map((o) => ({
                value: o,
                label: OFFICE_LABEL[o],
                count: offices[o].length,
              }))}
            />
            {routeList.length === 0 ? (
              <p className="wb-panel-none">
                {`No ${OFFICE_LABEL[office].toLowerCase()} route renders it.`}
              </p>
            ) : (
              <ul className="wb-ulist">
                {cap(routeList, 'routes').map((path) => (
                  <li key={path}>
                    <a
                      className="wb-uroute"
                      href={reviewLink(path, component)}
                      title="Open in Review"
                      data-testid="wb-usage-route"
                      data-office={office}
                    >
                      <code>{routeLabel(path)}</code>
                      <span className="wb-uroute-go">
                        Review
                        <Icon name="arrow" size={14} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <More
              total={routeList.length}
              first={FIRST.routes}
              open={!!open.routes}
              onToggle={() => toggle('routes')}
              noun="routes"
            />
          </>
        )}
      </Section>

      <Section
        icon="heal"
        title="Findings"
        count={findings.length}
        testId="wb-usage-findings"
        tools={
          findings.length > 0 && (
            <label className="wb-heal-mode">
              <span>Heal for</span>
              <select
                value={healMode}
                onChange={(e) => onHealMode(e.target.value as HealMode)}
                data-testid="wb-heal-mode"
              >
                {(['both', 'today', 'redesign'] as HealMode[]).map((m) => (
                  <option key={m} value={m}>
                    {HEAL_MODE_LABEL[m]}
                  </option>
                ))}
              </select>
            </label>
          )
        }
      >
        {!group.file ? (
          <p className="wb-panel-none">
            Storybook does not say which file this story shows.
          </p>
        ) : findings.length === 0 ? (
          <Empty
            icon="check"
            title="Nothing to heal"
            text="The scan finds no hard value or legacy read in this file."
          />
        ) : (
          <>
            {categories.length > 1 && (
              <ul className="wb-ufilter" aria-label="Finding kinds">
                {(['all', ...categories] as const).map((c) => (
                  <li key={c}>
                    <button
                      type="button"
                      aria-pressed={c === category}
                      onClick={() => setCategory(c)}
                    >
                      {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
                      <span className="wb-segmented-count">
                        {c === 'all'
                          ? findings.length
                          : findings.filter((f) => f.category === c).length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <ul className="wb-findings">
              {cap(shownFindings, 'findings').map((f) => (
                <FindingRow
                  key={`${f.line}:${f.col}:${f.category}`}
                  f={f}
                  task={
                    isHealable(f)
                      ? formatHealTask(
                          f,
                          group.name,
                          storyId,
                          data.routes,
                          healMode
                        )
                      : undefined
                  }
                />
              ))}
            </ul>
            <More
              total={shownFindings.length}
              first={FIRST.findings}
              open={!!open.findings}
              onToggle={() => toggle('findings')}
              noun="findings"
            />
            <p className="wb-panel-note">
              {`${plural(
                findings.filter(isHealable).length,
                'finding has',
                'findings have'
              )} a heal task. Paste one into Claude Code on the branch.`}
            </p>
          </>
        )}
      </Section>
    </div>
  );
};

export default Usage;
