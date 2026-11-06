import {
  eventSpan,
  getTimelineScale,
  monthStarts,
  phaseSpan,
  position,
} from './timelineScale';

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
  it('has no scale without phases or events', () => {
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

  it('spans all phases and events', () => {
    const scale = getTimelineScale([
      phaseSpan('2026-10-22', '2026-11-20'),
      eventSpan('2026-12-01T17:00:00Z', '2026-12-01T19:00:00Z'),
    ]);

    expect(scale).toEqual({
      start: new Date('2026-10-22').getTime(),
      end: new Date('2026-12-01T19:00:00Z').getTime(),
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

describe('monthStarts', () => {
  it('lists the months that start within the scale', () => {
    const scale = getTimelineScale([phaseSpan('2026-10-22', '2026-12-11')]);

    expect(
      scale && monthStarts(scale).map((month) => month.getMonth())
    ).toEqual([10, 11]);
  });

  it('thins out the months of long timelines', () => {
    const scale = getTimelineScale([phaseSpan('2026-01-15', '2027-01-15')]);

    expect(scale && monthStarts(scale).length).toBeLessThanOrEqual(6);
  });
});
