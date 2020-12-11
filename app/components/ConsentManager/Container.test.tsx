// libraries
import React from 'react';
import { shallow } from 'enzyme';
import eventEmitter from 'utils/eventEmitter';

import 'jest-styled-components';

// component to test
import Container from './Container';

// mock utilities
jest.mock('./Banner', () => 'Banner');
jest.mock('./PreferencesDialog', () => 'PreferencesDialog');
jest.mock('./Footer', () => 'Footer');
jest.mock('components/Loadable/Modal', () => 'LoadableModal');

jest.mock('utils/cl-intl');
const Intl = require('utils/cl-intl/__mocks__/');
const { intl } = Intl;

let setPreferences: jest.Mock;
let resetPreferences: jest.Mock;
let saveConsent: jest.Mock;

const initialPreferences = {
  analytics: undefined,
  functional: undefined,
  advertising: undefined,
};

const categorizedDestinations = {
  analytics: ['google_analytics'],
  functional: ['intercom'],
  advertising: [],
};

describe('<Container />', () => {
  beforeEach(() => {
    setPreferences = jest.fn();
    resetPreferences = jest.fn();
    saveConsent = jest.fn();
  });

  it('renders correclty when no destinations are allowed by the tenant', () => {
    const wrapper = shallow(
      <Container
        intl={intl}
        setPreferences={setPreferences}
        resetPreferences={resetPreferences}
        saveConsent={saveConsent}
        isConsentRequired={false}
        preferences={initialPreferences}
        categorizedDestinations={categorizedDestinations}
      />
    );

    // wih no destinations allowed, isConsentRequired will be false so no banner
    // but the modal is still accessible trough the cookie policy
    eventEmitter.emit('openConsentManager');
    expect(wrapper).toMatchSnapshot();
  });

  it('handle changes as expected', () => {
    const wrapper = shallow(
      <Container
        intl={intl}
        setPreferences={setPreferences}
        resetPreferences={resetPreferences}
        saveConsent={saveConsent}
        isConsentRequired={true}
        preferences={initialPreferences}
        categorizedDestinations={categorizedDestinations}
      />
    );

    wrapper.find('PreferencesDialog').props().onChange('advertising', false);

    // accept all only calls saveConsent with preferences unchanged, so still equal to initialPreferences.
    // it's tested on the ConsentManager that this will have the expected behaviour.
    expect(setPreferences).toHaveBeenCalledWith({ advertising: false });
    expect(saveConsent).not.toHaveBeenCalled();
    expect(resetPreferences).not.toHaveBeenCalled();
  });

  describe('shows the banner is and only if consent is required', () => {
    it('consent is required, it shows the banner', () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={true}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
        />
      );
      expect(wrapper.find('Banner').exists()).toBeTruthy();
    });
    it("consent is't required, it doesn't show the banner", () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={false}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
        />
      );
      expect(wrapper.find('Banner').exists()).toBeFalsy();
    });
  });

  describe('handles opening and closing the modal', () => {
    it('modal is initially closed when consent is required', () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={true}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
        />
      );
      expect(wrapper.find('LoadableModal').props().opened).toBe(false);
    });
    it("modal is initially closed when consent is't required", () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={false}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
        />
      );
      expect(wrapper.find('LoadableModal').props().opened).toBe(false);
    });
    it('passes down to Banner a handler that opens the modal', () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={true}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
        />
      );
      expect(wrapper.find('LoadableModal').props().opened).toBe(false);
      wrapper.find('Banner').props().onChangePreferences();
      expect(wrapper.find('LoadableModal').props().opened).toBe(true);
    });

    it('passes down to Modal a handler that closes the modal', () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={true}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
        />
      );
      wrapper.instance().setState({ isDialogOpen: true });
      expect(wrapper.find('LoadableModal').props().opened).toBe(true);
      wrapper.find('LoadableModal').props().close();
      expect(wrapper.find('LoadableModal').props().opened).toBe(false);
    });

    it('reacts to openConsentManager events by opening the modal', () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={true}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
        />
      );
      expect(wrapper.find('LoadableModal').props().opened).toBe(false);
      eventEmitter.emit('openConsentManager');
      expect(wrapper.find('LoadableModal').props().opened).toBe(true);
    });
  });

  describe('handles preferences form validation', () => {
    it('is invalid when when some field is empty', () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={true}
          preferences={{
            analytics: true,
            functional: undefined,
            advertising: undefined,
          }}
          categorizedDestinations={categorizedDestinations}
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
          isConsentRequired={true}
          preferences={{
            analytics: true,
            functional: false,
            advertising: false,
          }}
          categorizedDestinations={categorizedDestinations}
        />
      );
      expect((wrapper.instance() as any).validate()).toBeTruthy();
    });
  });

  describe('handles cancelling', () => {
    it('cancelling with no preference set closes the modal and lets the banner open', () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={true}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
        />
      );
      wrapper.instance().setState({ isDialogOpen: true });

      expect(wrapper.find('Banner').exists()).toBeTruthy();
      expect(wrapper.find('LoadableModal').props().opened).toBe(true);
      const { footer } = wrapper.find('LoadableModal').props();
      shallow(footer).props().handleCancel();
      expect(wrapper.find('LoadableModal').props().opened).toBe(false);
      expect(wrapper.find('Banner').exists()).toBeTruthy();
      expect(setPreferences).not.toHaveBeenCalled();
      expect(saveConsent).not.toHaveBeenCalled();
      expect(resetPreferences).toHaveBeenCalled();
    });

    it('cancelling with some preference set prompts confirmation and lets the banner open', () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={true}
          preferences={{
            analytics: true,
            functional: null,
            advertising: null,
          }}
          categorizedDestinations={categorizedDestinations}
        />
      );
      wrapper.instance().setState({ isDialogOpen: true });

      expect(wrapper.find('Banner').exists()).toBeTruthy();
      expect(wrapper.find('LoadableModal').props().opened).toBe(true);
      const { footer } = wrapper.find('LoadableModal').props();
      shallow(footer).props().handleCancel();
      expect(wrapper.find('LoadableModal').props().opened).toBe(true);
      expect(wrapper.state().isCancelling).toBe(true);
      expect(wrapper.find('Banner').exists()).toBeTruthy();
      expect(setPreferences).not.toHaveBeenCalled();
      expect(saveConsent).not.toHaveBeenCalled();
      expect(resetPreferences).not.toHaveBeenCalled();
    });

    it('while cancelling, confirming cancellation closes the modal and keeps the banner', () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={true}
          preferences={{
            analytics: true,
            functional: null,
            advertising: null,
          }}
          categorizedDestinations={categorizedDestinations}
        />
      );
      wrapper.instance().setState({ isDialogOpen: true, isCancelling: true });

      expect(wrapper.find('Banner').exists()).toBeTruthy();
      const { footer } = wrapper.find('LoadableModal').props();
      shallow(footer).props().handleCancelConfirm();
      expect(wrapper.find('LoadableModal').props().opened).toBe(false);
      expect(wrapper.find('Banner').exists()).toBeTruthy();
      expect(setPreferences).not.toHaveBeenCalled();
      expect(saveConsent).not.toHaveBeenCalled();
      expect(resetPreferences).toHaveBeenCalled();
    });

    it('while cancelling, cancelling cancellation is still possible', () => {
      const wrapper = shallow(
        <Container
          intl={intl}
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={true}
          preferences={{
            analytics: true,
            functional: null,
            advertising: null,
          }}
          categorizedDestinations={categorizedDestinations}
        />
      );
      wrapper.instance().setState({ isDialogOpen: true, isCancelling: true });

      expect(wrapper.find('Banner').exists()).toBeTruthy();
      const { footer } = wrapper.find('LoadableModal').props();
      shallow(footer).props().handleCancelBack();
      expect(wrapper.find('LoadableModal').props().opened).toBe(true);
      expect(wrapper.find('Banner').exists()).toBeTruthy();
      expect(setPreferences).not.toHaveBeenCalled();
      expect(saveConsent).not.toHaveBeenCalled();
      expect(resetPreferences).not.toHaveBeenCalled();
    });
  });
});
