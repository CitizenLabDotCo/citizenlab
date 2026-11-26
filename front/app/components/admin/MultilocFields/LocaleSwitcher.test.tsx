import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import LanguageButtonContext from './LanguageButtonContext';
import LocaleSwitcher from './LocaleSwitcher';

const props = {
  'aria-label': 'Title',
  locales: ['en', 'nl-BE'] as const,
  selectedLocale: 'en' as const,
  onChange: jest.fn(),
  valueMultiloc: { en: 'Park renewal' },
};

describe('LocaleSwitcher', () => {
  it('keeps the segmented switcher outside the new back office', () => {
    render(<LocaleSwitcher {...props} locales={[...props.locales]} />);

    expect(screen.getByRole('radiogroup', { name: 'Title' })).toBeVisible();
  });

  it('uses the Language button inside the new back office', () => {
    render(
      <LanguageButtonContext.Provider value>
        <LocaleSwitcher {...props} locales={[...props.locales]} />
      </LanguageButtonContext.Provider>
    );

    expect(
      screen.getByRole('button', {
        name: 'Title: English. 1 of 2 languages done',
      })
    ).toBeVisible();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });
});
