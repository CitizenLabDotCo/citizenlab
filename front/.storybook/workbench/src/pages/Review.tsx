import { useEffect, useMemo, useState } from 'react';

import Icon from '../components/Icon';
import { copyText } from '../lib/clipboard';
import {
  loadChanges,
  loadRouteFixture,
  loadScan,
  ScanOutput,
} from '../lib/data';
import { loadPullHeader, PullHeader, REPO } from '../lib/pr';
import {
  alsoInPr,
  designChanges,
  forOrigin,
  liveParams,
  pictures,
  plainSubject,
  prOfHost,
  prText,
  routeLinks,
} from '../lib/prReview';
import {
  ChangeCommit,
  commitReach,
  DesignChanges,
  normaliseFixture,
  RouteFixture,
  shellFiles,
} from '../lib/review';
import { PlaceholderArt } from './Placeholder';

const REPO_URL = `https://github.com/${REPO}`;
const PR_CACHE = 'gv-review-pr';
const PR_CACHE_MS = 10 * 60 * 1000;
const ROUTES_SHOWN = 4;

const KIND_LABEL: Record<string, string> = {
  heal: 'Heal',
  lift: 'Lift',
  token: 'Token',
};

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

// The PR header, read once per session per PR (GitHub allows 60 reads an
// hour from one address).
const cachedPull = (n: number): PullHeader | undefined => {
  try {
    const raw = JSON.parse(
      window.sessionStorage.getItem(`${PR_CACHE}:${n}`) ?? 'null'
    );
    return raw && Date.now() - raw.at < PR_CACHE_MS ? raw.data : undefined;
  } catch {
    return undefined;
  }
};

const keepPull = (data: PullHeader) => {
  try {
    window.sessionStorage.setItem(
      `${PR_CACHE}:${data.number}`,
      JSON.stringify({ at: Date.now(), data })
    );
  } catch {
    // Read again next time.
  }
};

type Shot = 'loading' | 'ok' | 'missing';

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });

const pixelsOf = (img: HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
};

// Equal sizes and equal pixels: the change does not show.
const sameImages = (a: HTMLImageElement, b: HTMLImageElement) => {
  if (a.naturalWidth !== b.naturalWidth) return false;
  if (a.naturalHeight !== b.naturalHeight) return false;
  const pa = pixelsOf(a);
  const pb = pixelsOf(b);
  if (!pa || !pb || pa.length !== pb.length) return false;
  for (let i = 0; i < pa.length; i++) if (pa[i] !== pb[i]) return false;
  return true;
};

// Before and after pictures of one change, taken by the agent that made it.
const Pictures = ({ sha }: { sha: string }) => {
  const urls = pictures(sha);
  const [state, setState] = useState<Shot>('loading');
  const [same, setSame] = useState(false);
  useEffect(() => {
    let live = true;
    setState('loading');
    Promise.all([loadImage(urls.before), loadImage(urls.after)]).then(
      ([a, b]) => {
        if (!live) return;
        setSame(sameImages(a, b));
        setState('ok');
      },
      () => live && setState('missing')
    );
    return () => {
      live = false;
    };
  }, [urls.before, urls.after]);

  if (state === 'missing') {
    return (
      <p className="wb-pr-noshots" data-testid="wb-pr-noshots">
        <Icon name="alert" size={16} />
        No pictures for this change.
      </p>
    );
  }
  return (
    <div className="wb-pr-shots" data-state={state} data-same={same}>
      {same && (
        <p className="wb-pr-same" data-testid="wb-pr-same">
          <Icon name="check" size={14} />
          No visual change
        </p>
      )}
      {(['before', 'after'] as const).map((side) => (
        <figure key={side} className={`wb-pr-shot wb-pr-shot-${side}`}>
          <figcaption>{side === 'before' ? 'Before' : 'After'}</figcaption>
          <a href={urls[side]} target="_blank" rel="noreferrer">
            <img
              src={urls[side]}
              alt={`${side === 'before' ? 'Before' : 'After'} the change`}
              loading="lazy"
              data-testid={`wb-pr-shot-${side}`}
            />
          </a>
        </figure>
      ))}
    </div>
  );
};

const Card = ({
  index,
  commit,
  scan,
  fixture,
  shell,
}: {
  index: number;
  commit: ChangeCommit;
  scan?: ScanOutput;
  fixture: RouteFixture;
  shell: Set<string>;
}) => {
  const [all, setAll] = useState(false);
  const origin = window.location.origin;
  const links = useMemo(
    () => (scan ? routeLinks(scan, commit, fixture, origin, shell) : []),
    [scan, commit, fixture, origin, shell]
  );
  const everyPage = useMemo(
    () => (scan ? commitReach(scan, commit, shell).shell : false),
    [scan, commit, shell]
  );
  const shown = all ? links : links.slice(0, ROUTES_SHOWN);
  const body = commit.body
    .split(/\n\s*\n/)[0]
    ?.replace(/\n/g, ' ')
    .trim();

  return (
    <li className="wb-pr-card" data-testid="wb-pr-card" data-sha={commit.sha}>
      <header className="wb-pr-card-head">
        <span className="wb-pr-num" aria-hidden="true">
          {index + 1}
        </span>
        <div>
          <h2>{plainSubject(commit.subject)}</h2>
          <p className="wb-pr-meta">
            <span className="wb-chip">{KIND_LABEL[commit.kind]}</span>
            {commit.component && (
              <span className="wb-chip">{commit.component}</span>
            )}
            <a
              href={`${REPO_URL}/commit/${commit.sha}`}
              target="_blank"
              rel="noreferrer"
              className="wb-pr-sha"
            >
              {commit.sha.slice(0, 7)}
              <Icon name="external" size={12} />
            </a>
          </p>
          {body && <p className="wb-pr-body">{body}</p>}
        </div>
      </header>

      <Pictures sha={commit.sha} />

      <div className="wb-pr-pages" aria-label="See on the platform">
        <h3>
          <Icon name="route" size={14} />
          See on the platform
        </h3>
        {everyPage && (
          <p className="wb-muted">Changes a file every page loads.</p>
        )}
        {!scan ? (
          <p className="wb-muted">No scan in this build.</p>
        ) : links.length === 0 ? (
          !everyPage && <p className="wb-muted">No page found for it.</p>
        ) : (
          <ul>
            {shown.map((l) => (
              <li key={l.path}>
                {l.url ? (
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="wb-pr-page"
                  >
                    <code>/{l.path}</code>
                    <Icon name="external" size={12} />
                  </a>
                ) : (
                  <span
                    className="wb-pr-page-off"
                    title="This platform has no record for it"
                  >
                    <code>/{l.path}</code>
                  </span>
                )}
              </li>
            ))}
            {links.length > ROUTES_SHOWN && (
              <li>
                <button
                  type="button"
                  className="wb-pr-more"
                  onClick={() => setAll((a) => !a)}
                  aria-expanded={all}
                >
                  {all ? 'Fewer' : `and ${links.length - ROUTES_SHOWN} more`}
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </li>
  );
};

// The Review page: the PR this epic serves. Its design changes, each with
// the agent's before and after pictures and the pages it reaches here.
const Review = () => {
  const pr = prOfHost(window.location.hostname);
  const [pull, setPull] = useState<{ data?: PullHeader; error?: string }>(
    () => {
      const data = pr ? cachedPull(pr) : undefined;
      return data ? { data } : {};
    }
  );
  const [changes, setChanges] = useState<DesignChanges | undefined>();
  const [loaded, setLoaded] = useState(false);
  const [scan, setScan] = useState<ScanOutput | undefined>();
  const [fixture, setFixture] = useState<RouteFixture>(() =>
    normaliseFixture({})
  );
  const [copied, setCopied] = useState<{ text: string; ok: boolean }>();

  useEffect(() => {
    if (!pr || pull.data) return undefined;
    let live = true;
    loadPullHeader(pr).then(
      (data) => {
        keepPull(data);
        if (live) setPull({ data });
      },
      (e: Error) => live && setPull({ error: e.message })
    );
    return () => {
      live = false;
    };
  }, [pr, pull.data]);

  useEffect(() => {
    let live = true;
    loadChanges().then((c) => {
      if (!live) return;
      setChanges(
        Array.isArray((c as Partial<DesignChanges>).commits)
          ? (c as unknown as DesignChanges)
          : undefined
      );
      setLoaded(true);
    });
    loadScan().then((s) => live && setScan(s.routes.length ? s : undefined));
    loadRouteFixture().then(async (raw) => {
      const f = normaliseFixture(raw);
      const origin = window.location.origin;
      const own = forOrigin(f, origin, {}) === f;
      const params = own ? {} : await liveParams(origin);
      if (live) setFixture(forOrigin(f, origin, params));
    });
    return () => {
      live = false;
    };
  }, []);

  const cards = useMemo(() => designChanges(changes), [changes]);
  const also = useMemo(() => alsoInPr(changes), [changes]);
  const shell = useMemo(
    () => (scan ? shellFiles(scan) : new Set<string>()),
    [scan]
  );

  const copyForPr = async () => {
    const { origin, pathname } = window.location;
    const text = prText(
      pull.data,
      cards,
      `${origin}${pathname}#/review`,
      changes?.repoUrl ?? REPO_URL
    );
    setCopied({ text, ok: await copyText(text) });
  };

  const alsoParts = [
    also.setup.length &&
      plural(also.setup.length, 'setup commit', 'setup commits'),
    also.stories && plural(also.stories, 'story commit', 'story commits'),
    also.tooling && plural(also.tooling, 'tooling commit', 'tooling commits'),
  ].filter(Boolean);

  return (
    <article className="wb-review" data-testid="wb-review">
      <header className="wb-review-head">
        <div>
          <p className="wb-eyebrow">Pull request</p>
          <h1>Review</h1>
          <div className="wb-pr-bar" data-testid="wb-review-pr">
            {!pr ? (
              <p className="wb-muted">
                No PR here: each PR&apos;s epic shows its own Review. This is
                the branch as built.
              </p>
            ) : pull.data ? (
              <p>
                <Icon name="pullRequest" size={16} />
                <a href={pull.data.url} target="_blank" rel="noreferrer">
                  #{pull.data.number} {pull.data.title}
                </a>
                <span className={`wb-chip wb-pr-state-${pull.data.state}`}>
                  {pull.data.state}
                </span>
                <span className="wb-muted">into {pull.data.base}</span>
              </p>
            ) : pull.error ? (
              <p className="wb-pr-error">
                PR #{pr}: {pull.error}
              </p>
            ) : (
              <p className="wb-muted">Reading PR #{pr} from GitHub...</p>
            )}
          </div>
        </div>
        <div className="wb-review-actions">
          <button
            type="button"
            className="wb-button wb-button-primary"
            onClick={copyForPr}
            disabled={!loaded}
            data-testid="wb-review-copy"
          >
            <Icon name="copy" size={16} />
            Copy for PR
          </button>
        </div>
      </header>

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
                ? 'Copied. Paste it at the top of the PR description.'
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

      <section className="wb-pr-count" aria-label="Summary">
        <p>
          <strong data-testid="wb-review-count">
            {loaded ? cards.length : '...'}
          </strong>
          <span>
            {cards.length === 1 ? 'change' : 'changes'} to the platform
          </span>
        </p>
        {loaded && (
          <p className="wb-muted" data-testid="wb-review-also">
            {changes?.baseRef ? `Since ${changes.baseRef}. ` : ''}
            {alsoParts.length
              ? `Also in this PR: ${alsoParts.join(', ')}.`
              : ''}
          </p>
        )}
        {also.setup.length > 0 && (
          <ul className="wb-pr-setup">
            {also.setup.map((c) => (
              <li key={c.sha}>
                <Icon name="file" size={14} />
                {plainSubject(c.subject)}{' '}
                <a
                  href={`${REPO_URL}/commit/${c.sha}`}
                  target="_blank"
                  rel="noreferrer"
                  className="wb-pr-sha"
                >
                  {c.sha.slice(0, 7)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!loaded ? (
        <div className="wb-pr-loading" aria-busy="true">
          <div className="wb-skeleton-line" />
          <div className="wb-skeleton-line" />
        </div>
      ) : cards.length === 0 ? (
        <div className="wb-pr-empty" data-testid="wb-review-empty">
          <PlaceholderArt kind="review" />
          <div>
            <h2>No design changes in this PR</h2>
            <p className="wb-muted">
              Edits made in the workbench reach this page once an agent turns
              them into commits on the PR&apos;s branch: open the Changes drawer
              on a component and use Copy for agent.
            </p>
          </div>
        </div>
      ) : (
        <ol className="wb-pr-cards">
          {cards.map((c, i) => (
            <Card
              key={c.sha}
              index={i}
              commit={c}
              scan={scan}
              fixture={fixture}
              shell={shell}
            />
          ))}
        </ol>
      )}
    </article>
  );
};

export default Review;
