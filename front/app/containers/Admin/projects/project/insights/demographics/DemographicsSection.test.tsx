import React from 'react';

import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import { render, screen } from 'utils/testUtils/rtl';

import DemographicsSection from './DemographicsSection';

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
          demographics: { fields: [] },
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

describe('DemographicsSection', () => {
  it('shows the section for a phase with participants', () => {
    mockInsights(30);
    render(<DemographicsSection phase={buildPhase('ideation')} />);

    expect(screen.getByText('Demographics & Audience')).toBeInTheDocument();
  });

  it('hides the section when participants went unmeasured', () => {
    mockInsights(null);
    render(<DemographicsSection phase={buildPhase('document_annotation')} />);

    expect(
      screen.queryByText('Demographics & Audience')
    ).not.toBeInTheDocument();
  });

  // The metrics decide whether there is an audience, so the section loads
  // before it can hide itself.
  it('shows its loading state until the metrics have landed', () => {
    mockPhaseInsights.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<DemographicsSection phase={buildPhase('document_annotation')} />);

    expect(screen.getByText('Loading demographics...')).toBeInTheDocument();
  });
});
