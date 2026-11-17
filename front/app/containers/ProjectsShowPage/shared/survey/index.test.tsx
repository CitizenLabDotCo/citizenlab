import React from 'react';

import { mockPhaseSurveyTypeformData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData } from 'api/phases/types';

import { render, screen } from 'utils/testUtils/rtl';

import Survey from '.';

jest.mock('api/me/useAuthUser', () => () => ({ data: null }));
jest.mock(
  '../ParticipationPermission',
  () =>
    ({ children }: { children: React.ReactNode }) =>
      <>{children}</>
);

const phase: IPhaseData = {
  ...mockPhaseSurveyTypeformData,
  attributes: {
    ...mockPhaseSurveyTypeformData.attributes,
    survey_service: 'snap_survey',
  },
};

describe('Survey', () => {
  it('renders the Snap Survey iframe for an https URL', () => {
    const url = 'https://acme.welcomesyourfeedback.net/s/abc123';
    render(
      <Survey phase={phase} surveyEmbedUrl={url} surveyService="snap_survey" />
    );
    expect(screen.getByTestId('snapSurveyIframe')).toHaveAttribute('src', url);
  });

  it.each([
    'javascript:alert(document.cookie)//snapsurveys.com/',
    'JavaScript:alert(1)//snapsurveys.com/',
    'data:text/html,<script>alert(1)</script>snapsurveys.com/',
    'snapsurveys.com/',
  ])('does not render an embed for %s', (url) => {
    const { container } = render(
      <Survey phase={phase} surveyEmbedUrl={url} surveyService="snap_survey" />
    );
    expect(screen.queryByTestId('snapSurveyIframe')).not.toBeInTheDocument();
    expect(container.querySelector('iframe')).toBeNull();
  });
});
