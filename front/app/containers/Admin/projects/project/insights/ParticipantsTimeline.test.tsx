import React from 'react';

import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import { render, screen } from 'utils/testUtils/rtl';

import ParticipantsTimeline from './ParticipantsTimeline';

jest.mock('api/phase_insights/usePhaseInsights', () => () => ({
  data: {
    data: {
      attributes: {
        participants_and_visitors_chart_data: {
          resolution: 'month',
          timeseries: [
            { date_group: '2026-08-01', participants: 3, visitors: 20 },
            { date_group: '2026-09-01', participants: 5, visitors: 40 },
          ],
        },
      },
    },
  },
  isPending: false,
  error: null,
}));

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

// @ts-ignore
window.ResizeObserver = FakeResizeObserver;

const buildPhase = (participation_method: ParticipationMethod): IPhaseData => ({
  ...phasesData[0],
  attributes: { ...phasesData[0].attributes, participation_method },
});

describe('ParticipantsTimeline', () => {
  it('plots participants next to visitors', () => {
    render(<ParticipantsTimeline phase={buildPhase('ideation')} />);

    expect(screen.getByText('Participation over time')).toBeInTheDocument();
    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getByText('Visitors')).toBeInTheDocument();
  });

  it('plots visitors only for a document annotation phase', () => {
    render(<ParticipantsTimeline phase={buildPhase('document_annotation')} />);

    expect(screen.getByText('Visitors over time')).toBeInTheDocument();
    expect(screen.getByText('Visitors')).toBeInTheDocument();
    expect(screen.queryByText('Participants')).not.toBeInTheDocument();
  });
});
