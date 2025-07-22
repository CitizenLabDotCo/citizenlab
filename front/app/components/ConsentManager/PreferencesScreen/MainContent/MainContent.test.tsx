import React from 'react';

import { fireEvent, render } from 'utils/testUtils/rtl';

import { CategorizedDestinations } from '../../typings';

// component to test
import MainContent from '.';

// mock utilities

describe('<Preferences />', () => {
  let onChange;

  const categoryDestinations: CategorizedDestinations = {
    analytics: ['google_analytics', 'google_tag_manager'],
    advertising: ['google_analytics'],
    functional: ['intercom'],
  };

  const preferences = {
    analytics: true,
    advertising: false,
    functional: true,
  };

  beforeEach(() => {
    onChange = jest.fn();
  });

  it('renders correctly when there are destinations', () => {
    const { container } = render(
      <MainContent
        onChange={onChange}
        categoryDestinations={categoryDestinations}
        preferences={preferences}
      />
    );

    const categoryCards = container.querySelectorAll('.e2e-category');
    expect(categoryCards).toHaveLength(4);
  });

  it('renders correctly when there are no destinations', () => {
    const { container } = render(
      <MainContent
        onChange={onChange}
        categoryDestinations={{
          analytics: [],
          advertising: [],
          functional: [],
        }}
        preferences={preferences}
      />
    );

    const categoryCards = container.querySelectorAll('.e2e-category');
    expect(categoryCards).toHaveLength(1);
  });

  it('is possible to change preference for analytics cookies', () => {
    const { container } = render(
      <MainContent
        onChange={onChange}
        categoryDestinations={categoryDestinations}
        preferences={preferences}
      />
    );

    const allowAnalyticsInput = container.querySelector(
      '#analytics-radio-true'
    );
    expect(allowAnalyticsInput).toBeChecked();

    const disallowAnalyticsInput = container.querySelector(
      '#analytics-radio-false'
    );
    fireEvent.click(disallowAnalyticsInput);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('analytics', false);
  });
});
