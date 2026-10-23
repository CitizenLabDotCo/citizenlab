import React from 'react';

import { captureMessage } from '@sentry/react';

import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';
import { WEGLOT_READY_EVENT } from 'utils/weglot';

import WeglotSwitcher from '.';

jest.mock('@sentry/react', () => ({
  captureMessage: jest.fn(),
  withScope: jest.fn((callback) =>
    callback({
      setLevel: jest.fn(),
      setTags: jest.fn(),
      setContext: jest.fn(),
    })
  ),
}));

let switcherEnabled = false;

jest.mock('api/app_configuration/useAppConfiguration', () => () => ({
  data: {
    data: {
      attributes: {
        settings: { core: { weglot_switcher_in_navbar: switcherEnabled } },
      },
    },
  },
}));

type LanguageChangedHandler = () => void;

const buildWeglot = ({
  currentLang = 'en',
  initialized = true,
  availableLanguages = ['en', 'pl', 'ur'],
}: {
  currentLang?: string;
  initialized?: boolean;
  availableLanguages?: string[];
} = {}) => {
  const handlers: LanguageChangedHandler[] = [];
  let activeLang = currentLang;

  return {
    initialized,
    initialize: jest.fn(),
    getCurrentLang: jest.fn(() => activeLang),
    switchTo: jest.fn((language: string) => {
      activeLang = language;
      handlers.forEach((handler) => handler());
    }),
    on: jest.fn((_event: string, handler: LanguageChangedHandler) => {
      handlers.push(handler);
    }),
    off: jest.fn(),
    translate: jest.fn(),
    // Weglot returns the source language plus enabled targets only; 'fr' is
    // disabled in this project, so it never reaches us.
    getAvailableLanguages: jest.fn(() => availableLanguages),
  };
};

describe('<WeglotSwitcher />', () => {
  beforeEach(() => {
    switcherEnabled = true;
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    delete window.Weglot;
  });

  it('renders nothing when the platform has not enabled it', () => {
    switcherEnabled = false;
    window.Weglot = buildWeglot();
    render(<WeglotSwitcher />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders nothing when Weglot has not loaded', () => {
    render(<WeglotSwitcher />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the current language when enabled and Weglot has loaded', () => {
    window.Weglot = buildWeglot();
    render(<WeglotSwitcher />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('lists the languages Weglot offers', () => {
    window.Weglot = buildWeglot();
    render(<WeglotSwitcher />);
    fireEvent.click(screen.getByRole('button'));

    // Names keep CLDR's own casing, so Polish stays lower-cased.
    expect(screen.getByText('polski')).toBeInTheDocument();
    expect(screen.getByText('اردو')).toBeInTheDocument();
    expect(screen.queryByText('français')).not.toBeInTheDocument();
  });

  it('switches language through Weglot and reflects the new one', () => {
    const weglot = buildWeglot();
    window.Weglot = weglot;
    render(<WeglotSwitcher />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('polski'));

    expect(weglot.switchTo).toHaveBeenCalledWith('pl');
    expect(screen.getAllByRole('button')[0]).toHaveTextContent('polski');
  });

  it('appears once Weglot finishes loading after the first render', () => {
    render(<WeglotSwitcher />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    window.Weglot = buildWeglot();
    act(() => {
      window.dispatchEvent(new Event(WEGLOT_READY_EVENT));
    });

    expect(screen.getByText('English')).toBeInTheDocument();
  });

  describe('when Weglot stops offering languages', () => {
    it('reports to Sentry once Weglot is initialized but offers none', () => {
      window.Weglot = buildWeglot({ availableLanguages: [] });
      render(<WeglotSwitcher />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(captureMessage).toHaveBeenCalledTimes(1);
      expect(captureMessage).toHaveBeenCalledWith(
        'Weglot initialized but offered no languages to the navbar switcher'
      );
      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalled();
    });

    it('stays quiet while Weglot is still initializing', () => {
      window.Weglot = buildWeglot({
        initialized: false,
        availableLanguages: [],
      });
      render(<WeglotSwitcher />);

      expect(captureMessage).not.toHaveBeenCalled();
    });

    it('stays quiet when the platform has not enabled the switcher', () => {
      switcherEnabled = false;
      window.Weglot = buildWeglot({ availableLanguages: [] });
      render(<WeglotSwitcher />);

      expect(captureMessage).not.toHaveBeenCalled();
    });

    it('reports only once per mount', () => {
      const weglot = buildWeglot({ availableLanguages: [] });
      window.Weglot = weglot;
      render(<WeglotSwitcher />);

      act(() => {
        window.dispatchEvent(new Event(WEGLOT_READY_EVENT));
      });

      expect(captureMessage).toHaveBeenCalledTimes(1);
    });
  });
});
