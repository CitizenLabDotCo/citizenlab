// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { IDestination, initialPreferences } from './';
import ConsentManagerBuilderHandler from './ConsentManagerBuilderHandler';

// mock depencies
jest.mock('./Container', () => 'Container');

// mimics the destination/newDestinations objects from sentry
const destinations = [
  {
    name: 'Google Tag Manager',
    description: 'Google Tag Manager is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
    category: 'Tag Managers', // as per defined in categories file, this falls under advertising
    website: 'http://google.com/tagManager',
    id: 'Google Tag Manager',
  },
  {
    name: 'MarketingTool',
    description: 'MarketingTool is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
    category: 'Analytics',
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

let setPreferences = jest.fn();
let resetPreferences = jest.fn();
let saveConsent = jest.fn();

// mimics props for a first time user, takes in the blacklist
const firstTimeUser = (blacklistedDestinations) => ({
  setPreferences,
  resetPreferences,
  saveConsent,
  blacklistedDestinations,
  destinations,
  newDestinations: destinations,
  preferences: initialPreferences
});

// mimics props for a returning user
const returningUser = (blacklistedDestinations) => ({
  setPreferences,
  resetPreferences,
  saveConsent,
  blacklistedDestinations,
  destinations,
  newDestinations: [],
  preferences: {
    advertising: false,
    analytics: true,
    functional: true
  }
});

// mimics props for a returning user when there's new destinations added in segment
const returningUserNewDestinations = (blacklistedDestinations) => {
  const newDestination = {
    name: 'NewTool',
    description: 'NewTool is the new kid in town, lets you record everything the user does and watch in in real time !',
    category: 'Heatmaps & Recordings', // as per defined in categories file, this falls under marketing
    website: 'http://random.com/NewTool',
    id: 'NewTool',
  };
  return {
    setPreferences,
    resetPreferences,
    saveConsent,
    blacklistedDestinations,
    destinations: [...destinations, newDestination],
    newDestinations: [newDestination],
    preferences: {
      advertising: false,
      analytics: true,
      functional: true
    }
  };
};

describe('<ConsentManagerBuilderHandler />', () => {
  beforeEach(() => {
    setPreferences = jest.fn();
    resetPreferences = jest.fn();
    saveConsent = jest.fn();
  });

  describe('passes down props and handlers from SCM', () => {
    it('passes down props and handlers from SCM', () => {
      const wrapper = shallow(
        <ConsentManagerBuilderHandler
          {...firstTimeUser([])}
        />
      );

      const expectedProps = {
        setPreferences,
        resetPreferences,
        saveConsent,
        preferences: initialPreferences,
      };
      const actualProps = wrapper.find('Container').props();
      Object.keys(expectedProps).forEach(key => expect(actualProps[key] === expectedProps[key]));
    });
  });

  describe('classifies detinations into categories: ', () => {
    it('...without a blacklist', () => {
      const wrapper = shallow(<ConsentManagerBuilderHandler {...firstTimeUser([])} />);
      const { categorizedDestinations } = wrapper.find('Container').props();
      expect(categorizedDestinations.functional.map(destination => destination.id)).toEqual(['FunctionalTool']);
      expect(categorizedDestinations.advertising.map(destination => destination.id)).toEqual(['Google Tag Manager', 'AdvertisingTool']);
      expect(categorizedDestinations.analytics.map(destination => destination.id)).toEqual(['MarketingTool']);
    });
    it('...with a blacklist', () => {
      const wrapper = shallow(<ConsentManagerBuilderHandler {...firstTimeUser(['Google Tag Manager'])} />);
      const { categorizedDestinations } = wrapper.find('Container').props();
      expect(categorizedDestinations.functional.map(destination => destination.id)).toEqual(['FunctionalTool']);
      expect(categorizedDestinations.advertising.map(destination => destination.id)).toEqual(['AdvertisingTool']);
      expect(categorizedDestinations.analytics.map(destination => destination.id)).toEqual(['MarketingTool']);
    });
    it('...with a bigger blacklist', () => {
      const wrapper = shallow(<ConsentManagerBuilderHandler {...firstTimeUser(['Google Tag Manager', 'MarketingTool'])} />);
      const { categorizedDestinations } = wrapper.find('Container').props();
      expect(categorizedDestinations.functional.map(destination => destination.id)).toEqual(['FunctionalTool']);
      expect(categorizedDestinations.advertising.map(destination => destination.id)).toEqual(['AdvertisingTool']);
      expect(categorizedDestinations.analytics.map(destination => destination.id)).toEqual([]);
    });
  });

  describe('determines whether consent is required', () => {
    describe('first time user', () => {
      it('expects consent for a first time user', () => {
        const wrapper = shallow(<ConsentManagerBuilderHandler {...firstTimeUser([])} />);
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(true);
      });
      it('expects consent for a first time user with a blacklist', () => {
        const wrapper = shallow(<ConsentManagerBuilderHandler {...firstTimeUser(['Google Tag Manager'])} />);
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(true);
      });
      it('doesn\'t expects consent for a first time user if all destinations are on the blacklist', () => {
        const wrapper = shallow(
          <ConsentManagerBuilderHandler {...firstTimeUser(['Google Tag Manager', 'MarketingTool', 'FunctionalTool', 'AdvertisingTool'])} />
        );
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(false);
      });
    });
    describe('returing user (no new destinations)', () => {
      it('doesn\'t expect consent for a returing user (no new destinations)', () => {
        const wrapper = shallow(<ConsentManagerBuilderHandler {...returningUser([])} />);
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(false);
      });
      it('doesn\'t expect consent for a returing user (no new destinations) with a blacklist', () => {
        const wrapper = shallow(<ConsentManagerBuilderHandler {...returningUser(['Google Tag Manager'])} />);
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(false);
      });
      it('doesn\'t expect consent for a returing user (no new destinations) if all destinations are on the blacklist', () => {
        const wrapper = shallow(
          <ConsentManagerBuilderHandler {...returningUser(['Google Tag Manager', 'MarketingTool', 'FunctionalTool', 'AdvertisingTool'])} />
        );
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(false);
      });
    });
    describe('returing user', () => {
      it('expects consent for a returing user', () => {
        const wrapper = shallow(<ConsentManagerBuilderHandler {...returningUserNewDestinations([])} />);
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(true);
      });
      it('expects consent for a returing user with a blacklist', () => {
        const wrapper = shallow(<ConsentManagerBuilderHandler {...returningUserNewDestinations(['Google Tag Manager'])} />);
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(true);
      });
      it('doesn\'t expect consent for a returing user if all destinations are on the blacklist', () => {
        const wrapper = shallow(
          <ConsentManagerBuilderHandler {...returningUserNewDestinations(['Google Tag Manager', 'MarketingTool', 'FunctionalTool', 'AdvertisingTool', 'NewTool'])} />
        );
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(false);
      });
      it('doesn\'t expect consent for a returing user if the new destinations are on the blacklist', () => {
        const wrapper = shallow(
          <ConsentManagerBuilderHandler {...returningUserNewDestinations(['NewTool'])} />
        );
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(false);
      });
      it('expects consent for a returing user if some destinations were taken off the blacklist', () => {
        const wrapper = shallow(
          <ConsentManagerBuilderHandler {...returningUserNewDestinations(['NewTool'])} />
        );
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(false);
      });
    });

    describe('handles blacklist changes', () => {
      it('expects consent when a destination was taken off the blacklist', () => {
        const wrapper = shallow(
          <ConsentManagerBuilderHandler
            {...{
              setPreferences,
              resetPreferences,
              saveConsent,
              destinations,
              blacklistedDestinations: [],
              newDestinations: [],
              preferences: {
                advertising: false,
                analytics: true,
                functional: true,
                tenantBlacklisted: ['Google Tag Manager']
              }
            }}
          />
        );
        const { isConsentRequired } = wrapper.find('Container').props();
        expect(isConsentRequired).toEqual(true);
      });
    });
  });
});
