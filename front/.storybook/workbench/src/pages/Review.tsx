import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { GV_VIEWPORTS, GvViewport } from '../../../viewports';
import ChangeList, { shortSubject } from '../components/ChangeList';
import FrameView, { FrameReport } from '../components/FrameView';
import Icon from '../components/Icon';
import RouteList, {
  OFFICE_LABEL,
  RouteItem,
  RoutePath,
} from '../components/RouteList';
import Segmented from '../components/Segmented';
import { copyText } from '../lib/clipboard';
import { loadChanges, loadRouteFixture, TokenMeta } from '../lib/data';
import { Overrides, withOverrides } from '../lib/overrides';
import {
  loadPullRequest,
  parsePrNumber,
  prPreviewHost,
  PullRequest,
} from '../lib/pr';
import {
  ChangeCommit,
  changeReach,
  commitReach,
  DesignChanges,
  normaliseFixture,
  Office,
  parseReviewHash,
  prMarkdown,
  readSeen,
  resolveRoute,
  reviewHash,
  ReviewState,
  reviewSummary,
  RouteFixture,
  routesFor,
  routeStats,
  shellFiles,
  unfilledParams,
  writeSeen,
} from '../lib/review';
import { useScanIndexes } from '../lib/useScanIndexes';
import { PlaceholderArt } from './Placeholder';

type Props = {
  meta: TokenMeta[];
  overrides: Overrides;
};

type BeforeSource = 'preview' | 'baseline';
type Login = 'unknown' | 'admin' | 'user' | 'out';

const HOSTS_KEY = 'gv-review-hosts';

type ViewportChoice = GvViewport | 'auto';

const PRESETS = Object.keys(GV_VIEWPORTS) as GvViewport[];
const presetWidth = (v: GvViewport) =>
  parseInt(GV_VIEWPORTS[v].styles.width, 10);

const VIEWPORTS: { value: ViewportChoice; label: string; title: string }[] = [
  {
    value: 'auto',
    label: 'Auto',
    title: 'The widest preset that stays readable in the room the frames have',
  },
  ...PRESETS.map((v) => ({
    value: v,
    label: GV_VIEWPORTS[v].name.split(' ')[0],
    title: GV_VIEWPORTS[v].name,
  })),
];

// Auto picks the widest preset drawn at READABLE scale or more, else the
// narrowest one.
const READABLE = 0.55;
export const autoViewport = (frameWidth: number): GvViewport => {
  const bySize = [...PRESETS].sort((a, b) => presetWidth(b) - presetWidth(a));
  return (
    bySize.find((v) => frameWidth / presetWidth(v) >= READABLE) ??
    bySize[bySize.length - 1]
  );
};

// Under this window width the route list folds away once a route is
// picked, so the frames get the room (above the stacked layout only).
const FOLD_BELOW = 1600;
const STACKED = '(max-width: 880px)';
const shouldFold = () =>
  window.innerWidth < FOLD_BELOW && !window.matchMedia(STACKED).matches;

const SUGGESTED = [
  'admin/projects',
  'admin/projects/$projectId/general',
  'projects/$slug',
  '',
];

const readHosts = (): { after?: string; before?: string } => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(HOSTS_KEY) ?? '{}');
    return typeof raw === 'object' && raw ? raw : {};
  } catch {
    return {};
  }
};

const validHost = (h: string) => {
  try {
    const u = new URL(h);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.origin : '';
  } catch {
    return '';
  }
};

const sameOrigin = (host: string) => {
  try {
    return new URL(host).origin === window.location.origin;
  } catch {
    return false;
  }
};

const hostName = (host: string) => {
  try {
    return new URL(host).host;
  } catch {
    return host;
  }
};

// The platform keeps its session in the cl2_jwt cookie and sends it as a
// Bearer header; the API ignores the cookie itself.
const platformJwt = () =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith('cl2_jwt='))
    ?.slice('cl2_jwt='.length);

// Whether the browser is logged in to the platform on this origin (the
// frames share its cookies). Unknown off origin.
const useLogin = (host: string, reloadKey: number): Login => {
  const [login, setLogin] = useState<Login>('unknown');
  useEffect(() => {
    if (!sameOrigin(host)) {
      setLogin('unknown');
      return undefined;
    }
    const jwt = platformJwt();
    if (!jwt || jwt === 'undefined') {
      setLogin('out');
      return undefined;
    }
    let live = true;
    fetch(`${host}/web_api/v1/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(async (res) => {
        if (!live) return;
        if (res.status === 401) return setLogin('out');
        if (!res.ok) return setLogin('unknown');
        const body = await res.json().catch(() => null);
        const roles: { type?: string }[] = body?.data?.attributes?.roles ?? [];
        setLogin(roles.some((r) => r.type === 'admin') ? 'admin' : 'user');
      })
      .catch(() => live && setLogin('unknown'));
    return () => {
      live = false;
    };
  }, [host, reloadKey]);
  return login;
};

const Stat = ({
  label,
  value,
  note,
  testId,
  title,
}: {
  label: string;
  value: string;
  note?: string;
  testId?: string;
  title?: string;
}) => (
  <div className="wb-rstat" data-testid={testId} title={title ?? note}>
    <span className="wb-rstat-value">{value}</span>
    <span className="wb-rstat-label">{label}</span>
    {note && <span className="wb-rstat-note">{note}</span>}
  </div>
);

const fmt = (n: number) => n.toLocaleString('en');
const signed = (n: number) => (n === 0 ? '0' : `${n > 0 ? '+' : ''}${fmt(n)}`);

// The Review page: the real platform before and after, route by route.
// Left, the routes (filtered by component, office, search and what the
// changes touch) and the change list; centre, two frames of the platform
// with the session's token edits on the After frame.
const Review = ({ meta, overrides }: Props) => {
  const indexes = useScanIndexes(meta);
  const scan = indexes.scan;
  const [changes, setChanges] = useState<DesignChanges | undefined>();
  const [changesLoaded, setChangesLoaded] = useState(false);
  const [fixture, setFixture] = useState<RouteFixture>(() =>
    normaliseFixture({})
  );
  const [state, setState] = useState<ReviewState>(() =>
    parseReviewHash(window.location.hash)
  );
  const [search, setSearch] = useState('');
  const [commit, setCommit] = useState<ChangeCommit | undefined>();
  const [viewport, setViewport] = useState<ViewportChoice>('auto');
  const [before, setBefore] = useState<BeforeSource>('preview');
  const [sync, setSync] = useState(true);
  const [shown, setShown] = useState<'before' | 'after'>('after');
  const [reloadKey, setReloadKey] = useState(0);
  const [hosts, setHosts] = useState(readHosts);
  const [settings, setSettings] = useState(false);
  const [wide, setWide] = useState(
    () =>
      parseReviewHash(window.location.hash).route !== undefined && shouldFold()
  );
  const stage = useRef<HTMLElement>(null);
  const page = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  useEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => setStageWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const [seen, setSeen] = useState(readSeen);
  const [reports, setReports] = useState<
    Partial<Record<'before' | 'after', FrameReport>>
  >({});
  const [copied, setCopied] = useState<{ text: string; ok: boolean }>();
  const [pull, setPull] = useState<
    { data?: PullRequest; error?: string } | undefined
  >();

  useEffect(() => {
    let live = true;
    loadRouteFixture().then((f) => live && setFixture(normaliseFixture(f)));
    return () => {
      live = false;
    };
  }, []);

  // The change list: this branch's, or the pull request's from GitHub.
  useEffect(() => {
    let live = true;
    setChangesLoaded(false);
    setCommit(undefined);
    if (state.pr) {
      setPull(undefined);
      loadPullRequest(state.pr).then(
        (data) => {
          if (!live) return;
          setPull({ data });
          setChanges(data.changes);
          setChangesLoaded(true);
        },
        (e: Error) => {
          if (!live) return;
          setPull({ error: e.message });
          setChanges(undefined);
          setChangesLoaded(true);
        }
      );
    } else {
      setPull(undefined);
      loadChanges().then((c) => {
        if (!live) return;
        const ok = Array.isArray((c as Partial<DesignChanges>).commits);
        setChanges(ok ? (c as unknown as DesignChanges) : undefined);
        setChangesLoaded(true);
      });
    }
    return () => {
      live = false;
    };
  }, [state.pr]);

  // The state into the hash (the overrides parameter stays), and back
  // from a pasted link.
  useEffect(() => {
    const hash = window.location.hash;
    const next = reviewHash(hash, state);
    if (next !== hash) window.history.replaceState(null, '', next);
  }, [state]);
  useEffect(() => {
    const onChange = () => {
      if (!window.location.hash.startsWith('#/review')) return;
      const next = parseReviewHash(window.location.hash);
      setState((s) => (JSON.stringify(s) === JSON.stringify(next) ? s : next));
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const patch = (p: Partial<ReviewState>) => setState((s) => ({ ...s, ...p }));

  // A pull request: after is its preview, before this one (master).
  const afterHost = state.pr
    ? prPreviewHost(state.pr)
    : validHost(hosts.after ?? '') ||
      validHost(fixture.hosts.after) ||
      window.location.origin;
  const beforeHost = state.pr
    ? window.location.origin
    : validHost(hosts.before ?? '') || validHost(fixture.hosts.before);
  const beforeSource: BeforeSource = state.pr ? 'baseline' : before;
  const login = useLogin(afterHost, reloadKey);

  // ------------------------------------------------------------ routes

  // Files nine in ten routes render: a change there reaches every page and
  // is reported apart (see changeReach).
  const shell = useMemo(
    () => (scan ? shellFiles(scan) : new Set<string>()),
    [scan]
  );
  const reach = useMemo(
    () =>
      scan
        ? changeReach(scan, changes, overrides, meta, shell)
        : { routes: new Set<string>(), shellFiles: [], shellCommits: [] },
    [scan, changes, overrides, meta, shell]
  );
  const affected = reach.routes;
  const stats = useMemo(() => (scan ? routeStats(scan) : new Map()), [scan]);
  const filtered = useMemo(
    () =>
      scan
        ? routesFor(scan, {
            component: state.component,
            onlyAffected: state.only,
            affected,
            shell,
            changes,
            commit: commit?.sha,
            search,
          })
        : [],
    [
      scan,
      state.component,
      state.only,
      affected,
      shell,
      changes,
      commit,
      search,
    ]
  );
  const officeCounts = useMemo(
    () => ({
      all: filtered.length,
      admin: filtered.filter((r) => r.office === 'admin').length,
      public: filtered.filter((r) => r.office === 'public').length,
    }),
    [filtered]
  );
  const items: RouteItem[] = useMemo(
    () =>
      filtered
        .filter((r) => state.office === 'all' || r.office === state.office)
        .map((r) => ({
          ...r,
          offSpec: stats.get(r.path)?.offSpec ?? 0,
          files: stats.get(r.path)?.files ?? 0,
          unfilled: unfilledParams(r.path, fixture),
          affected: affected.has(r.path),
        })),
    [filtered, state.office, stats, fixture, affected]
  );
  const components = useMemo(
    () =>
      [...new Set((scan?.components ?? []).map((c) => c.component))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [scan]
  );
  const unmapped = useMemo(() => {
    const all = scan?.unmapped ?? [];
    if (!state.component || !scan) return all;
    const files = new Set(
      scan.usages
        .filter((u) => u.component === state.component)
        .map((u) => u.file)
    );
    return all.filter((f) => files.has(f));
  }, [scan, state.component]);

  const routeCount = useCallback(
    (c: ChangeCommit) => {
      if (!scan) return { routes: 0, shell: false };
      const r = commitReach(scan, c, shell);
      return { routes: r.routes.size, shell: r.shell };
    },
    [scan, shell]
  );
  const tokenReach = useCallback(
    (name: string) => {
      const u = indexes.usage.get(name);
      return { components: u?.components ?? 0, routes: u?.routes ?? 0 };
    },
    [indexes.usage]
  );

  const office = (path: string): Office | undefined =>
    scan?.routes.find((r) => r.path === path)?.office;

  // ------------------------------------------------------------ selection

  const route = state.route;
  const known =
    route !== undefined && !!scan?.routes.some((r) => r.path === route);
  const unfilled = route !== undefined ? unfilledParams(route, fixture) : [];
  const afterUrl =
    route !== undefined ? resolveRoute(route, fixture, afterHost) : '';
  const beforeUrl =
    route === undefined
      ? ''
      : beforeSource === 'baseline' && beforeHost
      ? resolveRoute(route, fixture, beforeHost)
      : afterUrl;
  const loginUrl = `${afterHost}/${fixture.locale}/sign-in/admin`;

  const select = (path: string) => {
    patch({ route: path });
    setReports({});
    if (shouldFold()) setWide(true);
  };

  // A code change compares with the baseline host when there is one; a
  // token change, or no commit, with this preview's edits off.
  const openCommit = (c: ChangeCommit) => {
    setCommit(c);
    patch({ tab: 'routes', only: false });
    setBefore(c.kind !== 'token' && beforeHost ? 'baseline' : 'preview');
  };
  const clearCommit = () => {
    setCommit(undefined);
    setBefore('preview');
  };

  const onSeen = (sha: string, on: boolean) =>
    setSeen((s) => {
      const next = new Set(s);
      if (on) next.add(sha);
      else next.delete(sha);
      writeSeen(next);
      return next;
    });

  // ------------------------------------------------------------ frames

  const wins = useRef<Record<'before' | 'after', Window | null>>({
    before: null,
    after: null,
  });
  const [winsKey, setWinsKey] = useState(0);
  const onWindow = useCallback(
    (side: 'before' | 'after') => (win: Window | null) => {
      if (wins.current[side] === win) return;
      wins.current[side] = win;
      setWinsKey((k) => k + 1);
    },
    []
  );
  const onWindowBefore = useMemo(() => onWindow('before'), [onWindow]);
  const onWindowAfter = useMemo(() => onWindow('after'), [onWindow]);
  const onReportBefore = useCallback(
    (r: FrameReport) => setReports((s) => ({ ...s, before: r })),
    []
  );
  const onReportAfter = useCallback(
    (r: FrameReport) => setReports((s) => ({ ...s, after: r })),
    []
  );

  // Sync scroll: both frames readable (same origin), each scroll moves the
  // other to the same offset.
  const canSync =
    reports.before?.state === 'ok' && reports.after?.state === 'ok';
  useEffect(() => {
    const { before: a, after: b } = wins.current;
    if (!sync || !canSync || !a || !b) return undefined;
    let lock: Window | null = null;
    const follow = (from: Window, to: Window) => () => {
      if (lock && lock !== from) return;
      lock = from;
      try {
        to.scrollTo(from.scrollX, from.scrollY);
      } catch {
        // The frame navigated off origin.
      }
      window.requestAnimationFrame(() => (lock = null));
    };
    const ab = follow(a, b);
    const ba = follow(b, a);
    try {
      a.addEventListener('scroll', ab, { passive: true });
      b.addEventListener('scroll', ba, { passive: true });
    } catch {
      return undefined;
    }
    return () => {
      try {
        a.removeEventListener('scroll', ab);
        b.removeEventListener('scroll', ba);
      } catch {
        // Gone with its frame.
      }
    };
  }, [sync, canSync, winsKey]);

  // The room of one frame: the stage less its padding, halved side by side.
  const stacked = stageWidth > 0 && window.matchMedia(STACKED).matches;
  const frameRoom = stacked ? stageWidth - 32 : (stageWidth - 44) / 2;
  const preset: GvViewport =
    viewport === 'auto'
      ? stageWidth > 0
        ? autoViewport(frameRoom)
        : 'gvTablet'
      : viewport;
  const vp = GV_VIEWPORTS[preset].styles;
  const vpW = parseInt(vp.width, 10);
  const vpH = parseInt(vp.height, 10);
  const editCount = Object.keys(overrides).length;
  // ------------------------------------------------------------ summary

  const summary = useMemo(
    () =>
      scan ? reviewSummary(scan, { changes, overrides, meta }) : undefined,
    [scan, changes, overrides, meta]
  );
  const seenCount = (changes?.commits ?? []).filter((c) =>
    seen.has(c.sha)
  ).length;

  const copyForPr = async () => {
    if (!summary) return;
    const { origin, pathname } = window.location;
    const link = `${origin}${pathname}${withOverrides(
      reviewHash('#/review', { ...state, tab: 'routes' }),
      overrides
    )}`;
    const text = prMarkdown(summary, link);
    setCopied({ text, ok: await copyText(text) });
  };

  const reload = () => {
    setReports({});
    setReloadKey((k) => k + 1);
  };
  const needsLogin =
    route !== undefined &&
    unfilled.length === 0 &&
    (reports.after?.state === 'login' ||
      reports.before?.state === 'login' ||
      (login === 'out' && /^admin(\/|$)/.test(route)));

  // The edits for the After frame, one object per change (the frame
  // rewrites the page when this changes).
  const edits = useMemo(() => ({ overrides }), [overrides]);

  const loading = !indexes.loaded;
  const noScan = indexes.loaded && !indexes.hasScan;

  const beforeCaption = state.pr
    ? 'Master, this preview'
    : beforeSource === 'baseline' && beforeHost
    ? `Baseline, ${hostName(beforeHost)}`
    : 'This preview, edits off';
  const afterCaption = state.pr
    ? `PR #${state.pr}, ${hostName(afterHost)}`
    : `This preview, ${
        editCount
          ? `${editCount} ${editCount === 1 ? 'edit' : 'edits'}`
          : 'no edits'
      }`;

  // The frames take the window below wherever the body starts, so a
  // shorter header gives them the room.
  useLayoutEffect(() => {
    const el = body.current;
    const article = page.current;
    if (!el || !article) return undefined;
    const place = () => {
      const scroller = el.closest('.wb-main');
      const top =
        el.getBoundingClientRect().top +
        (scroller ? scroller.scrollTop : window.scrollY);
      el.style.setProperty('--wb-review-top', `${Math.round(top)}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(article);
    window.addEventListener('resize', place);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
    };
  }, []);

  const picked = route !== undefined;

  return (
    <article
      className={picked ? 'wb-review wb-review-picked' : 'wb-review'}
      data-testid="wb-review"
      ref={page}
    >
      <header className="wb-review-head">
        <div>
          <p className="wb-eyebrow">Real platform</p>
          <h1>Review</h1>
          <p className="wb-lead">
            {state.pr
              ? `Pull request #${state.pr}: master and the PR's preview, side by side, on the pages it reaches.`
              : 'Every page before and after your changes, side by side.'}
          </p>
        </div>
        <div className="wb-review-actions">
          <form
            className="wb-review-pr"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem('pr');
              const n = parsePrNumber(
                input instanceof HTMLInputElement ? input.value : ''
              );
              patch({
                pr: n,
                route: undefined,
                only: !!n,
                tab: 'routes',
              });
              setReports({});
            }}
          >
            <input
              aria-label="Pull request number"
              name="pr"
              inputMode="numeric"
              placeholder="PR #"
              defaultValue={state.pr ?? ''}
              key={state.pr ?? 'none'}
              data-testid="wb-review-pr-input"
            />
            <button type="submit" className="wb-button">
              <Icon name="pullRequest" size={16} />
              {state.pr ? 'Change PR' : 'Review a PR'}
            </button>
            {state.pr && (
              <button
                type="button"
                className="wb-button"
                onClick={() =>
                  patch({ pr: undefined, route: undefined, only: false })
                }
                data-testid="wb-review-pr-clear"
              >
                This branch
              </button>
            )}
          </form>
          <button
            type="button"
            className="wb-button"
            onClick={() => setSettings((s) => !s)}
            aria-expanded={settings}
            data-testid="wb-review-settings-toggle"
          >
            <Icon name="sliders" size={16} />
            Hosts
          </button>
          <button
            type="button"
            className="wb-button wb-button-primary"
            onClick={copyForPr}
            disabled={!summary}
            data-testid="wb-review-copy"
          >
            <Icon name="copy" size={16} />
            Copy for PR
          </button>
        </div>
      </header>

      {state.pr && (
        <section
          className="wb-review-prbar"
          aria-label="Pull request"
          data-testid="wb-review-pr"
        >
          {!pull && (
            <p className="wb-muted">Reading PR #{state.pr} from GitHub...</p>
          )}
          {pull?.error && (
            <p className="wb-review-prerror">
              PR #{state.pr}: {pull.error}
            </p>
          )}
          {pull?.data && (
            <>
              <p>
                <a href={pull.data.url} target="_blank" rel="noreferrer">
                  #{pull.data.number} {pull.data.title}
                </a>{' '}
                <span className={`wb-chip wb-chip-${pull.data.state}`}>
                  {pull.data.state}
                </span>
              </p>
              <p className="wb-muted">
                {pull.data.changes.commits.length}{' '}
                {pull.data.changes.commits.length === 1 ? 'change' : 'changes'},{' '}
                {summary ? summary.routes.length : '...'}{' '}
                {summary?.routes.length === 1 ? 'page' : 'pages'} reached.
                Before is master on this preview; after is{' '}
                <a href={afterHost} target="_blank" rel="noreferrer">
                  {hostName(afterHost)}
                </a>
                , shown but not inspected (another site). A PR needs the epic
                label for its preview to exist.
              </p>
              {pull.data.changes.warnings.map((w) => (
                <p key={w} className="wb-muted">
                  {w}
                </p>
              ))}
            </>
          )}
        </section>
      )}

      {settings && !state.pr && (
        <section
          className="wb-rsettings"
          aria-label="Hosts"
          data-testid="wb-review-settings"
        >
          <label>
            <span>Platform (After)</span>
            <input
              type="url"
              defaultValue={hosts.after ?? ''}
              placeholder={afterHost}
              onBlur={(e) => {
                const next = {
                  ...hosts,
                  after: validHost(e.target.value) || undefined,
                };
                setHosts(next);
                try {
                  window.localStorage.setItem(HOSTS_KEY, JSON.stringify(next));
                } catch {
                  // Kept for this visit.
                }
              }}
            />
          </label>
          <label>
            <span>Baseline for code changes (Before)</span>
            <input
              type="url"
              defaultValue={hosts.before ?? ''}
              placeholder={fixture.hosts.before || 'https://'}
              onBlur={(e) => {
                const next = {
                  ...hosts,
                  before: validHost(e.target.value) || undefined,
                };
                setHosts(next);
                try {
                  window.localStorage.setItem(HOSTS_KEY, JSON.stringify(next));
                } catch {
                  // Kept for this visit.
                }
              }}
            />
          </label>
          <p className="wb-muted">
            The baseline runs master on other data, so its pages may not line up
            exactly, and ids from this preview may not exist there. Empty fields
            use the route fixture.
          </p>
        </section>
      )}

      {copied && (
        <div
          className={
            copied.ok ? 'wb-heal-text' : 'wb-heal-text wb-heal-text-fail'
          }
          role="status"
          data-testid="wb-review-copied"
        >
          <div className="wb-heal-text-head">
            <span>
              <Icon name={copied.ok ? 'check' : 'copy'} size={14} />
              {copied.ok
                ? 'Copied. Paste it into the pull request.'
                : 'Copying was blocked. Select the text and copy it.'}
            </span>
            <button
              type="button"
              className="wb-heal-close"
              onClick={() => setCopied(undefined)}
              aria-label="Hide the PR text"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
          <pre tabIndex={0}>{copied.text}</pre>
        </div>
      )}

      <section
        className={picked ? 'wb-rstats wb-rstats-strip' : 'wb-rstats'}
        aria-label="Summary"
        data-testid="wb-review-summary"
      >
        <Stat
          label="Design commits"
          value={summary ? fmt(summary.designCommits) : '...'}
          note={
            summary
              ? `${fmt(summary.stories)} stories, ${fmt(
                  summary.tooling
                )} tooling`
              : undefined
          }
          testId="wb-review-design-commits"
        />
        <Stat
          label="Token edits"
          value={fmt(editCount)}
          note={
            summary?.tokenChanges
              ? `${summary.tokenChanges} in the source`
              : 'in this session'
          }
          testId="wb-review-edits"
        />
        <Stat
          label="Components"
          value={summary ? fmt(summary.components.length) : '...'}
          note="healed or lifted"
        />
        <Stat
          label="Routes"
          value={summary ? fmt(summary.routes.length) : '...'}
          note={
            summary?.shellFiles.length
              ? `affected, +${summary.shellFiles.length} shell`
              : 'affected'
          }
          testId="wb-review-routes-stat"
        />
        <Stat
          label="Off-spec"
          value={summary ? fmt(summary.offSpecAfter) : '...'}
          note={
            summary
              ? `${signed(
                  summary.offSpecAfter - summary.offSpecBefore
                )} design${
                  summary.scannerDelta
                    ? ` · ${signed(summary.scannerDelta)} rules`
                    : ''
                }`
              : undefined
          }
          title="Off-spec values now. The first number is what design commits moved; scanner rule changes change what is counted, not the pages."
          testId="wb-review-offspec"
        />
      </section>

      <div
        className={
          wide ? 'wb-review-body wb-review-body-wide' : 'wb-review-body'
        }
        ref={body}
      >
        <aside className="wb-review-side" aria-label="Routes and changes">
          <div className="wb-review-tabs" role="tablist">
            {(['routes', 'changes'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={state.tab === t}
                onClick={() => patch({ tab: t })}
                data-testid={`wb-review-tab-${t}`}
              >
                <Icon name={t === 'routes' ? 'route' : 'file'} size={16} />
                {t === 'routes' ? 'Routes' : 'Changes'}
                <span className="wb-panel-tab-count">
                  {t === 'routes'
                    ? officeCounts.all
                    : `${seenCount}/${changes?.commits.length ?? 0}`}
                </span>
              </button>
            ))}
          </div>
          {loading ? (
            <div className="wb-clist-loading" aria-busy="true">
              <div className="wb-skeleton-line" />
              <div className="wb-skeleton-line" />
              <div className="wb-skeleton-line" />
              <div className="wb-skeleton-line" />
            </div>
          ) : noScan ? (
            <div className="wb-rlist-none">
              <Icon name="route" size={24} />
              <strong>No scan in this build</strong>
              <p>
                Routes come from design-scan.json. Run npm run ds:scan, then
                rebuild.
              </p>
            </div>
          ) : state.tab === 'routes' ? (
            <RouteList
              routes={items}
              officeCounts={officeCounts}
              selected={route}
              onSelect={select}
              office={state.office}
              onOffice={(o) => patch({ office: o })}
              search={search}
              onSearch={setSearch}
              only={state.only}
              onOnly={(on) => patch({ only: on })}
              affectedCount={affected.size}
              components={components}
              component={state.component}
              onComponent={(c) => patch({ component: c })}
              commit={
                commit
                  ? { sha: commit.sha, label: shortSubject(commit.subject) }
                  : undefined
              }
              onClearCommit={clearCommit}
              unmapped={unmapped}
              shell={reach.shellFiles}
              onShellCommits={() => patch({ tab: 'changes' })}
            />
          ) : (
            <ChangeList
              changes={changes}
              loaded={changesLoaded}
              seen={seen}
              onSeen={onSeen}
              onRoutes={openCommit}
              routeCount={routeCount}
              tokenReach={tokenReach}
            />
          )}
        </aside>

        <section
          className="wb-review-stage"
          aria-label="Before and after"
          ref={stage}
        >
          <div className="wb-rtoolbar" role="toolbar" aria-label="Frames">
            <button
              type="button"
              className="wb-icon-button wb-rtoolbar-side"
              onClick={() => setWide((w) => !w)}
              aria-pressed={!wide}
              title={
                wide
                  ? 'Show the route list'
                  : 'Hide the route list for bigger frames'
              }
              aria-label={wide ? 'Show the route list' : 'Hide the route list'}
              data-testid="wb-review-wide"
            >
              <Icon name={wide ? 'menu' : 'split'} size={16} />
            </button>
            <Segmented<ViewportChoice>
              label="Viewport"
              value={viewport}
              onChange={setViewport}
              testId="wb-review-viewport"
              options={VIEWPORTS}
            />
            <label
              className="wb-rtoolbar-field"
              title="What the Before frame shows"
            >
              <span>Before</span>
              <select
                value={beforeSource}
                disabled={!!state.pr}
                onChange={(e) => setBefore(e.target.value as BeforeSource)}
                data-testid="wb-review-before"
              >
                <option value="preview">This preview, edits off</option>
                <option value="baseline" disabled={!beforeHost}>
                  {beforeHost
                    ? `Baseline (${hostName(beforeHost)})`
                    : 'Baseline (not set)'}
                </option>
              </select>
            </label>
            <label
              className="wb-check"
              title={canSync ? undefined : 'Both frames must be on this host'}
            >
              <input
                type="checkbox"
                className="wb-switch"
                checked={sync && canSync}
                disabled={!canSync}
                onChange={(e) => setSync(e.target.checked)}
                data-testid="wb-review-sync"
              />
              <span>Sync scroll</span>
            </label>
            <button
              type="button"
              className="wb-icon-button wb-rtoolbar-reload"
              onClick={reload}
              title="Reload both frames"
              aria-label="Reload both frames"
              disabled={!afterUrl}
            >
              <Icon name="reset" size={16} />
            </button>
          </div>

          {route !== undefined && (
            <div className="wb-rcurrent" data-testid="wb-review-current">
              <RoutePath path={route} />
              {office(route) && (
                <span className={`wb-ochip wb-ochip-${office(route)}`}>
                  {OFFICE_LABEL[office(route) as Office]}
                </span>
              )}
              {affected.has(route) && (
                <span className="wb-rrow-changed">
                  <span className="wb-diff-dot" aria-hidden="true" />
                  Changed on this branch
                </span>
              )}
              <span
                className={`wb-login wb-login-${login}`}
                data-testid="wb-review-login"
              >
                {login === 'admin'
                  ? 'Signed in as admin'
                  : login === 'user'
                  ? 'Signed in, not an admin'
                  : login === 'out'
                  ? 'Signed out'
                  : ''}
              </span>
            </div>
          )}

          {needsLogin && (
            <p className="wb-rbanner" role="status" data-testid="wb-login-hint">
              <Icon name="link" size={16} />
              <span>
                {login === 'admin'
                  ? 'The platform sent this page somewhere else. The record in the route may not exist on this platform: check routes.fixture.json.'
                  : `${
                      login === 'out'
                        ? 'Signed out, so this shows the home or sign-in page.'
                        : 'This page needs a platform login with admin rights.'
                    } Log in in a new tab, then reload.`}
              </span>
              {login !== 'admin' && (
                <a
                  className="wb-button"
                  href={loginUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Log in
                  <Icon name="external" size={14} />
                </a>
              )}
              <button type="button" className="wb-button" onClick={reload}>
                Reload
              </button>
            </p>
          )}

          {route === undefined || (!known && indexes.hasScan) ? (
            <div className="wb-rempty" data-testid="wb-review-empty">
              <PlaceholderArt kind="review" />
              <div>
                <h2>
                  {route === undefined
                    ? 'Pick a route to compare'
                    : 'This route is not in the scan'}
                </h2>
                <p className="wb-muted">
                  {route === undefined && state.pr
                    ? `The page opens twice: Before on master, After on PR #${state.pr}'s preview. Pages the PR reaches come first.`
                    : route === undefined
                    ? 'The page opens twice: Before with your edits off, After with them on. Scroll one and the other follows.'
                    : `No scanned route is called /${route}. Pick one from the list.`}
                </p>
                <div className="wb-rempty-picks">
                  {[
                    ...new Set([
                      ...affected,
                      ...SUGGESTED.filter((p) =>
                        scan?.routes.some((r) => r.path === p)
                      ),
                    ]),
                  ]
                    .slice(0, 4)
                    .map((p) => (
                      <button
                        key={p}
                        type="button"
                        className="wb-button"
                        onClick={() => select(p)}
                        data-testid="wb-review-pick"
                      >
                        <RoutePath path={p} />
                        <Icon name="arrow" size={14} />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : unfilled.length > 0 ? (
            <div
              className="wb-rempty wb-rempty-record"
              data-testid="wb-review-needs-record"
            >
              <div className="wb-rempty-icon">
                <Icon name="file" size={28} />
              </div>
              <div>
                <span className="wb-rrow-record">Needs a record</span>
                <h2>This route needs a record to open</h2>
                <p className="wb-muted">
                  The test tenant has no public record for{' '}
                  {unfilled.map((p, i) => (
                    <span key={p}>
                      {i > 0 && ', '}
                      <code>${p}</code>
                    </span>
                  ))}
                  . Add an id to <code>routes.fixture.json</code> (under{' '}
                  <code>params</code>, or <code>paths</code> for this route
                  only), or run <code>npm run ds:routes-fixture</code> while the
                  records exist.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="wb-rframes"
              data-show={shown}
              data-testid="wb-review-frames"
            >
              <div className="wb-rframes-switch">
                <Segmented<'before' | 'after'>
                  label="Frame"
                  value={shown}
                  onChange={setShown}
                  testId="wb-review-show"
                  options={[
                    { value: 'before', label: 'Before' },
                    { value: 'after', label: 'After' },
                  ]}
                />
              </div>
              <FrameView
                side="before"
                caption={beforeCaption}
                url={beforeUrl}
                route={route}
                width={vpW}
                height={vpH}
                onReport={onReportBefore}
                onWindow={onWindowBefore}
                reloadKey={reloadKey}
              />
              <FrameView
                side="after"
                caption={afterCaption}
                url={afterUrl}
                route={route}
                width={vpW}
                height={vpH}
                edits={edits}
                onReport={onReportAfter}
                onWindow={onWindowAfter}
                reloadKey={reloadKey}
              />
            </div>
          )}
        </section>
      </div>
    </article>
  );
};

export default Review;
