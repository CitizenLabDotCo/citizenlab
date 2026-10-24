import { checklistOf, A11yResults } from '../lib/a11y';
import { CHECKLISTS } from '../lib/checklists';
import { cropSlug, InUseRow } from '../lib/inUse';
import { plural } from '../lib/plural';
import { OFFICE_LABEL } from '../lib/stories';

import StoryThumb, { ScoreRing, StatusChip } from './StoryThumb';

import type { FrameGlobals } from '../lib/frame';

const usesOf = (r: InUseRow) =>
  [
    plural(r.uses, 'use', 'uses'),
    r.routes.length > 0 && plural(r.routes.length, 'route', 'routes'),
  ]
    .filter(Boolean)
    .join(' · ');

const routeLabel = (route: string) => `/${route}`;

// A component with no story: the picture ds:crops took of it on the
// platform, or a quiet note that it has none yet.
const CropCard = ({ row }: { row: InUseRow }) => (
  <div
    className="wb-card wb-thumb-card wb-crop-card"
    data-testid="wb-crop-card"
    data-component={row.name}
  >
    <span className="wb-thumb wb-crop">
      {row.crop ? (
        <img
          src={`../crops/${cropSlug(row.name)}.png`}
          alt={`${row.name} on ${routeLabel(row.crop.route)}`}
          width={row.crop.width}
          height={row.crop.height}
          loading="lazy"
        />
      ) : (
        <span className="wb-thumb-fallback">No picture yet</span>
      )}
    </span>
    <span className="wb-thumb-body">
      <span className="wb-thumb-head">
        <span className="wb-thumb-title">
          <span className="wb-card-title">{row.name}</span>
          <span className="wb-thumb-meta" title={row.file}>
            {usesOf(row)}
          </span>
        </span>
        <ScoreRing score={row.score.score} status={row.score.status} />
      </span>
      <span className="wb-chip-row">
        <span className="wb-chip wb-chip-nostory">No story yet</span>
        <StatusChip status={row.score.status} />
      </span>
      {row.crop && (
        <span
          className="wb-crop-seen"
          title={OFFICE_LABEL[row.office]}
        >{`Seen on ${routeLabel(row.crop.route)}`}</span>
      )}
    </span>
  </div>
);

type Props = {
  rows: InUseRow[];
  globals: FrameGlobals;
  frameWidth: number;
  results: A11yResults | null;
};

// The In use list: the library's own components render live, as in the
// gallery; the rest show their crop from the platform.
const InUseGrid = ({ rows, globals, frameWidth, results }: Props) => (
  <ul className="wb-card-grid wb-thumb-grid" data-testid="wb-inuse-grid">
    {rows.map((r) => (
      <li key={r.file}>
        {r.group ? (
          <StoryThumb
            group={r.group}
            href={`#/components/${encodeURIComponent(r.group.defaultId)}`}
            globals={globals}
            frameWidth={frameWidth}
            a11y={{ results, checklist: checklistOf(CHECKLISTS, r.group) }}
            meta={usesOf(r)}
          />
        ) : (
          <CropCard row={r} />
        )}
      </li>
    ))}
  </ul>
);

export default InUseGrid;
