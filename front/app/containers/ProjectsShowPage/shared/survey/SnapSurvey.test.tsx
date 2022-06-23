import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import SnapSurvey from './SnapSurvey';

describe('SnapSurvey', () => {
  it('should render iframe', () => {
    render(
      <SnapSurvey snapSurveyUrl={'https://anything.snapsurveys.com/anything'} />
    );
    expect(screen.getByTestId('snapSurveyIframe')).toBeInTheDocument();
  });
});
