// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { ConsentManager } from './';

// mock depencies
jest.mock('services/appConfiguration');
jest.mock('resources/GetAppConfiguration', () => 'GetAppConfiguration');
jest.mock('./Container', () => 'Container');

// by default, no cookie

jest.mock('./consent', () => ({
  getConsent: jest.fn(() => null),
  setConsent: jest.fn(),
}));

import * as consent from './consent';

import { makeUser } from 'services/__mocks__/users';
import {
  __setMockAppConfiguration,
  getAppConfigurationData,
} from 'services/__mocks__/appConfiguration';
import {
  getDestinationConfig,
  getDestinationConfigs,
  registerDestination,
} from './destinations';

registerDestination({
  key: 'google_analytics',
  feature_flag: 'google_analytics',
  category: 'analytics',
});

registerDestination({
  key: 'intercom',
  feature_flag: 'intercom',
  category: 'functional',
  hasPermission: (user) => user === admin,
});

registerDestination({
  key: 'satismeter',
  feature_flag: 'satismeter',
  category: 'analytics',
  hasPermission: (user) => user === admin,
});

// object will all destinations as keys, true as values, mimicks the savedvales for a user that accepted all
const savedChoicesAllDisabled = getDestinationConfigs().reduce(
  (acc, destination) => {
    return { ...acc, [destination.key]: false };
  },
  {}
);
const savedChoicesAllEnabled = getDestinationConfigs().reduce(
  (acc, destination) => {
    return { ...acc, [destination.key]: true };
  },
  {}
);

const tenantDataAllEnabled = getAppConfigurationData({
  settings: {
    satismeter: { allowed: true, enabled: true },
    google_analytics: { allowed: true, enabled: true },
    segment: { allowed: true, enabled: true },
    intercom: { allowed: true, enabled: true },
    google_tag_manager: { allowed: true, enabled: true },
  },
});

const tenantDataAllDisabled = getAppConfigurationData({
  settings: {
    satismeter: { allowed: false, enabled: false },
    google_analytics: { allowed: false, enabled: false },
    segment: { allowed: false, enabled: false },
    intercom: { allowed: false, enabled: false },
    google_tag_manager: { allowed: false, enabled: false },
  },
});

const admin = makeUser({
  roles: [{ type: 'admin' }],
}).data;

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
      const wrapper = shallow(<ConsentManager authUser={null} tenant={{}} />);
      expect(wrapper.isEmptyRender()).toBe(false);
    });
  });

  describe('parses tenant setting and user to show active destinations in categories', () => {
    describe('unsingned user', () => {
      it('acts properly when all enabled', () => {
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={null} tenant={tenantDataAllEnabled} />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
      it('acts properly when all disabled', () => {
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={null} tenant={tenantDataAllDisabled} />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
    });

    describe('admin user', () => {
      it('acts properly when all enabled', () => {
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={admin} tenant={tenantDataAllEnabled} />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
      it('acts properly when all disabled', () => {
        const wrapper = shallow(
          <ConsentManager authUser={admin} tenant={tenantDataAllDisabled} />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
      it('acts properly when only satismeter disabled', () => {
        tenantDataAllEnabled.attributes.settings.satismeter = {
          allowed: false,
          enabled: false,
        };
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={admin} tenant={tenantDataAllEnabled} />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
    });
    describe('super admin user', () => {
      const superAdmin = makeUser({
        roles: [{ type: 'admin' }],
        highest_role: 'super_admin',
      }).data;
      it('acts properly when all enabled', () => {
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={superAdmin} tenant={tenantDataAllEnabled} />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
      it('acts properly when all disabled', () => {
        __setMockAppConfiguration(tenantDataAllDisabled);
        const wrapper = shallow(
          <ConsentManager
            authUser={superAdmin}
            tenant={tenantDataAllDisabled}
          />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
    });
  });

  describe('passes down preferences and preferences handling', () => {
    describe('no cookie previously', () => {
      describe('all destinations', () => {
        it('initializes preferences object correctly', () => {
          __setMockAppConfiguration(tenantDataAllEnabled);
          const wrapper = shallow(
            <ConsentManager authUser={null} tenant={tenantDataAllEnabled} />
          );
          const preferences = wrapper.find('Container').props().preferences;
          expect(preferences).toEqual({
            analytics: undefined,
            advertising: undefined,
            functional: undefined,
          });
        });
        it('changes it as required', () => {
          __setMockAppConfiguration(tenantDataAllEnabled);
          const wrapper = shallow(
            <ConsentManager authUser={null} tenant={tenantDataAllEnabled} />
          );

          const setPreferences = wrapper.find('Container').props()
            .setPreferences;

          setPreferences({ analytics: false });

          const preferences = wrapper.find('Container').props().preferences;
          expect(preferences).toEqual({
            analytics: false,
            advertising: undefined,
            functional: undefined,
          });
        });
        it('consent is required', () => {
          __setMockAppConfiguration(tenantDataAllEnabled);
          const wrapper = shallow(
            <ConsentManager authUser={null} tenant={tenantDataAllEnabled} />
          );

          const isConsentRequired = wrapper.find('Container').props()
            .isConsentRequired;

          expect(isConsentRequired).toBe(true);
        });
      });
      describe('no destinations', () => {
        it('initializes preferences object correctly', () => {
          __setMockAppConfiguration(tenantDataAllDisabled);
          const wrapper = shallow(
            <ConsentManager authUser={null} tenant={tenantDataAllDisabled} />
          );
          const preferences = wrapper.find('Container').props().preferences;
          expect(preferences).toEqual({
            analytics: undefined,
            advertising: undefined,
            functional: undefined,
          });
        });
      });
    });
    describe('previously accepted, no new destinations', () => {
      it('initializes preferences object correctly', () => {
        // COOkIE mock
        // object will all destinations as keys, true as values, mimicks the savedvales for a user that accepted all
        const spy = jest
          .spyOn(consent, 'getConsent')
          .mockImplementation(() => ({
            analytics: true,
            advertising: true,
            functional: true,
            savedChoices: savedChoicesAllEnabled,
          }));
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={null} tenant={tenantDataAllEnabled} />
        );
        const preferences = wrapper.find('Container').props().preferences;
        expect(preferences).toEqual({
          analytics: true,
          advertising: true,
          functional: true,
        });
        spy.mockRestore();
      });

      it('consent is not required', () => {
        // COOkIE mock
        // object will all destinations as keys, true as values, mimicks the savedvales for a user that accepted all
        const spy = jest
          .spyOn(consent, 'getConsent')
          .mockImplementation(() => ({
            analytics: true,
            advertising: true,
            functional: true,
            savedChoices: savedChoicesAllEnabled,
          }));
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={null} tenant={tenantDataAllEnabled} />
        );

        const isConsentRequired = wrapper.find('Container').props()
          .isConsentRequired;

        expect(isConsentRequired).toBe(false);

        spy.mockRestore();
      });
    });
    describe('previously accepted, new destinations', () => {
      it('initializes preferences object correctly', () => {
        // COOkIE mock
        const spy = jest
          .spyOn(consent, 'getConsent')
          .mockImplementation(() => ({
            analytics: true,
            advertising: true,
            functional: true,
            savedChoices: { ...savedChoicesAllEnabled, intercom: true },
          }));
        __setMockAppConfiguration(tenantDataAllEnabled);

        const wrapper = shallow(
          <ConsentManager authUser={admin} tenant={tenantDataAllEnabled} />
        );
        const preferences = wrapper.find('Container').props().preferences;
        expect(preferences).toEqual({
          analytics: true,
          advertising: true,
          functional: true,
        });
        spy.mockRestore();
      });

      it('consent is required', () => {
        const spy = jest
          .spyOn(consent, 'getConsent')
          .mockImplementation(() => ({
            analytics: true,
            advertising: true,
            functional: true,
            savedChoices: { google_analytics: true },
          }));
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={admin} tenant={tenantDataAllEnabled} />
        );

        const isConsentRequired = wrapper.find('Container').props()
          .isConsentRequired;

        expect(isConsentRequired).toBe(true);

        spy.mockRestore();
      });
    });
    describe('previously refused', () => {
      it('initializes preferences object correctly', () => {
        const mock_savedChoices = savedChoicesAllEnabled;
        const spy = jest
          .spyOn(consent, 'getConsent')
          .mockImplementation(() => ({
            analytics: false,
            advertising: false,
            functional: false,
            savedChoices: mock_savedChoices,
          }));
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={null} tenant={tenantDataAllEnabled} />
        );
        const preferences = wrapper.find('Container').props().preferences;
        expect(preferences).toEqual({
          analytics: false,
          advertising: false,
          functional: false,
        });
        spy.mockRestore();
      });
    });
    describe('preference reset', () => {
      it('resets preferences when no previous cookie was set', () => {
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={null} tenant={tenantDataAllEnabled} />
        );
        const setPreferences = wrapper.find('Container').props().setPreferences;

        setPreferences({ analytics: false });
        wrapper.find('Container').props().resetPreferences();

        const preferences = wrapper.find('Container').props().preferences;
        expect(preferences).toEqual({
          analytics: undefined,
          advertising: undefined,
          functional: undefined,
        });
      });
      it('resets preferences when previous cookie was set', () => {
        const spy = jest
          .spyOn(consent, 'getConsent')
          .mockImplementation(() => ({
            analytics: true,
            advertising: true,
            functional: true,
            savedChoices: savedChoicesAllDisabled,
          }));
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={null} tenant={tenantDataAllEnabled} />
        );
        const setPreferences = wrapper.find('Container').props().setPreferences;

        setPreferences({ analytics: false });

        wrapper.find('Container').props().resetPreferences();

        const preferences = wrapper.find('Container').props().preferences;
        expect(preferences).toEqual({
          analytics: true,
          advertising: true,
          functional: true,
        });
        spy.mockRestore();
      });
    });
  });
  describe('sets the cookie', () => {
    describe('accept', () => {
      it('accepts all when no cookie was set', () => {
        const tenantAllDestinationsEnabled = getAppConfigurationData({
          settings: {
            ...getAppConfigurationData()['attributes']['settings'],
            google_analytics: { enabled: true, allowed: true },
          },
        });

        const setConsentSpy = jest.spyOn(consent, 'setConsent');
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager
            authUser={null}
            tenant={tenantAllDestinationsEnabled}
          />
        );
        wrapper.find('Container').props().accept();

        expect(setConsentSpy).toHaveBeenCalledTimes(1);
        expect(setConsentSpy.mock.calls[0][0]).toMatchSnapshot();
      });
      it('sets preferences to true when previous cookie was set without overwriting false values', () => {
        const setConsentSpy = jest.spyOn(consent, 'setConsent');

        const getConsentSpy = jest
          .spyOn(consent, 'getConsent')
          .mockImplementation(() => ({
            analytics: undefined,
            advertising: false,
            functional: true,
            savedChoices: savedChoicesAllEnabled,
          }));
        __setMockAppConfiguration(tenantDataAllEnabled);
        const wrapper = shallow(
          <ConsentManager authUser={null} tenant={tenantDataAllEnabled} />
        );
        wrapper.find('Container').props().accept();

        expect(setConsentSpy).toHaveBeenCalledTimes(1);
        expect(setConsentSpy.mock.calls[0][0]).toMatchSnapshot();
      });
    });
    // describe('saveConsent', () => {
    //   it('saves the preferences object and individual preferences for all destination available to this user on this tenant', () => {
    //     // TODO
    //   })
    // });
  });
});
