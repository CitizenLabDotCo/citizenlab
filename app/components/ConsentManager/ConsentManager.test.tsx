// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { ConsentManager } from './';

// mock depencies
jest.mock('services/tenant');
jest.mock('resources/GetTenant', () => 'GetTenant');
jest.mock('./Container', () => 'Container');

// by default, no cookie

jest.mock('./consent', () => ({
  getConsent: jest.fn(() => null),
  setConsent: jest.fn(),
}));

import * as consent from './consent';

import { makeUser } from 'services/__mocks__/users';
import { DESTINATIONS } from './destinations';

// object will all destinations as keys, true as values, mimicks the savedvales for a user that accepted all
const featureFagAllDisabled = DESTINATIONS.map((destination) => [
  destination,
  false,
]).reduce((a, [k, v]) => ({ ...a, [k]: v }), {});
const featureFagAllEnabled = DESTINATIONS.map((destination) => [
  destination,
  true,
]).reduce((a, [k, v]) => ({ ...a, [k]: v }), {});

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
        const wrapper = shallow(
          <ConsentManager
            authUser={null}
            tenant={{}}
            {...featureFagAllEnabled}
          />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
      it('acts properly when all disabled', () => {
        const wrapper = shallow(
          <ConsentManager
            authUser={null}
            tenant={{}}
            {...featureFagAllDisabled}
          />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
    });

    describe('admin user', () => {
      it('acts properly when all enabled', () => {
        const wrapper = shallow(
          <ConsentManager
            authUser={admin}
            tenant={{}}
            {...featureFagAllEnabled}
          />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
      it('acts properly when all disabled', () => {
        const wrapper = shallow(
          <ConsentManager
            authUser={admin}
            tenant={{}}
            {...featureFagAllDisabled}
          />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
      it('acts properly when only satismeter disabled', () => {
        const wrapper = shallow(
          <ConsentManager
            authUser={admin}
            tenant={{}}
            {...featureFagAllEnabled}
            satismeter={false}
          />
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
        const wrapper = shallow(
          <ConsentManager
            authUser={superAdmin}
            tenant={{}}
            {...featureFagAllEnabled}
          />
        );
        const categorizedDestinations = wrapper.find('Container').props()
          .categorizedDestinations;
        expect(categorizedDestinations).toMatchSnapshot();
      });
      it('acts properly when all disabled', () => {
        const wrapper = shallow(
          <ConsentManager
            authUser={superAdmin}
            tenant={{}}
            {...featureFagAllDisabled}
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
          const wrapper = shallow(
            <ConsentManager
              authUser={null}
              tenant={{}}
              {...featureFagAllEnabled}
            />
          );
          const preferences = wrapper.find('Container').props().preferences;
          expect(preferences).toEqual({
            analytics: undefined,
            advertising: undefined,
            functional: undefined,
          });
        });
        it('changes it as required', () => {
          const wrapper = shallow(
            <ConsentManager
              authUser={null}
              tenant={{}}
              {...featureFagAllEnabled}
            />
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
          const wrapper = shallow(
            <ConsentManager
              authUser={null}
              tenant={{}}
              {...featureFagAllEnabled}
            />
          );

          const isConsentRequired = wrapper.find('Container').props()
            .isConsentRequired;

          expect(isConsentRequired).toBe(true);
        });
      });
      describe('no destinations', () => {
        it('initializes preferences object correctly', () => {
          const wrapper = shallow(
            <ConsentManager
              authUser={null}
              tenant={{}}
              {...featureFagAllDisabled}
            />
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
        const mock_savedChoices = DESTINATIONS.map((destination) => [
          destination,
          true,
        ]).reduce((a, [k, v]) => ({ ...a, [k]: v }), {});
        const spy = jest
          .spyOn(consent, 'getConsent')
          .mockImplementation(() => ({
            analytics: true,
            advertising: true,
            functional: true,
            savedChoices: mock_savedChoices,
          }));
        const wrapper = shallow(
          <ConsentManager
            authUser={null}
            tenant={{}}
            {...featureFagAllEnabled}
          />
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
        const mock_savedChoices = DESTINATIONS.map((destination) => [
          destination,
          true,
        ]).reduce((a, [k, v]) => ({ ...a, [k]: v }), {});
        const spy = jest
          .spyOn(consent, 'getConsent')
          .mockImplementation(() => ({
            analytics: true,
            advertising: true,
            functional: true,
            savedChoices: mock_savedChoices,
          }));
        const wrapper = shallow(
          <ConsentManager
            authUser={null}
            tenant={{}}
            {...featureFagAllEnabled}
          />
        );

        const isConsentRequired = wrapper.find('Container').props()
          .isConsentRequired;

        expect(isConsentRequired).toBe(false);

        spy.mockRestore();
      });
    });
    describe('previously accepted, new destinations', () => {
      const mock_savedChoices = DESTINATIONS.filter((e) => e !== 'intercom')
        .map((destination) => [destination, true])
        .reduce((a, [k, v]) => ({ ...a, [k]: v }), {});
      it('initializes preferences object correctly', () => {
        // COOkIE mock
        const spy = jest
          .spyOn(consent, 'getConsent')
          .mockImplementation(() => ({
            analytics: true,
            advertising: true,
            functional: true,
            savedChoices: mock_savedChoices,
          }));

        const wrapper = shallow(
          <ConsentManager
            authUser={admin}
            tenant={{}}
            {...featureFagAllEnabled}
          />
        );
        const preferences = wrapper.find('Container').props().preferences;
        expect(preferences).toEqual({
          analytics: true,
          advertising: true,
          functional: undefined,
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
            savedChoices: mock_savedChoices,
          }));
        const wrapper = shallow(
          <ConsentManager
            authUser={admin}
            tenant={{}}
            {...featureFagAllEnabled}
          />
        );

        const isConsentRequired = wrapper.find('Container').props()
          .isConsentRequired;

        expect(isConsentRequired).toBe(true);

        spy.mockRestore();
      });
    });
    describe('previously refused', () => {
      it('initializes preferences object correctly', () => {
        const mock_savedChoices = DESTINATIONS.map((destination) => [
          destination,
          false,
        ]).reduce((a, [k, v]) => ({ ...a, [k]: v }), {});
        const spy = jest
          .spyOn(consent, 'getConsent')
          .mockImplementation(() => ({
            analytics: false,
            advertising: false,
            functional: false,
            savedChoices: mock_savedChoices,
          }));
        const wrapper = shallow(
          <ConsentManager
            authUser={null}
            tenant={{}}
            {...featureFagAllEnabled}
          />
        );
        expect(mock_savedChoices).toMatchSnapshot();
        const preferences = wrapper.find('Container').props().preferences;
        expect(preferences).toEqual({
          analytics: false,
          advertising: false,
          functional: false,
        });
        spy.mockRestore();
      });
    });
  });
});
