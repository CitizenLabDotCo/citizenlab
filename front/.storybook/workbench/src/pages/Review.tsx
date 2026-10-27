import { useEffect, useMemo, useState } from 'react';

import type { TokenName } from '@ds/tokens/tokens';

import Canvas from '../components/Canvas';
import Icon from '../components/Icon';
import SendForReview, { sendLine } from '../components/SendForReview';
import type { ToolbarState } from '../components/Toolbar';
import { fileFindings } from '../lib/componentPanels';
import { resolveTokens } from '../lib/contrast';
import {
  loadChanges,
  loadRouteFixture,
  loadScan,
  ScanOutput,
  TOKEN_META,
} from '../lib/data';
import {
  candidatesOf,
  changesLook,
  ElementEdit,
  subjectOfEdit,
  TaskContext,
  taskOfEdit,
  wordsOfEdit,
} from '../lib/elementEdits';
import { storyHash } from '../lib/hash';
import { shortName } from '../lib/inspect';
import { tokenSource } from '../lib/liveSource';
import type { Overrides } from '../lib/overrides';
import {
  areasOfProps,
  areasOfText,
  byStory,
  designChanges,
  forOrigin,
  liveParams,
  loadPrChanges,
  pictures,
  plainSubject,
  prOfHost,
  KIND_WORDS,
  REPO_URL,
  routeLinks,
  scaleText,
} from '../lib/prReview';
import {
  ChangeCommit,
  commitReach,
  DesignChanges,
  normaliseFixture,
  RouteFixture,
} from '../lib/review';
import {
  currentOf,
  epicReviewUrl,
  isDone,
  Item,
  previewOrigin,
  prUrl,
  undoOfEdit,
  undoOfToken,
  WORKBENCH_PR,
} from '../lib/send';
import { sourceChanges, sourcePatch } from '../lib/sourceDiff';
import { groupOfStory, StoryGroup } from '../lib/stories';
import { DEFS } from '../lib/tokenValues';
import { useElementEdits } from '../lib/useElementEdits';
import { usePreviewState, useReviewWatch, useSendRecord } from '../lib/useSend';
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

const storyPath = (story: string) =>
  `iframe.html?id=${encodeURIComponent(story)}&viewMode=story`;

// A change's story live, twice: as the workbench's own preview renders it
// (before) and as this review's preview does (after). Both are signed in
// by the same epic gateway; 2× shows a pixel's change.
const Live = ({ story }: { story: string }) => {
  const [zoom, setZoom] = useState(false);
  const before = `${previewOrigin(WORKBENCH_PR)}/storybook/${storyPath(story)}`;
  const after = new URL(`../${storyPath(story)}`, window.location.href).href;
  return (
    <div className="wb-pr-live" data-zoom={zoom} data-testid="wb-pr-live">
      <div className="wb-pr-shots">
        {[
          { src: before, label: 'Before' },
          { src: after, label: 'After' },
        ].map((s) => (
          <figure key={s.label} className="wb-pr-shot">
            <div className="wb-pr-frame">
              <iframe
                src={s.src}
                title={`${s.label}: ${story}`}
                loading="lazy"
              />
            </div>
            <figcaption>
              <a href={s.src} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
      <button
        type="button"
        className="wb-review-reset"
        aria-pressed={zoom}
        onClick={() => setZoom((z) => !z)}
      >
        {zoom ? 'Actual size' : 'Zoom 2×'}
      </button>
    </div>
  );
};

// One line under a card's title for the developer: what kind of change, what
// it touches, how far it reaches.
const Meta = ({
  kind,
  areas,
  scale,
}: {
  kind?: string;
  areas: string[];
  scale: string;
}) => {
  const rest = [...areas, scale].filter(Boolean).join(' · ');
  if (!kind && !rest) return null;
  return (
    <p className="wb-review-meta" data-testid="wb-review-meta">
      {kind && (
        <span className="wb-review-kind" data-same={kind === 'Same look'}>
          {kind}
        </span>
      )}
      {rest}
    </p>
  );
};

const Card = ({
  commit,
  scan,
  fixture,
  live,
}: {
  commit: ChangeCommit;
  scan?: ScanOutput;
  fixture: RouteFixture;
  // A review's own preview: its story shows live beside the workbench's.
  live: boolean;
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
  const scale = useMemo(() => {
    const reach = scan ? commitReach(scan, commit) : undefined;
    const score = scan?.components.find(
      (c) => c.component === commit.component
    );
    return scaleText(
      commit.component,
      score?.usageCount,
      reach?.routes.size ?? 0,
      reach?.shell
    );
  }, [scan, commit]);
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
      <Meta
        kind={KIND_WORDS[commit.kind]}
        areas={areasOfText(commit.subject)}
        scale={scale}
      />
      {live && commit.story ? (
        <Live story={commit.story} />
      ) : (
        <Pictures sha={commit.sha} />
      )}
    </li>
  );
};

const NO_TOKENS: Overrides = {};

// One component changed in this browser: its edits, then the story as it
// is and with the edits painted on (the same canvas the component page has).
const Draft = ({
  storyId,
  edits,
  group,
  toolbar,
  overrides,
  resolve,
  onReset,
}: {
  storyId: string;
  edits: ElementEdit[];
  group?: StoryGroup;
  toolbar: ToolbarState;
  overrides: Overrides;
  resolve: (token: TokenName) => string;
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
    <Meta
      kind={
        edits.some((e) => changesLook(e, resolve)) ? 'Look change' : 'Same look'
      }
      areas={areasOfProps(edits.flatMap((e) => e.props))}
      scale={scaleText(
        group?.score?.component,
        group?.score?.usageCount,
        group?.score?.routes.length ?? 0
      )}
    />
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
// after, with Send for review (the text for the person's agent, then where
// the review stands on GitHub); then what the PR this epic serves already
// changes on the platform.
const Review = ({ toolbar, overrides, reset }: Props) => {
  const hostPr = prOfHost(window.location.hostname);
  const [changes, setChanges] = useState<DesignChanges | undefined>();
  const [scan, setScan] = useState<ScanOutput | undefined>();
  const [fixture, setFixture] = useState<RouteFixture>(() =>
    normaliseFixture({})
  );
  const groups = useStoryGroups();
  const { edits, remove } = useElementEdits(TOKEN_META);
  const { record, update } = useSendRecord();
  const answering = useReviewWatch(record, update);
  const preview = usePreviewState(record.pr, isDone(record.status));

  useEffect(() => {
    let live = true;
    // A PR stacked on the workbench reads its commits from GitHub; the
    // workbench, a local run or a GitHub that does not answer read the
    // committed design-changes.json.
    (hostPr ? loadPrChanges(hostPr) : Promise.resolve(undefined))
      .then((pr) => pr ?? loadChanges())
      .then((c) => {
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
  const live = useMemo(() => resolveTokens(DEFS, overrides), [overrides]);
  const drafts = useMemo(() => byStory(edits), [edits]);
  const tokens = Object.entries(overrides).filter(
    (e): e is [string, string] => typeof e[1] === 'string'
  );
  const count = edits.length + tokens.length;
  const current = useMemo(
    () => currentOf(edits, overrides),
    [edits, overrides]
  );
  const line = sendLine(record, count);
  const routed = scan?.routes.length ? scan : undefined;
  const frame: ToolbarState = { ...toolbar, viewport: 'fit', zoom: 'fit' };
  const groupOf = (storyId: string) =>
    groups ? groupOfStory(groups, storyId) : undefined;

  // Every change of this browser with its task for the agent and the line
  // that puts it back; tokens go in the patch, not as tasks. An attached
  // token also names the findings it can stand for, so the Send window can
  // read the file and write the exact line edit.
  const items = (): Item[] => [
    ...drafts.flatMap(([storyId, list]) => {
      const g = groupOf(storyId);
      const ctx: TaskContext = {
        component: g?.score?.component ?? g?.name ?? storyId,
        file: g?.file,
        storyId,
        routes: g?.score?.routes ?? [],
        layer: '',
        findings: scan && g?.file ? fileFindings(scan, g.file) : [],
      };
      return list.map((e): Item => {
        const file = e.file ?? ctx.file;
        const candidates =
          (e.kind === 'attach' || e.kind === 'file') && e.to.token && file
            ? candidatesOf(e, ctx)
            : [];
        return {
          key: e.id,
          value: e.to.token ?? e.to.value,
          task: taskOfEdit(e, ctx),
          undo: undoOfEdit(e, ctx.component, file),
          ...(candidates.length && e.to.token && file
            ? {
                source: {
                  file,
                  story: storyId,
                  subject: subjectOfEdit(
                    e,
                    ctx.component,
                    changesLook(e, (t) => live[t] ?? '')
                  ),
                  token: e.to.token,
                  candidates,
                  words: wordsOfEdit(e),
                },
              }
            : {}),
        };
      });
    }),
    ...tokens.map(([name, value]) => ({
      key: `token:${name}`,
      value,
      task: '',
      undo: undoOfToken(
        name,
        TOKEN_META.find((t) => t.name === name)?.value ?? '(its source value)'
      ),
    })),
  ];

  const tokenPatch = (keys: string[]) => {
    const names = new Set(keys.map((k) => k.slice('token:'.length)));
    const picked = Object.fromEntries(
      Object.entries(overrides).filter(([n]) => names.has(n))
    );
    const diff = sourceChanges(picked, TOKEN_META, tokenSource());
    return diff.changes.length ? sourcePatch(diff.changes) : '';
  };

  const drop = (keys: string[]) =>
    keys.forEach((k) =>
      k.startsWith('token:')
        ? reset(k.slice('token:'.length) as TokenName)
        : remove(k)
    );

  const firstName = drafts.length
    ? groupOf(drafts[0][0])?.name ?? drafts[0][0]
    : 'tokens';

  return (
    <article className="wb-review" data-testid="wb-review">
      <header className="wb-review-head">
        <div>
          <h1>Review</h1>
          <p className="wb-review-sum" data-testid="wb-review-pr">
            <strong data-testid="wb-review-count">{count}</strong>{' '}
            {count === 1 ? 'change' : 'changes'}
            {line && (
              <>
                {' · '}
                {record.pr ? (
                  <a href={prUrl(record.pr)} target="_blank" rel="noreferrer">
                    {line}
                  </a>
                ) : (
                  line
                )}
              </>
            )}
            {record.pr && (
              <>
                {' · '}
                <a
                  href={epicReviewUrl(record.pr)}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="wb-review-preview"
                >
                  {preview === 'building'
                    ? 'its preview is on its way'
                    : 'its preview'}
                </a>
              </>
            )}
          </p>
        </div>
        <div className="wb-review-actions">
          <SendForReview
            record={record}
            update={update}
            answering={answering}
            preview={preview}
            current={current}
            items={items}
            tokenPatch={tokenPatch}
            component={firstName}
            drop={drop}
          />
        </div>
      </header>

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
              group={groupOf(storyId)}
              toolbar={frame}
              overrides={overrides}
              resolve={(t) => live[t] ?? ''}
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
              <Card
                key={c.sha}
                commit={c}
                scan={routed}
                fixture={fixture}
                live={!!hostPr && hostPr !== WORKBENCH_PR}
              />
            ))}
          </ol>
        </section>
      )}
    </article>
  );
};

export default Review;
