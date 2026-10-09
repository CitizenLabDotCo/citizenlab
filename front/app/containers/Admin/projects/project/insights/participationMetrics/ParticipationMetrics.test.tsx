import React from 'react';

import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import { render, screen } from 'utils/testUtils/rtl';

import ParticipationMetrics from './ParticipationMetrics';

jest.mock('api/phase_insights/usePhaseInsights', () => () => ({
  data: {
    data: {
      attributes: {
        metrics: {
          visitors: 120,
          participants: 30,
          participation_rate_as_percent: 25,
        },
      },
    },
  },
  isLoading: false,
  error: null,
}));

const buildPhase = (participation_method: ParticipationMethod): IPhaseData => ({
  ...phasesData[0],
  attributes: { ...phasesData[0].attributes, participation_method },
});

describe('ParticipationMetrics', () => {
  it('shows visitors, participants and the participation rate', () => {
    render(<ParticipationMetrics phase={buildPhase('ideation')} />);

    expect(screen.getByText('Visitors')).toBeInTheDocument();
    expect(screen.getByText('Phase participants')).toBeInTheDocument();
    expect(screen.getByText('Participation rate')).toBeInTheDocument();
    expect(screen.queryByText(/Konveio/)).not.toBeInTheDocument();
  });

  it('shows only visitors for a document annotation phase', () => {
    render(<ParticipationMetrics phase={buildPhase('document_annotation')} />);

    expect(screen.getByText('Visitors')).toBeInTheDocument();
    expect(screen.queryByText('Phase participants')).not.toBeInTheDocument();
    expect(screen.queryByText('Participation rate')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Konveio keeps the participation data/)
    ).toBeInTheDocument();
  });
});
