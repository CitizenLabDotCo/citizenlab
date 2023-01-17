import React from 'react';
import { render, act, fireEvent, screen } from 'utils/testUtils/rtl';
import eventEmitter from 'utils/eventEmitter';

// component to test
import Container from './Container';
import { CategorizedDestinations } from './typings';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('modules', () => ({ streamsToReset: [] }));
jest.mock('utils/cl-router/Link', () => ({ children }) => <a>{children}</a>);

let updatePreference: jest.Mock;
let resetPreferences: jest.Mock;
let saveConsent: jest.Mock;
let accept: jest.Mock;
let reject: jest.Mock;

const initialPreferences = {
  analytics: undefined,
  functional: undefined,
  advertising: undefined,
};

const categorizedDestinations: CategorizedDestinations = {
  analytics: ['google_analytics'],
  functional: ['intercom'],
  advertising: [],
};

const emptyFunction = () => {};

describe('<Container />', () => {
  beforeEach(() => {
    updatePreference = jest.fn();
    resetPreferences = jest.fn();
    saveConsent = jest.fn();
    accept = jest.fn();
    reject = jest.fn();
  });

  it('renders correctly when no destinations are allowed by the tenant (i.e. isConsentRequired === false)', () => {
    const { container } = render(
      <Container
        updatePreference={updatePreference}
        resetPreferences={resetPreferences}
        saveConsent={saveConsent}
        accept={accept}
        reject={reject}
        isConsentRequired={false}
        preferences={initialPreferences}
        categorizedDestinations={categorizedDestinations}
        onToggleModal={emptyFunction}
      />
    );

    expect(
      container.querySelector('#e2e-preference-dialog')
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('#e2e-cookie-banner')
    ).not.toBeInTheDocument();

    // wih no destinations allowed, isConsentRequired will be false so no banner
    // but the modal is still accessible trough the cookie policy
    act(() => {
      eventEmitter.emit('openConsentManager');
    });

    expect(
      container.querySelector('#e2e-preference-dialog')
    ).toBeInTheDocument();
    expect(
      container.querySelector('#e2e-cookie-banner')
    ).not.toBeInTheDocument();
  });

  describe('shows the banner is and only if consent is required', () => {
    it('consent is required, it shows the banner', () => {
      const { container } = render(
        <Container
          updatePreference={updatePreference}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          accept={accept}
          reject={reject}
          isConsentRequired={true}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
          onToggleModal={emptyFunction}
        />
      );

      expect(container.querySelector('#e2e-cookie-banner')).toBeInTheDocument();
    });

    it("consent is't required, it doesn't show the banner", () => {
      const { container } = render(
        <Container
          updatePreference={updatePreference}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          accept={accept}
          reject={reject}
          isConsentRequired={false}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
          onToggleModal={emptyFunction}
        />
      );

      expect(
        container.querySelector('#e2e-cookie-banner')
      ).not.toBeInTheDocument();
    });
  });

  describe.only('handles opening and closing the modal', () => {
    it('modal is initially closed when consent is required', () => {
      const { container } = render(
        <Container
          updatePreference={updatePreference}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          accept={accept}
          reject={reject}
          isConsentRequired={true}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
          onToggleModal={emptyFunction}
        />
      );

      expect(
        container.querySelector('#e2e-preference-dialog')
      ).not.toBeInTheDocument();
    });

    it("modal is initially closed when consent is't required", () => {
      const { container } = render(
        <Container
          updatePreference={updatePreference}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          accept={accept}
          reject={reject}
          isConsentRequired={false}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
          onToggleModal={emptyFunction}
        />
      );

      expect(
        container.querySelector('#e2e-preference-dialog')
      ).not.toBeInTheDocument();
    });

    it.only('is possible to open modal', () => {
      const { container } = render(
        <Container
          updatePreference={updatePreference}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          accept={accept}
          reject={reject}
          isConsentRequired={true}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
          onToggleModal={emptyFunction}
        />
      );

      expect(
        container.querySelector('#e2e-preference-dialog')
      ).not.toBeInTheDocument();

      const preferencesButton = container.querySelectorAll('button');
      console.log(preferencesButton);
      expect(preferencesButton[0]).toBeInTheDocument();

      fireEvent.click(preferencesButton[0]);
      expect(
        container.querySelector('#e2e-preference-dialog')
      ).toBeInTheDocument();
    });

    it('is possible to close modal', () => {
      const { container } = render(
        <Container
          updatePreference={updatePreference}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          accept={accept}
          reject={reject}
          isConsentRequired={true}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
          onToggleModal={emptyFunction}
        />
      );

      const preferencesButton = container.querySelectorAll(
        '.integration-open-modal'
      )[0];
      fireEvent.click(preferencesButton);
      expect(
        container.querySelector('#e2e-preference-dialog')
      ).toBeInTheDocument();

      const closeButton = container.querySelectorAll(
        '.e2e-modal-close-button'
      )[0];
      fireEvent.click(closeButton);
      expect(
        container.querySelector('#e2e-preference-dialog')
      ).not.toBeInTheDocument();
    });

    it('opens when openConsentManager event fires', () => {
      const { container } = render(
        <Container
          updatePreference={updatePreference}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          accept={accept}
          reject={reject}
          isConsentRequired={true}
          preferences={initialPreferences}
          categorizedDestinations={categorizedDestinations}
          onToggleModal={emptyFunction}
        />
      );

      expect(
        container.querySelector('#e2e-preference-dialog')
      ).not.toBeInTheDocument();
      eventEmitter.emit('openConsentManager');
      expect(
        container.querySelector('#e2e-preference-dialog')
      ).toBeInTheDocument();
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
          onToggleModal={emptyFunction}
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
          onToggleModal={emptyFunction}
        />
      );
      wrapper.instance().setState({ isDialogOpen: true });

      expect(wrapper.find('Banner').exists()).toBeTruthy();
      expect(wrapper.find('Modal').props().opened).toBe(true);
      const { footer } = wrapper.find('Modal').props();
      shallow(footer).props().handleCancel();
      expect(wrapper.find('Modal').props().opened).toBe(false);
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
          onToggleModal={emptyFunction}
        />
      );
      wrapper.instance().setState({ isDialogOpen: true });

      expect(wrapper.find('Banner').exists()).toBeTruthy();
      expect(wrapper.find('Modal').props().opened).toBe(true);
      const { footer } = wrapper.find('Modal').props();
      shallow(footer).props().handleCancel();
      expect(wrapper.find('Modal').props().opened).toBe(true);
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
          onToggleModal={emptyFunction}
        />
      );
      wrapper.instance().setState({ isDialogOpen: true, isCancelling: true });

      expect(wrapper.find('Banner').exists()).toBeTruthy();
      const { footer } = wrapper.find('Modal').props();
      shallow(footer).props().handleCancelConfirm();
      expect(wrapper.find('Modal').props().opened).toBe(false);
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
          onToggleModal={emptyFunction}
        />
      );
      wrapper.instance().setState({ isDialogOpen: true, isCancelling: true });

      expect(wrapper.find('Banner').exists()).toBeTruthy();
      const { footer } = wrapper.find('Modal').props();
      shallow(footer).props().handleCancelBack();
      expect(wrapper.find('Modal').props().opened).toBe(true);
      expect(wrapper.find('Banner').exists()).toBeTruthy();
      expect(setPreferences).not.toHaveBeenCalled();
      expect(saveConsent).not.toHaveBeenCalled();
      expect(resetPreferences).not.toHaveBeenCalled();
    });
  });
});
