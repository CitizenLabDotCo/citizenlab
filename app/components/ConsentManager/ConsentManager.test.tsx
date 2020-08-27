// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import {
  ConsentManager,
  CustomPreferences,
  IDestination,
  initialPreferences,
  adminIntegrations,
} from './';

// mock depencies
jest.mock('services/tenant');
jest.mock('resources/GetTenant', () => 'GetTenant');
jest.mock(
  './ConsentManagerBuilderHandler',
  () => 'ConsentManagerBuilderHandler'
);
jest.mock('containers/App/constants', () => ({
  CL_SEGMENT_API_KEY: 'IHaveTheKeyInMyHand_AllINeedToFindIsTheLock',
}));

import { makeUser } from 'services/__mocks__/users';

// mimics the destination/newDestinations objects from sentry
const destinations = [
  {
    name: 'Google Tag Manager',
    description:
      'Google Tag Manager is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
    category: 'Tag Manager', // as per defined in categories file, this falls under advertising
    website: 'http://google.com/analytics',
    id: 'Google Tag Manager',
  },
  {
    name: 'MarketingTool',
    description:
      'MarketingTool is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
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
    website: 'http://random.com/security',
    id: 'FunctionalTool',
  },
  {
    name: 'SatisMeter',
    description: 'Measures satisfaction',
    category: 'Surveys',
    website: 'http://satismeter',
    id: 'SatisMeter',
  },
] as IDestination[];

// get simplified tenant object
const getTenant = (blacklist: string[] | null) => ({
  attributes: {
    settings: {
      core: {
        segment_destinations_blacklist: blacklist,
      },
    },
  },
});

describe('<ConsentManager />', () => {
  describe('boundaries: ', () => {
    it('renders null when tenant is null', () => {
      const wrapper = shallow(<ConsentManager authUser={null} tenant={null} />);
      expect(wrapper.isEmptyRender()).toBe(true);
    });
    it('renders null when tenant is Error', () => {
      const wrapper = shallow(
        <ConsentManager authUser={null} tenant={new Error()} />
      );
      expect(wrapper.isEmptyRender()).toBe(true);
    });
    it('renders with a valid tenant', () => {
      const wrapper = shallow(
        <ConsentManager authUser={null} tenant={getTenant(null)} />
      );
      expect(wrapper.isEmptyRender()).toBe(false);
    });
  });

  describe('instanciation details: ', () => {
    it('passes segment API key from constants file to SCMB', () => {
      const wrapper = shallow(
        <ConsentManager authUser={null} tenant={getTenant(null)} />
      );
      expect(wrapper.find('ConsentManagerBuilder').props().writeKey).toBe(
        'IHaveTheKeyInMyHand_AllINeedToFindIsTheLock'
      );
    });
  });

  describe('parsing user choices coming back from child component to set cookie (no blacklist): ', () => {
    it('sets all but admin integrations to true when called with no preferences set and an unsigned user', () => {
      const wrapper = shallow(
        <ConsentManager authUser={null} tenant={getTenant(null)} />
      );
      const handleMapCustomPreferences = wrapper
        .find('ConsentManagerBuilder')
        .props().mapCustomPreferences;

      const preferences = initialPreferences;
      const {
        customPreferences,
        destinationPreferences,
      } = handleMapCustomPreferences(destinations, preferences);
      expect(customPreferences).toEqual({
        advertising: true,
        analytics: true,
        functional: true,
        tenantBlacklisted: [],
        roleBlacklisted: adminIntegrations,
      });
      expect(destinationPreferences).toEqual({
        AdvertisingTool: true,
        FunctionalTool: true,
        'Google Tag Manager': true,
        MarketingTool: true,
        SatisMeter: false,
        Intercom: false,
      });
    });

    it('sets preferences according to the users choice', () => {
      const wrapper = shallow(
        <ConsentManager authUser={null} tenant={getTenant(null)} />
      );
      const handleMapCustomPreferences = wrapper
        .find('ConsentManagerBuilder')
        .props().mapCustomPreferences;

      const preferences = {
        advertising: false,
        analytics: false,
        functional: true,
      } as CustomPreferences;
      const {
        customPreferences,
        destinationPreferences,
      } = handleMapCustomPreferences(destinations, preferences);
      expect(customPreferences).toEqual({
        advertising: false,
        analytics: false,
        functional: true,
        tenantBlacklisted: [],
        roleBlacklisted: adminIntegrations,
      });
      expect(destinationPreferences).toEqual({
        AdvertisingTool: false,
        FunctionalTool: true,
        'Google Tag Manager': false,
        MarketingTool: false,
        SatisMeter: false,
        Intercom: false,
      });
    });
  });

  describe('respects the blacklist set on tenant', () => {
    it('sets preferences according to the users choice, except blacklisted set to false, saves blacklisted', () => {
      const blacklist = ['Google Tag Manager'];
      const wrapper = shallow(
        <ConsentManager authUser={null} tenant={getTenant(blacklist)} />
      );
      const handleMapCustomPreferences = wrapper
        .find('ConsentManagerBuilder')
        .props().mapCustomPreferences;

      const preferences = {
        advertising: true,
        analytics: true,
        functional: false,
      } as CustomPreferences;
      const {
        customPreferences,
        destinationPreferences,
      } = handleMapCustomPreferences(destinations, preferences);
      expect(customPreferences).toEqual({
        advertising: true,
        analytics: true,
        functional: false,
        tenantBlacklisted: blacklist,
        roleBlacklisted: adminIntegrations,
      });
      expect(destinationPreferences).toEqual({
        AdvertisingTool: true,
        FunctionalTool: false,
        'Google Tag Manager': false,
        MarketingTool: true,
        SatisMeter: false,
        Intercom: false,
      });
    });

    it('sets all to true but blacklisted destinations when called with no preferences set, saves blacklisted', () => {
      const blacklist = ['Google Tag Manager'];
      const wrapper = shallow(
        <ConsentManager authUser={null} tenant={getTenant(blacklist)} />
      );
      const handleMapCustomPreferences = wrapper
        .find('ConsentManagerBuilder')
        .props().mapCustomPreferences;

      const preferences = initialPreferences;
      const {
        customPreferences,
        destinationPreferences,
      } = handleMapCustomPreferences(destinations, preferences);
      expect(customPreferences).toEqual({
        advertising: true,
        analytics: true,
        functional: true,
        tenantBlacklisted: blacklist,
        roleBlacklisted: adminIntegrations,
      });
      expect(destinationPreferences).toEqual({
        AdvertisingTool: true,
        FunctionalTool: true,
        'Google Tag Manager': false,
        MarketingTool: true,
        Intercom: false,
        SatisMeter: false,
      });
    });
    it('acts correctly for admins (adds satismeter)', () => {
      const blacklist = ['Google Tag Manager'];
      const user = makeUser({ roles: [{ type: 'admin' }] });
      const wrapper = shallow(
        <ConsentManager authUser={user.data} tenant={getTenant(blacklist)} />
      );
      const handleMapCustomPreferences = wrapper
        .find('ConsentManagerBuilder')
        .props().mapCustomPreferences;

      const preferences = initialPreferences;
      const {
        customPreferences,
        destinationPreferences,
      } = handleMapCustomPreferences(destinations, preferences);
      expect(customPreferences).toEqual({
        advertising: true,
        analytics: true,
        functional: true,
        tenantBlacklisted: blacklist,
        roleBlacklisted: [],
      });
      expect(destinationPreferences).toEqual({
        AdvertisingTool: true,
        FunctionalTool: true,
        'Google Tag Manager': false,
        MarketingTool: true,
        SatisMeter: true,
      });
    });
    it('acts correctly for super admins (no satismeter)', () => {
      const blacklist = ['Google Tag Manager'];
      const user = makeUser({
        roles: [{ type: 'admin' }],
        highest_role: 'super_admin',
      });
      const wrapper = shallow(
        <ConsentManager authUser={user.data} tenant={getTenant(blacklist)} />
      );
      const handleMapCustomPreferences = wrapper
        .find('ConsentManagerBuilder')
        .props().mapCustomPreferences;

      const preferences = initialPreferences;
      const {
        customPreferences,
        destinationPreferences,
      } = handleMapCustomPreferences(destinations, preferences);
      expect(customPreferences).toEqual({
        advertising: true,
        analytics: true,
        functional: true,
        tenantBlacklisted: blacklist,
        roleBlacklisted: ['SatisMeter'],
      });
      expect(destinationPreferences).toEqual({
        AdvertisingTool: true,
        FunctionalTool: true,
        'Google Tag Manager': false,
        MarketingTool: true,
        SatisMeter: false,
      });
    });
  });
});
