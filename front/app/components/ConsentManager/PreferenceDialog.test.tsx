import React from 'react';
import { render } from 'utils/testUtils/rtl';
import { CategorizedDestinations } from './typings';

// component to test
import PreferencesDialog from './PreferencesDialog';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('modules', () => ({ streamsToReset: [] }));

describe('<ConsentManager />', () => {
  let onChange;

  const categoryDestinations: CategorizedDestinations = {
    analytics: ['google_analytics', 'google_tag_manager'],
    advertising: ['segment'],
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
      <PreferencesDialog
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
      <PreferencesDialog
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
});
