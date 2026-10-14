import React from 'react';

import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import { render, screen } from 'utils/testUtils/rtl';

import ParticipantsTimeline from './ParticipantsTimeline';

// Assigning to the module namespace does not work here, as the transformer
// emits ES module exports as non-configurable getters.
jest.mock('api/phase_insights/usePhaseInsights', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockPhaseInsights = usePhaseInsights as jest.Mock;

const mockInsights = (participants: number | null) =>
  mockPhaseInsights.mockReturnValue({
    data: {
      data: {
        attributes: {
          metrics: { visitors: 60, participants },
          // The series always carries counts; the metrics above are what says
          // whether they mean anything.
          participants_and_visitors_chart_data: {
            resolution: 'month',
            timeseries: [
              {
                date_group: '2026-08-01',
                participants: participants ?? 0,
                visitors: 20,
              },
              {
                date_group: '2026-09-01',
                participants: participants ?? 0,
                visitors: 40,
              },
            ],
          },
        },
      },
    },
    isPending: false,
    error: null,
  });

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
    mockInsights(5);
    render(<ParticipantsTimeline phase={buildPhase('ideation')} />);

    expect(screen.getByText('Participation over time')).toBeInTheDocument();
    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getByText('Visitors')).toBeInTheDocument();
  });

  it('plots visitors only when participants went unmeasured', () => {
    mockInsights(null);
    render(<ParticipantsTimeline phase={buildPhase('document_annotation')} />);

    expect(screen.getByText('Visitors over time')).toBeInTheDocument();
    expect(screen.getByText('Visitors')).toBeInTheDocument();
    expect(screen.queryByText('Participants')).not.toBeInTheDocument();
  });
});
