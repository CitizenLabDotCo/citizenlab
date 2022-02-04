import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import { IAppConfigurationSettings } from 'services/appConfiguration';

import CTASettings from './';

jest.mock('utils/cl-router/Link', () => 'Link');
jest.mock('utils/cl-intl');
jest.mock(
  'components/UI/InputMultilocWithLocaleSwitcher',
  () => 'InputMultilocWithLocaleSwitcher'
);
const locales = ['en'];
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => locales));

const props = {
  latestAppConfigSettings: {
    customizable_homepage_banner: {
      allowed: true,
      enabled: true,
      layout: 'full_width_banner_layout',
      cta_signed_out_type: 'no_button',
      cta_signed_in_type: 'no_button',
    },
  } as Partial<IAppConfigurationSettings>,
  handleOnChange: (_value) => (_settingKey, _settingValue) => {},
  errors: {},
};

describe('<CTASettings />', () => {
  it('Non-registered visitors label', () => {
    render(<CTASettings {...props} />);
    expect(
      screen.getByText('Button for non-registered visitors')
    ).toBeInTheDocument();
  });
  it('Registered visitors label', () => {
    render(<CTASettings {...props} />);
    expect(
      screen.getByText('Button for registered visitors')
    ).toBeInTheDocument();
  });
});
