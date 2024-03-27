import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import InputMultilocWithLocaleSwitcher from './InputMultilocWithLocaleSwitcher';

const locales = ['en', 'fr-BE'];

const valueMultiloc = {
  en: 'English value',
  'fr-BE': 'French value',
};

describe('<InputMultilocWithLocaleSwitcher />', () => {
  it('renders', () => {
    render(
      <InputMultilocWithLocaleSwitcher
        type="text"
        valueMultiloc={valueMultiloc}
        locales={locales}
      />
    );
    expect(screen.getByDisplayValue('English value')).toBeInTheDocument();
  });
  it('renders correct initial locale when set', () => {
    render(
      <InputMultilocWithLocaleSwitcher
        type="text"
        valueMultiloc={valueMultiloc}
        locales={locales}
        initiallySelectedLocale="fr-BE"
      />
    );
    expect(screen.getByDisplayValue('French value')).toBeInTheDocument();
  });
});
