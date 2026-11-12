import React from 'react';

import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import { render, screen } from 'utils/testUtils/rtl';

import ParticipationMetrics from './ParticipationMetrics';

// Assigning to the module namespace does not work here, as the transformer
// emits ES module exports as non-configurable getters.
jest.mock('api/phase_insights/usePhaseInsights', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockPhaseInsights = usePhaseInsights as jest.Mock;

const mockMetrics = (participants: number | null) =>
  mockPhaseInsights.mockReturnValue({
    data: {
      data: {
        attributes: {
          metrics: {
            visitors: 120,
            participants,
            participation_rate_as_percent: participants === null ? null : 25,
          },
        },
      },
    },
    isLoading: false,
    error: null,
  });

const buildPhase = (participation_method: ParticipationMethod): IPhaseData => ({
  ...phasesData[0],
  attributes: { ...phasesData[0].attributes, participation_method },
});

describe('ParticipationMetrics', () => {
  it('shows visitors, participants and the participation rate', () => {
    mockMetrics(30);
    render(<ParticipationMetrics phase={buildPhase('ideation')} />);

    expect(screen.getByText('Visitors')).toBeInTheDocument();
    expect(screen.getByText('Phase participants')).toBeInTheDocument();
    expect(screen.getByText('Participation rate')).toBeInTheDocument();
    expect(screen.queryByText(/Konveio/)).not.toBeInTheDocument();
  });

  it('shows only visitors, and names Konveio, when participants went unmeasured', () => {
    mockMetrics(null);
    render(<ParticipationMetrics phase={buildPhase('document_annotation')} />);

    expect(screen.getByText('Visitors')).toBeInTheDocument();
    expect(screen.queryByText('Phase participants')).not.toBeInTheDocument();
    expect(screen.queryByText('Participation rate')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Konveio keeps the participation data/)
    ).toBeInTheDocument();
  });
});
