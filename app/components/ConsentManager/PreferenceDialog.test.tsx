// libraries
import React from 'react';
import { shallow } from 'enzyme';
import { mountWithTheme } from 'utils/testUtils/withTheme';

import 'jest-styled-components';

// component to test
import PreferencesDialog from './PreferencesDialog';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');

describe('<ConsentManager />', () => {
  let onChange: Jest.Mock;
  const isConsentRequired = true;
  const implyConsentOnInteraction = false;

  const categoryDestinations = {
    analytics: [
      {
        name: 'Google Analytics',
        description:
          'Google Analytics is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
        category: 'Analytics',
        website: 'http://google.com/analytics',
        id: 'Google Analytics',
      },
      {
        name: 'MarketingTool',
        description:
          'MarketingTool is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
        category: 'Tag Managers',
        website: 'http://random.com/marketing',
        id: 'MarketingTool',
      },
    ],
    advertising: [
      {
        name: 'AdvertisingTool',
        description: 'Advertising BS',
        category: 'Advertising',
        website: 'http://random.com/advertising',
        id: 'AdvertisingTool',
      },
    ],
    functional: [
      {
        name: 'FunctionalTool',
        description: 'Actually might be handy',
        category: 'Security & Fraud',
        website: 'http://random.com/securitycookie',
        id: 'FunctionalTool',
      },
    ],
  };
  const preferences = {
    analytics: true,
    advertising: null,
    functional: null,
  };

  beforeEach(() => {
    onChange = jest.fn();
  });

  it('renders correctly when there are destinations', () => {
    const wrapper = shallow(
      <PreferencesDialog
        onChange={onChange}
        categoryDestinations={categoryDestinations}
        preferences={preferences}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when there are no destinations', () => {
    const wrapper = shallow(
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
    expect(wrapper).toMatchSnapshot();
  });
});
