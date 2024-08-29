import React from 'react';

import { render, screen, fireEvent } from '../../utils/testUtils/rtl';

import LocaleSwitcher, { isValueForLocaleFilled } from '.';

describe('<LocaleSwitcher />', () => {
  it('renders', () => {
    const handleOnSelectedLocaleChange = jest.fn();

    render(
      <LocaleSwitcher
        locales={['en-GB', 'nl-BE']}
        selectedLocale={'en-GB'}
        onSelectedLocaleChange={handleOnSelectedLocaleChange}
      />
    );
    expect(screen.getByText('en-GB')).toBeInTheDocument();
    expect(screen.getByText('nl-BE')).toBeInTheDocument();
  });

  it('calls onSelectedLocaleChange when clicking on another locale', () => {
    const handleOnSelectedLocaleChange = jest.fn();

    render(
      <LocaleSwitcher
        locales={['en-GB', 'nl-BE']}
        selectedLocale={'en-GB'}
        onSelectedLocaleChange={handleOnSelectedLocaleChange}
      />
    );

    fireEvent.click(screen.getByText('nl-BE'));

    expect(handleOnSelectedLocaleChange).toHaveBeenCalledWith('nl-BE');
  });

  it('does not call onSelectedLocaleChange when clicking the selected locale', () => {
    const handleOnSelectedLocaleChange = jest.fn();

    render(
      <LocaleSwitcher
        locales={['en-GB', 'nl-BE']}
        selectedLocale={'en-GB'}
        onSelectedLocaleChange={handleOnSelectedLocaleChange}
      />
    );

    fireEvent.click(screen.getByText('en-GB'));

    expect(handleOnSelectedLocaleChange).not.toHaveBeenCalled();
  });

  describe('isValueForLocaleFilled', () => {
    it('returns true if the value is filled for the given locale', () => {
      const testValue = {
        titleMultiloc: {
          en: 'Option 1',
          fr: 'Option 2',
        },
      };

      expect(isValueForLocaleFilled('en', testValue)).toBe(true);
    });

    it('returns false if the value is not filled for the given locale', () => {
      const testValue = {
        titleMultiloc: {
          en: 'Option 1',
          fr: 'Option 2',
        },
      };

      expect(isValueForLocaleFilled('nl', testValue)).toBe(false);
    });

    it('returns true if the value is filled for the given locale in an array', () => {
      const testValue = [
        {
          title_multiloc: {
            en: 'Option 1',
            fr: 'Option 1',
          },
        },
        {
          title_multiloc: {
            en: 'Option 2',
            fr: 'Option 2',
          },
        },
      ];

      expect(isValueForLocaleFilled('en', testValue)).toBe(true);
    });

    it('returns false if the value is not filled for the given locale in an array', () => {
      const testValue = [
        {
          title_multiloc: {
            en: 'Option 1',
            fr: 'Option 1',
          },
        },
        {
          title_multiloc: {
            en: '',
            fr: 'Option 2',
          },
        },
      ];

      expect(isValueForLocaleFilled('en', testValue)).toBe(false);
    });
  });
});
