import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import Konveio from './Konveio';

describe('Konveio', () => {
  it('should render', () => {
    render(
      <Konveio
        email={null}
        documentUrl={'https://demo.konveio.com/node/93?iframe=true'}
      />
    );
    expect(screen.getByTestId('konveiosurvey')).toBeInTheDocument();
  });

  it('append email on query', () => {
    render(
      <Konveio
        email={'test@mail.com'}
        documentUrl={'https://demo.konveio.com/node/93?iframe=true'}
      />
    );
    const displayedIframe = screen.getByTestId('konveiosurvey');
    expect(displayedIframe).toHaveAttribute(
      'src',
      'https://demo.konveio.com/node/93?iframe=true&integration=CitizenLab&username=test%40mail.com'
    );
  });
});
