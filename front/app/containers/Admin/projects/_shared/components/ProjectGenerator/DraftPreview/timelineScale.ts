const DAY = 24 * 60 * 60 * 1000;
const OPEN_END_DAYS = 30;

export type Span = { from: number; to: number };

export type TimelineScale = { start: number; end: number };

export const phaseSpan = (startAt: string, endAt: string | null): Span => {
  const from = new Date(startAt).getTime();
  const to = endAt ? new Date(endAt).getTime() : from + OPEN_END_DAYS * DAY;

  return { from, to };
};

export const getTimelineScale = (spans: Span[]): TimelineScale | null => {
  if (spans.length === 0) return null;

  const start = Math.min(...spans.map(({ from }) => from));
  const end = Math.max(...spans.map(({ to }) => to), start + DAY);

  // The tools don't check date formats, and one unreadable date makes the whole scale NaN.
  if (Number.isNaN(end)) return null;

  return { start, end };
};

export const position = (scale: TimelineScale, { from, to }: Span) => {
  const length = scale.end - scale.start;

  return {
    left: ((from - scale.start) / length) * 100,
    width: ((to - from) / length) * 100,
  };
};
