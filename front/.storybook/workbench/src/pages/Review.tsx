import { FormEvent, useEffect, useMemo, useState } from 'react';

import type { TokenName } from '@ds/tokens/tokens';

import Canvas from '../components/Canvas';
import Icon from '../components/Icon';
import type { ToolbarState } from '../components/Toolbar';
import { copyText } from '../lib/clipboard';
import { fileFindings } from '../lib/componentPanels';
import {
  loadChanges,
  loadRouteFixture,
  loadScan,
  ScanOutput,
  TOKEN_META,
} from '../lib/data';
import { ElementEdit, TaskContext, taskOfEdit } from '../lib/elementEdits';
import { storyHash } from '../lib/hash';
import { shortName } from '../lib/inspect';
import { tokenSource } from '../lib/liveSource';
import type { Overrides } from '../lib/overrides';
import {
  agentText,
  byStory,
  designChanges,
  forOrigin,
  liveParams,
  pictures,
  plainSubject,
  prOfHost,
  REPO_URL,
  routeLinks,
} from '../lib/prReview';
import {
  ChangeCommit,
  DesignChanges,
  normaliseFixture,
  RouteFixture,
} from '../lib/review';
import { sourceChanges, sourcePatch } from '../lib/sourceDiff';
import { groupOfStory, StoryGroup } from '../lib/stories';
import { useElementEdits } from '../lib/useElementEdits';
import { useStoryGroups } from '../lib/useStoryGroups';

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

// The agent's before and after pictures of one change; one picture when
// the two are the same.
const Pictures = ({ sha }: { sha: string }) => {
  const urls = pictures(sha);
  const [state, setState] = useState<'loading' | 'diff' | 'same' | 'none'>(
    'loading'
  );
  useEffect(() => {
    let live = true;
    Promise.all([loadImage(urls.before), loadImage(urls.after)]).then(
      ([a, b]) => live && setState(sameImages(a, b) ? 'same' : 'diff'),
      () => live && setState('none')
    );
    return () => {
      live = false;
    };
  }, [urls.before, urls.after]);

  if (state === 'loading') return null;
  if (state === 'none') {
    return (
      <p className="wb-muted" data-testid="wb-pr-noshots">
        No pictures.
      </p>
    );
  }
  const shots =
    state === 'same'
      ? [{ src: urls.after, label: 'No visual change' }]
      : [
          { src: urls.before, label: 'Before' },
          { src: urls.after, label: 'After' },
        ];
  return (
    <div className="wb-pr-shots" data-same={state === 'same'}>
      {shots.map((s) => (
        <figure key={s.label} className="wb-pr-shot">
          <img src={s.src} alt={s.label} />
          <figcaption>{s.label}</figcaption>
        </figure>
      ))}
    </div>
  );
};

const Card = ({
  commit,
  scan,
  fixture,
}: {
  commit: ChangeCommit;
  scan?: ScanOutput;
  fixture: RouteFixture;
}) => {
  const page = useMemo(
    () =>
      scan
        ? routeLinks(scan, commit, fixture, window.location.origin).find(
            (l) => l.url
          )
        : undefined,
    [scan, commit, fixture]
  );
  return (
    <li className="wb-pr-card" data-testid="wb-pr-card" data-sha={commit.sha}>
      <div className="wb-pr-line">
        <h2>{plainSubject(commit.subject)}</h2>
        {page && (
          <a
            href={page.url}
            target="_blank"
            rel="noreferrer"
            title={`/${page.path}`}
            data-testid="wb-pr-page"
          >
            Open on the platform
            <Icon name="external" size={12} />
          </a>
        )}
        <a
          href={`${REPO_URL}/commit/${commit.sha}`}
          target="_blank"
          rel="noreferrer"
        >
          {commit.sha.slice(0, 7)}
          <Icon name="external" size={12} />
        </a>
      </div>
      <Pictures sha={commit.sha} />
    </li>
  );
};

const NO_TOKENS: Overrides = {};

// The PR this browser's changes go to, typed in once ("Connect PR").
const PR_KEY = 'gv-review-pr';

const readPr = (): number | undefined => {
  try {
    const n = Number(window.localStorage.getItem(PR_KEY));
    return Number.isInteger(n) && n > 0 ? n : undefined;
  } catch {
    return undefined;
  }
};

const keepPr = (n?: number) => {
  try {
    if (n) window.localStorage.setItem(PR_KEY, String(n));
    else window.localStorage.removeItem(PR_KEY);
  } catch {
    // Connected for this visit only.
  }
};

const epicReview = (n: number) =>
  `https://pr-${n}.epic.hq.govocal.com/storybook/workbench/#/review`;

// One component changed in this browser: its edits, then the story as it
// is and with the edits painted on (the same canvas the component page has).
const Draft = ({
  storyId,
  edits,
  group,
  toolbar,
  overrides,
  onReset,
}: {
  storyId: string;
  edits: ElementEdit[];
  group?: StoryGroup;
  toolbar: ToolbarState;
  overrides: Overrides;
  onReset: () => void;
}) => (
  <li className="wb-pr-card" data-testid="wb-review-draft" data-story={storyId}>
    <div className="wb-pr-line">
      <h2>{group?.name ?? storyId}</h2>
      <a href={storyHash(group?.section ?? 'components', storyId)}>Edit</a>
      <button type="button" className="wb-review-reset" onClick={onReset}>
        Reset
      </button>
    </div>
    <ul className="wb-review-edits">
      {edits.map((e) => (
        <li key={e.id}>
          {e.label}{' '}
          <span className="wb-muted">
            {e.from.token ? shortName(e.from.token) : e.from.shown}
          </span>
          {' → '}
          <strong>{e.to.token ? shortName(e.to.token) : e.to.value}</strong>
        </li>
      ))}
    </ul>
    <div className="wb-pr-shots">
      <figure className="wb-pr-shot">
        <Canvas storyId={storyId} toolbar={toolbar} overrides={NO_TOKENS} />
        <figcaption>Before</figcaption>
      </figure>
      <figure className="wb-pr-shot">
        <Canvas
          storyId={storyId}
          toolbar={toolbar}
          overrides={overrides}
          elementEdits={edits}
        />
        <figcaption>After</figcaption>
      </figure>
    </div>
  </li>
);

type Props = {
  toolbar: ToolbarState;
  overrides: Overrides;
  reset: (name?: TokenName) => void;
};

// The Review page: the changes collected in this browser, live, before and
// after, with the way to hand them to an agent for a PR; then what the PR
// this epic serves already changes on the platform.
const Review = ({ toolbar, overrides, reset }: Props) => {
  const hostPr = prOfHost(window.location.hostname);
  const [changes, setChanges] = useState<DesignChanges | undefined>();
  const [scan, setScan] = useState<ScanOutput | undefined>();
  const [fixture, setFixture] = useState<RouteFixture>(() =>
    normaliseFixture({})
  );
  const groups = useStoryGroups();
  const { edits, remove } = useElementEdits(TOKEN_META);
  const [storedPr, setStoredPr] = useState(readPr);
  const [asking, setAsking] = useState(false);
  const [copied, setCopied] = useState<string | undefined>();

  useEffect(() => {
    let live = true;
    loadChanges().then((c) => {
      if (!live) return;
      setChanges(
        Array.isArray((c as Partial<DesignChanges>).commits)
          ? (c as unknown as DesignChanges)
          : undefined
      );
    });
    loadScan().then((s) => live && setScan(s));
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
  const drafts = useMemo(() => byStory(edits), [edits]);
  const tokens = Object.entries(overrides).filter(
    (e): e is [string, string] => typeof e[1] === 'string'
  );
  const count = edits.length + tokens.length;
  // A copied text goes stale as soon as the changes do.
  useEffect(() => setCopied(undefined), [edits, overrides]);
  // This epic's own PR, once it carries changes, else the one typed in.
  const pr = storedPr ?? (hostPr && cards.length > 0 ? hostPr : undefined);
  const routed = scan?.routes.length ? scan : undefined;
  const frame: ToolbarState = { ...toolbar, viewport: 'fit', zoom: 'fit' };

  const copy = async () => {
    const tasks = drafts.flatMap(([storyId, list]) => {
      const g = groups ? groupOfStory(groups, storyId) : undefined;
      const ctx: TaskContext = {
        component: g?.score?.component ?? g?.name ?? storyId,
        file: g?.file,
        storyId,
        routes: g?.score?.routes ?? [],
        layer: '',
        findings: scan && g?.file ? fileFindings(scan, g.file) : [],
      };
      return list.map((e) => taskOfEdit(e, ctx));
    });
    const diff = sourceChanges(overrides, TOKEN_META, tokenSource());
    const text = agentText(
      pr,
      tasks,
      diff.changes.length ? sourcePatch(diff.changes) : ''
    );
    setCopied((await copyText(text)) ? 'ok' : text);
  };

  const connect = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const n = Number(new FormData(e.currentTarget).get('pr'));
    if (!Number.isInteger(n) || n <= 0) return;
    keepPr(n);
    setStoredPr(n);
    setAsking(false);
  };

  const disconnect = () => {
    keepPr();
    setStoredPr(undefined);
  };

  return (
    <article className="wb-review" data-testid="wb-review">
      <header className="wb-review-head">
        <div>
          <h1>Review</h1>
          <p className="wb-review-sum" data-testid="wb-review-pr">
            <strong data-testid="wb-review-count">{count}</strong>{' '}
            {count === 1 ? 'change' : 'changes'}
            {' · '}
            {pr ? (
              <>
                <a
                  href={`${REPO_URL}/pull/${pr}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  PR #{pr}
                </a>
                {pr !== hostPr && (
                  <>
                    {' · '}
                    <a href={epicReview(pr)} target="_blank" rel="noreferrer">
                      its Review
                    </a>
                  </>
                )}
                {storedPr && (
                  <button
                    type="button"
                    className="wb-review-reset"
                    onClick={disconnect}
                  >
                    Disconnect
                  </button>
                )}
              </>
            ) : (
              'not in a PR yet'
            )}
          </p>
        </div>
        <div className="wb-review-actions">
          <button
            type="button"
            className="wb-button wb-button-primary"
            onClick={copy}
            disabled={count === 0}
            data-testid="wb-review-copy"
          >
            <Icon name={copied === 'ok' ? 'check' : 'copy'} size={16} />
            {copied === 'ok' ? 'Copied' : 'Copy for agent'}
          </button>
          {!pr &&
            (asking ? (
              <form className="wb-review-connect" onSubmit={connect}>
                <input
                  name="pr"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="PR number"
                  aria-label="PR number"
                  autoFocus
                />
                <button type="submit" className="wb-button">
                  Connect
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="wb-button"
                onClick={() => setAsking(true)}
              >
                Connect PR
              </button>
            ))}
        </div>
      </header>

      {copied && copied !== 'ok' && (
        <pre className="wb-review-text" tabIndex={0}>
          {copied}
        </pre>
      )}

      {count === 0 && cards.length === 0 && (
        <p className="wb-muted" data-testid="wb-review-empty">
          Change something in a component and it shows here.
        </p>
      )}

      {count > 0 && (
        <ol className="wb-pr-cards">
          {drafts.map(([storyId, list]) => (
            <Draft
              key={storyId}
              storyId={storyId}
              edits={list}
              group={groups ? groupOfStory(groups, storyId) : undefined}
              toolbar={frame}
              overrides={overrides}
              onReset={() => list.forEach((e) => remove(e.id))}
            />
          ))}
          {tokens.length > 0 && (
            <li className="wb-pr-card" data-testid="wb-review-tokens">
              <div className="wb-pr-line">
                <h2>Tokens</h2>
                <button
                  type="button"
                  className="wb-review-reset"
                  onClick={() => reset()}
                >
                  Reset
                </button>
              </div>
              <ul className="wb-review-edits">
                {tokens.map(([name, value]) => (
                  <li key={name}>
                    {shortName(name)}{' '}
                    <span className="wb-muted">
                      {TOKEN_META.find((t) => t.name === name)?.value}
                    </span>
                    {' → '}
                    <strong>{value}</strong>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ol>
      )}

      {cards.length > 0 && (
        <section className="wb-review-pr" aria-label="In the PR">
          <h2>
            {hostPr ? `In PR #${hostPr}` : 'On this branch'} · {cards.length}
          </h2>
          <ol className="wb-pr-cards">
            {cards.map((c) => (
              <Card key={c.sha} commit={c} scan={routed} fixture={fixture} />
            ))}
          </ol>
        </section>
      )}
    </article>
  );
};

export default Review;
