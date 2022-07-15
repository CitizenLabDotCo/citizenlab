import React from 'react';
import { IAppConfigurationSettings } from 'services/appConfiguration';
import { render, screen } from 'utils/testUtils/rtl';
import { IHomepageSettings } from 'services/homepageSettings';

import CTASettings from './';

jest.mock('utils/cl-router/Link', () => 'Link');
jest.mock('utils/cl-intl');
jest.mock('services/locale');
jest.mock('services/appConfiguration');

const props = {
  latestAppConfigSettings: {
    customizable_homepage_banner: {
      allowed: true,
      layout: 'full_width_banner_layout',
    },
  } as Partial<IAppConfigurationSettings>,
  latestHomepageSettings: {
    data: {
      attributes: {
        customizable_homepage_banner_enabled: true,
        banner_cta_signed_out_type: 'no_button',
        banner_cta_signed_in_type: 'no_button',
      },
    },
  } as Partial<IHomepageSettings>,
  handleOnChange: (_value) => (_settingKey, _settingValue) => {},
  errors: { base: [{ error: 'some error' }] },
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
