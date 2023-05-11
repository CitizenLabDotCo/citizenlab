import React from 'react';

import OfficialFeedback from './';
import { render, screen } from 'utils/testUtils/rtl';

jest.mock('./OfficialFeedbackForm', () => 'OfficialFeedbackForm');
jest.mock('./OfficialFeedbackFeed', () => 'OfficialFeedbackFeed');
jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

describe('<OfficialFeedback />', () => {
  it('renders correctly for non-admins', () => {
    render(
      <OfficialFeedback
        postId="ideaId"
        postType="idea"
        permissionToPost={false}
      />
    );

    const officialFeedbackForm = screen.queryByTestId('official-feedback-form');
    const officialFeedbackFeed = screen.getByTestId('official-feedback-feed');

    expect(officialFeedbackForm).not.toBeInTheDocument();
    expect(officialFeedbackFeed).toBeInTheDocument();
  });

  it('renders correctly for admins', () => {
    render(
      <OfficialFeedback
        postId="ideaId"
        postType="idea"
        permissionToPost={true}
      />
    );

    const officialFeedbackForm = screen.getByTestId('official-feedback-form');
    const officialFeedbackFeed = screen.getByTestId('official-feedback-feed');

    expect(officialFeedbackForm).toBeInTheDocument();
    expect(officialFeedbackFeed).toBeInTheDocument();
  });
});
