// libraries
import React from 'react';
import { shallow } from 'enzyme';
import { mountWithTheme } from '../../utils/testUtils/withTheme';

import 'jest-styled-components';

// component to test
import { Container } from './Container';
import { IDestination } from './';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('components/Loadable/Modal');

const Intl = require('utils/cl-intl/__mocks__/');
const { intl } = Intl;

describe('<ConsentManager />', () => {
  let setPreferences: jest.Mock;
  let resetPreferences: jest.Mock;
  let saveConsent: jest.Mock;
  const isConsentRequired = true;
  const implyConsentOnInteraction = false;

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
  const newDestinations = destinations;

  beforeEach(() => {
    setPreferences = jest.fn();
    resetPreferences = jest.fn();
    saveConsent = jest.fn();
  });

  it('renders correctly when no cookie is set (destinations = newDestinations)', () => {
    const wrapper = shallow(
      <Container
        intl={intl}
        setPreferences={setPreferences}
        resetPreferences={resetPreferences}
        saveConsent={saveConsent}
        isConsentRequired={isConsentRequired}
        implyConsentOnInteraction={implyConsentOnInteraction}
        destinations={destinations}
        newDestinations={newDestinations}
        preferences={{
          analytics: null,
          advertising: null,
          functional: null
        }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when there is no new destination', () => {
    const wrapper = shallow(
      <Container
        intl={intl}
        setPreferences={setPreferences}
        resetPreferences={resetPreferences}
        saveConsent={saveConsent}
        isConsentRequired={isConsentRequired}
        implyConsentOnInteraction={implyConsentOnInteraction}
        destinations={destinations}
        newDestinations={[]}
        preferences={{
          analytics: false,
          advertising: true,
          functional: false
        }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when there is no tracking destination', () => {
    const wrapper = shallow(
      <Container
        intl={intl}
        setPreferences={setPreferences}
        resetPreferences={resetPreferences}
        saveConsent={saveConsent}
        isConsentRequired={isConsentRequired}
        implyConsentOnInteraction={implyConsentOnInteraction}
        destinations={[]}
        newDestinations={[]}
        preferences={{
          analytics: null,
          advertising: null,
          functional: null
        }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('lets the user accept all from the banner', () => {
    const wrapper = mountWithTheme(
      <Container
        intl={intl}
        setPreferences={setPreferences}
        resetPreferences={resetPreferences}
        saveConsent={saveConsent}
        isConsentRequired={isConsentRequired}
        implyConsentOnInteraction={implyConsentOnInteraction}
        destinations={destinations}
        newDestinations={newDestinations}
        preferences={{
          analytics: null,
          advertising: null,
          functional: null
        }}
      />
    );
    wrapper.find('.e2e-accept-cookies-btn').find('button').simulate('click');
    expect(saveConsent).toBeCalled();
    expect(setPreferences).not.toBeCalled();
    expect(resetPreferences).not.toBeCalled();
  });
  // it('handles close banner clicks as expected', () => {
  //   const wrapper = mountWithTheme(
  //     <Container
  //       intl={intl}
  //       setPreferences={setPreferences}
  //       resetPreferences={resetPreferences}
  //       saveConsent={saveConsent}
  //       isConsentRequired={isConsentRequired}
  //       implyConsentOnInteraction={implyConsentOnInteraction}
  //       destinations={destinations}
  //       newDestinations={newDestinations}
  //       preferences={{
  //         analytics: null,
  //         advertising: null,
  //         functional: null
  //       }}
  //     />
  //   );
  //   wrapper.find('Banner').find('.integration-button-close').find('button').simulate('click');
  //   expect(saveConsent).toBeCalled();
  //   expect(setPreferences).not.toBeCalled();
  //   expect(resetPreferences).not.toBeCalled();
  // });
  // it('when a preferences is set, clicking cancel in the dialog will prompt confirmation', () => {
  //   const wrapper = mountWithTheme(
  //     <Container
  //       intl={intl}
  //       setPreferences={setPreferences}
  //       resetPreferences={resetPreferences}
  //       saveConsent={saveConsent}
  //       isConsentRequired={isConsentRequired}
  //       implyConsentOnInteraction={implyConsentOnInteraction}
  //       destinations={destinations}
  //       newDestinations={newDestinations}
  //       preferences={{
  //         analytics: true,
  //         advertising: null,
  //         functional: null
  //       }}
  //     />
  //   );
  //   wrapper.find('.integration-open-modal').find('button').simulate('click');
  //   wrapper.find('Modal').find('.integration-cancel').find('button').simulate('click');
  //   expect(wrapper.find('Modal').prop('opened')).toBeTruthy();
  //   expect(wrapper.state('isCancelling')).toBeTruthy();
  // });
  it('is invalid when when some field is empty', () => {
    const wrapper = shallow(
      <Container
        intl={intl}
        setPreferences={setPreferences}
        resetPreferences={resetPreferences}
        saveConsent={saveConsent}
        isConsentRequired={isConsentRequired}
        implyConsentOnInteraction={implyConsentOnInteraction}
        destinations={destinations}
        newDestinations={newDestinations}
        preferences={{
          analytics: true,
          advertising: null,
          functional: null
        }}
      />
    );
    expect((wrapper.instance() as any).validate()).toBeFalsy();
  });
  it('is valid when when no field is empty', () => {
    const wrapper = shallow(
      <Container
        intl={intl}
        setPreferences={setPreferences}
        resetPreferences={resetPreferences}
        saveConsent={saveConsent}
        isConsentRequired={isConsentRequired}
        implyConsentOnInteraction={implyConsentOnInteraction}
        destinations={destinations}
        newDestinations={newDestinations}
        preferences={{
          analytics: true,
          advertising: false,
          functional: true
        }}
      />
    );
    expect((wrapper.instance() as any).validate()).toBeTruthy();
  });
});
