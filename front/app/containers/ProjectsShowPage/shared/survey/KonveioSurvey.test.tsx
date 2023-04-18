import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import KonveioSurvey from './KonveioSurvey';

describe('KonveioSurvey', () => {
  it('should render', () => {
    render(
      <KonveioSurvey
        email={null}
        konveioSurveyUrl={'https://demo.konveio.com/node/93?iframe=true'}
      />
    );
    expect(screen.getByTestId('konveiosurvey')).toBeInTheDocument();
  });

  it('append email on query', () => {
    render(
      <KonveioSurvey
        email={'test@mail.com'}
        konveioSurveyUrl={'https://demo.konveio.com/node/93?iframe=true'}
      />
    );
    const displayedIframe = screen.getByTestId('konveiosurvey');
    expect(displayedIframe).toHaveAttribute(
      'src',
      'https://demo.konveio.com/node/93?iframe=true&integration=CitizenLab&username=test%40mail.com'
    );
  });
});
