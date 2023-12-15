import React from 'react';
import { render, act, fireEvent } from 'utils/testUtils/rtl';
import eventEmitter from 'utils/eventEmitter';

// component to test
import Container from './Container';
import { CategorizedDestinations } from './typings';

// mock utilities

jest.mock('utils/cl-router/Link', () => ({ children }) => (
  <button>{children}</button>
));

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
      container.querySelector('#e2e-cookie-modal')
    ).not.toBeInTheDocument();

    // wih no destinations allowed, isConsentRequired will be false so no banner
    // but the modal is still accessible through the cookie policy
    act(() => {
      eventEmitter.emit('openConsentManager');
    });

    expect(
      container.querySelector('#e2e-preference-dialog')
    ).toBeInTheDocument();
    expect(
      container.querySelector('#e2e-cookie-modal')
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

      expect(container.querySelector('#e2e-cookie-modal')).toBeInTheDocument();
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
        container.querySelector('#e2e-cookie-modal')
      ).not.toBeInTheDocument();
    });
  });

  describe('handles opening and closing the modal', () => {
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

    it('is possible to open modal', () => {
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

      const preferencesButton = container.querySelector(
        '.integration-open-modal'
      );

      expect(preferencesButton).toBeInTheDocument();

      fireEvent.click(preferencesButton);
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

      act(() => {
        eventEmitter.emit('openConsentManager');
      });

      expect(
        container.querySelector('#e2e-preference-dialog')
      ).toBeInTheDocument();
    });
  });

  describe('handles cancelling', () => {
    it('while cancelling, confirming cancellation closes the modal and keeps the banner', () => {
      render(
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

      act(() => {
        eventEmitter.emit('openConsentManager');
      });
      // TODO
    });

    it('while cancelling, cancelling cancellation is still possible', () => {
      render(
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

      act(() => {
        eventEmitter.emit('openConsentManager');
      });
      // TODO
    });
  });
});
