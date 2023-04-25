import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import SmartSurvey from './SmartSurvey';

describe('SmartSurvey', () => {
  it('should render', () => {
    render(
      <SmartSurvey
        email={''}
        smartSurveyUrl={'https://www.smartsurvey.co.uk/s/LU3JMS/'}
        user_id={''}
      />
    );
    expect(screen.getByTestId('smartsurvey')).toBeInTheDocument();
  });
  it('add userID and email on empty query', () => {
    render(
      <SmartSurvey
        email={'test@mail.com'}
        smartSurveyUrl={'https://www.smartsurvey.co.uk/s/LU3JMS/'}
        user_id={'user1'}
      />
    );
    const iframe = screen.getByTestId('smartsurvey');
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.smartsurvey.co.uk/s/LU3JMS/?email=test%40mail.com&user_id=user1'
    );
  });
  it('append userID and email on existing query', () => {
    render(
      <SmartSurvey
        email={'test@mail.com'}
        smartSurveyUrl={
          'https://www.smartsurvey.co.uk/s/LU3JMS/?existingParam=value'
        }
        user_id={'user1'}
      />
    );
    const iframe = screen.getByTestId('smartsurvey');
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.smartsurvey.co.uk/s/LU3JMS/?existingParam=value&email=test%40mail.com&user_id=user1'
    );
  });
});
