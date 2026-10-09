import React from 'react';

import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import { render, screen } from 'utils/testUtils/rtl';

import DemographicsSection from './DemographicsSection';

jest.mock('api/phase_insights/usePhaseInsights', () => () => ({
  data: { data: { attributes: { demographics: { fields: [] } } } },
  isLoading: false,
  error: null,
}));

const buildPhase = (participation_method: ParticipationMethod): IPhaseData => ({
  ...phasesData[0],
  attributes: { ...phasesData[0].attributes, participation_method },
});

describe('DemographicsSection', () => {
  it('shows the section for a phase with participants', () => {
    render(<DemographicsSection phase={buildPhase('ideation')} />);

    expect(screen.getByText('Demographics & Audience')).toBeInTheDocument();
  });

  it('hides the section for a document annotation phase', () => {
    render(<DemographicsSection phase={buildPhase('document_annotation')} />);

    expect(
      screen.queryByText('Demographics & Audience')
    ).not.toBeInTheDocument();
  });
});
