import { useMemo } from 'react';

import { BRANCH } from '../lib/componentPanels';
import {
  ChangeCommit,
  CommitGroup,
  DESIGN_KINDS,
  DesignChanges,
  fileLink,
  groupCommits,
} from '../lib/review';

import Icon from './Icon';

type Props = {
  changes?: DesignChanges;
  loaded: boolean;
  seen: Set<string>;
  onSeen: (sha: string, on: boolean) => void;
  // Opens the routes this commit touches in the route list.
  onRoutes: (c: ChangeCommit) => void;
  // How many routes each commit touches, the shell left out, and whether
  // it changes the shell (every page).
  routeCount: (c: ChangeCommit) => { routes: number; shell: boolean };
  // Components and routes a token reaches.
  tokenReach: (name: string) => { components: number; routes: number };
};

const KIND_LABEL: Record<string, string> = {
  token: 'Token',
  heal: 'Heal',
  lift: 'Lift',
  story: 'Stories',
  other: 'Other',
};

// `design-system(heal): Button radius [AI-assisted]` -> `Button radius`.
export const shortSubject = (subject: string) =>
  subject
    .replace(/^[a-z-]+\([^)]*\):\s*/i, '')
    .replace(/\s*\[AI-assisted\]\s*$/, '');

const Delta = ({ n }: { n: number }) =>
  n === 0 ? null : (
    <span
      className={n < 0 ? 'wb-delta wb-delta-down' : 'wb-delta wb-delta-up'}
      title="Off-spec values this commit added or removed"
    >
      {n > 0 ? '+' : ''}
      {n} off-spec
    </span>
  );

const Commit = ({
  c,
  repoUrl,
  seen,
  onSeen,
  onRoutes,
  routes,
}: {
  c: ChangeCommit;
  repoUrl: string;
  seen: boolean;
  onSeen: (on: boolean) => void;
  onRoutes: () => void;
  routes: { routes: number; shell: boolean };
}) => (
  <li
    className={seen ? 'wb-commit wb-commit-seen' : 'wb-commit'}
    data-testid="wb-commit"
  >
    <label className="wb-commit-seen-box" title="Mark as seen">
      <input
        type="checkbox"
        checked={seen}
        onChange={(e) => onSeen(e.target.checked)}
        data-testid="wb-commit-seen"
      />
      <span className="wb-visually-hidden">Seen</span>
    </label>
    <div className="wb-commit-body">
      <p className="wb-commit-subject">{shortSubject(c.subject)}</p>
      <div className="wb-commit-meta">
        <a
          href={`${repoUrl}/commit/${c.sha}`}
          target="_blank"
          rel="noreferrer"
          className="wb-commit-sha"
        >
          {c.sha.slice(0, 8)}
        </a>
        {c.scanDelta && <Delta n={c.scanDelta.offSpec} />}
        {routes.shell && (
          <span
            className="wb-commit-shell"
            title="Changes a file nine in ten routes render"
          >
            Every page
          </span>
        )}
        {(routes.routes > 0 || !routes.shell) && (
          <button
            type="button"
            className="wb-commit-routes"
            onClick={onRoutes}
            disabled={routes.routes === 0}
            title={
              routes.routes === 0
                ? 'No scanned route renders these files'
                : undefined
            }
            data-testid="wb-commit-routes"
          >
            <Icon name="route" size={14} />
            {routes.routes === 0
              ? 'No routes'
              : `${routes.routes} ${routes.routes === 1 ? 'route' : 'routes'}`}
          </button>
        )}
      </div>
      <details className="wb-commit-files">
        <summary>
          {c.files.length} {c.files.length === 1 ? 'file' : 'files'}
        </summary>
        <ul>
          {c.files.map((f) => (
            <li key={f}>
              <a
                href={fileLink(repoUrl, BRANCH, f)}
                target="_blank"
                rel="noreferrer"
              >
                <code>{f.replace(/^front\//, '')}</code>
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  </li>
);

// The branch's changes against master, the way a reviewer reads them:
// token changes first, then commits by component and kind, each with its
// files on GitHub, its scan delta, its routes and a "seen" mark kept in
// this browser.
const ChangeList = ({
  changes,
  loaded,
  seen,
  onSeen,
  onRoutes,
  routeCount,
  tokenReach,
}: Props) => {
  // Groups with design commits (token, heal, lift) first and open,
  // story-only components next, the rest of the unnamed commits last.
  const groups = useMemo(() => {
    const rank = (g: CommitGroup) =>
      g.kinds.some((k) => DESIGN_KINDS.has(k.kind))
        ? 0
        : g.component === null
        ? 2
        : 1;
    return groupCommits(changes?.commits ?? [])
      .map((g, i) => ({ g, i }))
      .sort((a, b) => rank(a.g) - rank(b.g) || a.i - b.i)
      .map(({ g }) => ({ ...g, design: rank(g) === 0 }));
  }, [changes]);
  if (!loaded) {
    return (
      <div className="wb-clist-loading" aria-busy="true">
        <div className="wb-skeleton-line" />
        <div className="wb-skeleton-line" />
        <div className="wb-skeleton-line" />
      </div>
    );
  }
  const commits = changes?.commits ?? [];
  const repoUrl = (
    changes?.repoUrl || 'https://github.com/CitizenLabDotCo/citizenlab'
  ).replace(/\/+$/, '');
  const seenCount = commits.filter((c) => seen.has(c.sha)).length;
  const tokens = changes?.tokenChanges ?? [];

  return (
    <div className="wb-clist" data-testid="wb-review-changes">
      <div className="wb-clist-progress">
        <div>
          <strong data-testid="wb-seen-count">
            Seen {seenCount} of {commits.length}
          </strong>
          <span className="wb-muted">
            {changes?.baseRef ? ` against ${changes.baseRef}` : ''}
          </span>
        </div>
        <div
          className="wb-progress"
          role="progressbar"
          aria-label="Commits seen"
          aria-valuemin={0}
          aria-valuemax={commits.length}
          aria-valuenow={seenCount}
        >
          <span
            style={{
              width: `${
                commits.length ? (seenCount / commits.length) * 100 : 0
              }%`,
            }}
          />
        </div>
      </div>

      {(changes?.warnings ?? []).map((w) => (
        <p key={w} className="wb-clist-warning">
          {w}
        </p>
      ))}

      <section className="wb-cgroup wb-cgroup-tokens">
        <h3>
          Token changes <span className="wb-count">{tokens.length}</span>
        </h3>
        {tokens.length === 0 ? (
          <p className="wb-muted wb-clist-note">
            No existing token changed value.
            {changes?.tokensNew
              ? ` ${changes.tokensNew} tokens are new on this branch.`
              : ''}
          </p>
        ) : (
          <ul className="wb-tchanges">
            {tokens.map((t) => {
              const reach = tokenReach(t.name);
              return (
                <li key={t.name}>
                  <code>{t.name}</code>
                  {(['today', 'redesign'] as const).map((m) => (
                    <span key={m} className="wb-tchange-mode">
                      <span className="wb-mode-name">
                        {m === 'today' ? 'Today' : 'Redesign'}
                      </span>
                      <span>{t.from?.[m] ?? 'new'}</span>
                      <Icon name="arrow" size={12} />
                      <span>{t.to?.[m] ?? 'removed'}</span>
                    </span>
                  ))}
                  <span className="wb-muted">
                    {reach.components} components, {reach.routes} routes
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {commits.length === 0 ? (
        <div className="wb-rlist-none">
          <Icon name="check" size={24} />
          <strong>No commits against master</strong>
          <p>
            The change list is empty. Run npm run ds:changes on the branch to
            refresh it.
          </p>
        </div>
      ) : (
        groups.map((g) => {
          const done = g.kinds
            .flatMap((k) => k.commits)
            .filter((c) => seen.has(c.sha)).length;
          return (
            <details
              key={g.component ?? '-'}
              className="wb-cgroup"
              open={g.design || groups.length <= 6}
              data-testid="wb-change-group"
            >
              <summary>
                <span className="wb-cgroup-name">
                  {g.component ?? 'No component'}
                </span>
                <span
                  className={
                    done === g.count ? 'wb-count wb-count-on' : 'wb-count'
                  }
                  title={`${done} of ${g.count} seen`}
                >
                  {done}/{g.count}
                </span>
              </summary>
              {g.kinds.map((k) => (
                <div key={k.kind} className="wb-ckind">
                  <h4>{KIND_LABEL[k.kind] ?? k.kind}</h4>
                  <ul>
                    {k.commits.map((c) => (
                      <Commit
                        key={c.sha}
                        c={c}
                        repoUrl={repoUrl}
                        seen={seen.has(c.sha)}
                        onSeen={(on) => onSeen(c.sha, on)}
                        onRoutes={() => onRoutes(c)}
                        routes={routeCount(c)}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </details>
          );
        })
      )}
    </div>
  );
};

export default ChangeList;
