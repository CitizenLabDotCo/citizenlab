import { useEffect, useMemo, useState } from 'react';

import { chartOf, deltaOf, formatNumber, SeriesPoint } from '../lib/proposal';

// The Proposal page's trend chart: plain SVG drawn at the plot's own width,
// grid ticks, the first and last date, a crosshair and a tooltip on hover.
// Styles live in pages/proposal.css (wb-prop-chart, wb-prop-dot-*).

const BOX_HEIGHT = 200;
const boxOf = (width: number) => ({
  width,
  height: BOX_HEIGHT,
  left: 52,
  right: 12,
  top: 14,
  bottom: 28,
});

// The plot's width in CSS pixels, so the SVG draws at 1:1 and its text
// keeps its size on a phone.
const useWidth = () => {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(480);
  useEffect(() => {
    if (!el) return undefined;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth > 0) setWidth(el.clientWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  return [setEl, width] as const;
};

const AREA_LABEL: Record<string, string> = {
  heal: 'Heal',
  lift: 'Lift',
  scan: 'Scanner change',
  now: 'This build',
};

/** The kind of a trend point; any other area reads as "Other change". */
export const areaLabel = (area: string) => AREA_LABEL[area] ?? 'Other change';

/** The legend: scanner and other changes share the hollow marker. */
export const LEGEND: { area: string; label: string }[] = [
  { area: 'heal', label: 'Heal' },
  { area: 'lift', label: 'Lift' },
  { area: 'scan', label: 'Scanner or other change' },
];

export const markerClass = (area: string) =>
  `wb-prop-dot wb-prop-dot-${AREA_LABEL[area] ? area : 'other'}`;

const shortDate = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
    : 'now';

/** One measure over the trend: a 2px line, a marker per commit, hover. */
const LineChart = ({
  title,
  points,
  testId,
}: {
  title: string;
  points: SeriesPoint[];
  testId: string;
}) => {
  const [hover, setHover] = useState<number | null>(null);
  const [plotRef, width] = useWidth();
  const BOX = useMemo(() => boxOf(width), [width]);
  const chart = useMemo(
    () =>
      chartOf(
        points.map((p) => p.value),
        BOX
      ),
    [points, BOX]
  );
  if (points.length === 0) return null;
  const last = points.length - 1;
  const first = points[0];
  const end = points[last];
  const delta = deltaOf(points);
  const h = hover === null ? null : points[hover];
  const yOf = (v: number) =>
    BOX.top +
    (BOX.height - BOX.top - BOX.bottom) *
      (1 - (v - chart.min) / (chart.max - chart.min));
  const step =
    points.length > 1
      ? chart.x[1] - chart.x[0]
      : BOX.width - BOX.left - BOX.right;
  return (
    <figure className="wb-prop-chart" data-testid={testId}>
      <figcaption>
        <span className="wb-prop-chart-title">{title}</span>
        <span className="wb-prop-chart-now">{formatNumber(end.value)}</span>
        {delta && (
          <span className="wb-muted" data-testid="wb-prop-delta">
            {delta.value === 0
              ? 'unchanged'
              : `${delta.value > 0 ? '+' : ''}${formatNumber(
                  delta.value
                )}`}{' '}
            {delta.since === 'settled'
              ? 'since the scanner settled'
              : 'since the first scan'}
          </span>
        )}
      </figcaption>
      <div className="wb-prop-chart-plot" ref={plotRef}>
        <svg
          viewBox={`0 0 ${BOX.width} ${BOX.height}`}
          role="img"
          aria-label={`${title}: from ${formatNumber(
            first.value
          )} to ${formatNumber(end.value)} over ${points.length} commits`}
          onMouseLeave={() => setHover(null)}
        >
          {chart.ticks.map((t) => (
            <g key={t}>
              <line
                className="wb-prop-grid"
                x1={BOX.left}
                x2={BOX.width - BOX.right}
                y1={yOf(t)}
                y2={yOf(t)}
              />
              <text
                className="wb-prop-axis"
                x={BOX.left - 8}
                y={yOf(t) + 4}
                textAnchor="end"
              >
                {formatNumber(t)}
              </text>
            </g>
          ))}
          <text
            className="wb-prop-axis"
            x={BOX.left}
            y={BOX.height - 8}
            textAnchor="start"
          >
            {shortDate(first.date)}
          </text>
          <text
            className="wb-prop-axis"
            x={BOX.width - BOX.right}
            y={BOX.height - 8}
            textAnchor="end"
          >
            {shortDate(end.date)}
          </text>
          {h && hover !== null && (
            <line
              className="wb-prop-crosshair"
              x1={chart.x[hover]}
              x2={chart.x[hover]}
              y1={BOX.top}
              y2={BOX.height - BOX.bottom}
            />
          )}
          <path className="wb-prop-line" d={chart.path} />
          {points.map((p, i) => (
            <circle
              key={`${p.sha}-${i}`}
              className={markerClass(p.area)}
              cx={chart.x[i]}
              cy={chart.y[i]}
              r={hover === i ? 6 : 4.5}
            />
          ))}
          {points.map((p, i) => (
            <rect
              key={`hit-${p.sha}-${i}`}
              className="wb-prop-hit"
              x={chart.x[i] - step / 2}
              y={BOX.top}
              width={step}
              height={BOX.height - BOX.top - BOX.bottom}
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>
        {h && hover !== null && (
          <div
            className="wb-prop-tip"
            role="status"
            style={{
              left: `${(chart.x[hover] / BOX.width) * 100}%`,
              top: `${(chart.y[hover] / BOX.height) * 100}%`,
            }}
          >
            <strong>{formatNumber(h.value)}</strong>
            <span>
              {areaLabel(h.area)}
              {h.sha ? `, ${h.sha.slice(0, 7)}` : ''}
            </span>
            <span className="wb-prop-tip-subject">
              {h.subject
                .replace(/^design-system\([^)]*\):\s*/, '')
                .replace(/\s*\[AI-assisted\]$/, '')}
            </span>
          </div>
        )}
      </div>
    </figure>
  );
};

export default LineChart;
