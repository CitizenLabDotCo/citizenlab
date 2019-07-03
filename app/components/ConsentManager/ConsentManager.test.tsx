// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { ConsentManager, mapCustomPreferences, CustomPreferences, IDestination } from './';

jest.mock('utils/cl-intl');
jest.mock('services/tenant');
jest.mock('services/auth');
jest.mock('components/Loadable/Modal');

describe('<ConsentManager />', () => {
  beforeEach(() => {

  });

  it('renders correctly', () => {
    const wrapper = shallow(<ConsentManager authUser={null} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('maps destinations to preferences', () => {
    const destinations = [
      {
        name: 'Google Analytics',
        description: 'Google Analytics is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
        category: 'Analytics',
        website: 'http://google.com/analytics',
        id: 'Google Analytics',
      },
      {
        name: 'MarketingTool',
        description: 'MarketingTool is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
        category: 'Tag Managers',
        website: 'http://random.com/marketing',
        id: 'MarketingTool',
      },
      {
        name: 'AdvertisingTool',
        description: 'Advertising BS',
        category: 'Advertising',
        website: 'http://random.com/advertising',
        id: 'AdvertisingTool',
      },
      {
        name: 'FunctionalTool',
        description: 'Actually might be handy',
        category: 'Security & Fraud',
        website: 'http://random.com/securitycookie',
        id: 'FunctionalTool',
      }
    ] as IDestination[];
    const preferences = {
      advertising: false,
      analytics: true,
      functional: true
    } as CustomPreferences;
    expect(mapCustomPreferences({ destinations, preferences })).toMatchSnapshot();
  });
  it('maps destinations to preferences when there are no destinations', () => {
    const destinations = [] as IDestination[];
    const preferences = {
      advertising: false,
      analytics: true,
      functional: true
    } as CustomPreferences;
    expect(mapCustomPreferences({ destinations, preferences })).toMatchSnapshot();
  });
  it('destinations defaults to true when nothing is selected', () => {
    const destinations = [
      {
        name: 'Google Analytics',
        description: 'Google Analytics is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
        category: 'Analytics',
        website: 'http://google.com/analytics',
        id: 'Google Analytics',
      },
      {
        name: 'MarketingTool',
        description: 'MarketingTool is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
        category: 'Tag Managers',
        website: 'http://random.com/marketing',
        id: 'MarketingTool',
      },
      {
        name: 'AdvertisingTool',
        description: 'Advertising BS',
        category: 'Advertising',
        website: 'http://random.com/advertising',
        id: 'AdvertisingTool',
      },
      {
        name: 'FunctionalTool',
        description: 'Actually might be handy',
        category: 'Security & Fraud',
        website: 'http://random.com/securitycookie',
        id: 'FunctionalTool',
      }
    ] as IDestination[];
    const preferences = {
      advertising: null,
      analytics: null,
      functional: null
    } as CustomPreferences;
    expect(mapCustomPreferences({ destinations, preferences })).toMatchSnapshot();
  });
  it('destinations default to true only when nothing is selected', () => {
    const destinations = [
      {
        name: 'Google Analytics',
        description: 'Google Analytics is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
        category: 'Analytics',
        website: 'http://google.com/analytics',
        id: 'Google Analytics',
      },
      {
        name: 'MarketingTool',
        description: 'MarketingTool is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
        category: 'Tag Managers',
        website: 'http://random.com/marketing',
        id: 'MarketingTool',
      },
      {
        name: 'AdvertisingTool',
        description: 'Advertising BS',
        category: 'Advertising',
        website: 'http://random.com/advertising',
        id: 'AdvertisingTool',
      },
      {
        name: 'FunctionalTool',
        description: 'Actually might be handy',
        category: 'Security & Fraud',
        website: 'http://random.com/securitycookie',
        id: 'FunctionalTool',
      }
    ] as IDestination[];
    const preferences = {
      advertising: false,
      analytics: null,
      functional: null
    } as CustomPreferences;
    expect(mapCustomPreferences({ destinations, preferences })).toMatchSnapshot();
  });
});
