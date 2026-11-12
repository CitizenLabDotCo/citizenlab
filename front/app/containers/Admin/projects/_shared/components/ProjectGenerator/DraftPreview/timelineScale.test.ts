import { getTimelineScale, phaseSpan, position } from './timelineScale';

const DAY = 24 * 60 * 60 * 1000;

describe('phaseSpan', () => {
  it('runs until its end date', () => {
    const { from, to } = phaseSpan('2026-10-22', '2026-10-23');

    expect(to - from).toBe(DAY);
  });

  it('draws a phase without end date for 30 days', () => {
    const { from, to } = phaseSpan('2026-10-22', null);

    expect(to - from).toBe(30 * DAY);
  });
});

describe('getTimelineScale', () => {
  it('has no scale without phases', () => {
    expect(getTimelineScale([])).toBeNull();
  });

  it('has no scale when a date cannot be read', () => {
    const readable = phaseSpan('2026-10-22', '2026-11-20');

    expect(
      getTimelineScale([readable, phaseSpan('next monday', '2026-12-01')])
    ).toBeNull();
    expect(
      getTimelineScale([readable, phaseSpan('2026-11-21', 'soon')])
    ).toBeNull();
  });

  it('spans all phases', () => {
    const scale = getTimelineScale([
      phaseSpan('2026-10-22', '2026-11-20'),
      phaseSpan('2026-11-21', '2026-12-11'),
    ]);

    expect(scale).toEqual({
      start: new Date('2026-10-22').getTime(),
      end: new Date('2026-12-11').getTime(),
    });
  });
});

describe('position', () => {
  it('places a span in percentages of the scale', () => {
    const scale = { start: 0, end: 10 * DAY };

    expect(position(scale, { from: 2 * DAY, to: 7 * DAY })).toEqual({
      left: 20,
      width: 50,
    });
  });
});
