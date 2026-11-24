import React from 'react';

import { getTheme } from '@citizenlab/cl2-component-library';
import { ThemeProvider } from 'styled-components';

import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';
import { WEGLOT_READY_EVENT, reportMissingWeglotLanguages } from 'utils/weglot';

import WeglotSwitcher from '.';

// Only the reporter is faked; it dedupes with module state of its own, which
// is covered in utils/weglot.test.ts.
jest.mock('utils/weglot', () => ({
  ...jest.requireActual('utils/weglot'),
  reportMissingWeglotLanguages: jest.fn(),
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
      expect(reportMissingWeglotLanguages).toHaveBeenCalledTimes(1);
    });

    it('stays quiet for a project with a source language but no targets', () => {
      window.Weglot = buildWeglot({ availableLanguages: ['en'] });
      render(<WeglotSwitcher />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(reportMissingWeglotLanguages).not.toHaveBeenCalled();
    });

    it('stays quiet while Weglot is still initializing', () => {
      window.Weglot = buildWeglot({
        initialized: false,
        availableLanguages: [],
      });
      render(<WeglotSwitcher />);

      expect(reportMissingWeglotLanguages).not.toHaveBeenCalled();
    });

    it('stays quiet when the platform has not enabled the switcher', () => {
      switcherEnabled = false;
      window.Weglot = buildWeglot({ availableLanguages: [] });
      render(<WeglotSwitcher />);

      expect(reportMissingWeglotLanguages).not.toHaveBeenCalled();
    });

    it('reports once when Weglot loads late and offers nothing', () => {
      // No window.Weglot yet, so the component waits on the ready event.
      render(<WeglotSwitcher />);
      expect(reportMissingWeglotLanguages).not.toHaveBeenCalled();

      window.Weglot = buildWeglot({ availableLanguages: [] });
      act(() => {
        window.dispatchEvent(new Event(WEGLOT_READY_EVENT));
      });

      expect(reportMissingWeglotLanguages).toHaveBeenCalledTimes(1);
    });
  });

  describe('floating variant', () => {
    const renderFloating = (isRtl: boolean) => {
      render(
        <ThemeProvider theme={{ ...getTheme(null), isRtl }}>
          <WeglotSwitcher floating />
        </ThemeProvider>
      );
      // The fixed corner wrapper is the switcher's parent.
      return screen.getByRole('button').closest('[data-wg-notranslate]')
        ?.parentElement as HTMLElement;
    };

    it('pins to the left on a left-to-right platform', () => {
      window.Weglot = buildWeglot();
      const wrapper = renderFloating(false);

      expect(wrapper).toHaveStyle({ left: '20px' });
    });

    it('mirrors to the right on an RTL platform, so the panel stays on screen', () => {
      window.Weglot = buildWeglot();
      const wrapper = renderFloating(true);

      expect(wrapper).toHaveStyle({ right: '20px' });
    });
  });

  it('names the current language in the accessible label', () => {
    window.Weglot = buildWeglot({ currentLang: 'pl' });
    render(<WeglotSwitcher />);

    // aria-label replaces the visible text, so it has to carry the language.
    expect(screen.getByRole('button', { name: /polski/ })).toBeInTheDocument();
  });

  it('closes the dropdown when the toggle is clicked again', () => {
    window.Weglot = buildWeglot();
    render(<WeglotSwitcher />);

    const toggle = screen.getAllByRole('button')[0];
    fireEvent.click(toggle);
    expect(screen.getByText('polski')).toBeVisible();

    fireEvent.click(toggle);
    expect(screen.queryByText('polski')).not.toBeInTheDocument();
  });
});
