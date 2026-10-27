import { useEffect, useMemo, useState } from 'react';

import Icon from '../components/Icon';
import {
  loadChanges,
  loadRouteFixture,
  loadScan,
  ScanOutput,
} from '../lib/data';
import {
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

// The Review page: what the PR this epic serves changes on the platform.
const Review = () => {
  const pr = prOfHost(window.location.hostname);
  const [changes, setChanges] = useState<DesignChanges | undefined>();
  const [loaded, setLoaded] = useState(false);
  const [scan, setScan] = useState<ScanOutput | undefined>();
  const [fixture, setFixture] = useState<RouteFixture>(() =>
    normaliseFixture({})
  );

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

  return (
    <article className="wb-review" data-testid="wb-review">
      <header>
        <h1>Review</h1>
        <p className="wb-review-sum" data-testid="wb-review-pr">
          {pr ? (
            <a href={`${REPO_URL}/pull/${pr}`} target="_blank" rel="noreferrer">
              PR #{pr}
            </a>
          ) : (
            'No PR on this host'
          )}
          {' · '}
          <strong data-testid="wb-review-count">
            {loaded ? cards.length : '...'}
          </strong>{' '}
          {cards.length === 1 ? 'change' : 'changes'} to the platform
        </p>
      </header>
      {cards.length > 0 && (
        <ol className="wb-pr-cards">
          {cards.map((c) => (
            <Card key={c.sha} commit={c} scan={scan} fixture={fixture} />
          ))}
        </ol>
      )}
    </article>
  );
};

export default Review;
