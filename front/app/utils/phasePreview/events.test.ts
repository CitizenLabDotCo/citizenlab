import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import { getPreviewEventsPeriod } from './events';

const preview = { project: project1, phase: phasesData[0] };

describe('getPreviewEventsPeriod', () => {
  it('leaves the period open when the phase has no dates yet', () => {
    expect(
      getPreviewEventsPeriod({
        ...preview,
        draft: { start_at: '', end_at: null },
      })
    ).toEqual({ currentAndFutureOnly: false, ongoing_during: [null, null] });
  });

  it('uses the edited dates, including the whole last day', () => {
    expect(
      getPreviewEventsPeriod({
        ...preview,
        draft: {
          start_at: '2026-03-01T00:00:00.000Z',
          end_at: '2026-03-10T00:00:00.000Z',
        },
      }).ongoing_during
    ).toEqual(['2026-03-01T00:00:00.000Z', '2026-03-11T00:00:00.000Z']);
  });
});
