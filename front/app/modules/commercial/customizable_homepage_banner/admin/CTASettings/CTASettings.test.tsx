import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import {
  CTASignedOutType,
  CTASignedInType,
  THomepageBannerLayout,
} from 'services/appConfiguration';

import CTASettings from './';

jest.mock('utils/cl-router/Link', () => 'Link');
jest.mock('utils/cl-intl');
jest.mock(
  'components/UI/InputMultilocWithLocaleSwitcher',
  () => 'InputMultilocWithLocaleSwitcher'
);
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

const props = {
  latestAppConfigSettings: {
    customizable_homepage_banner: {
      allowed: true,
      enabled: true,
      layout: 'full_width_layout' as THomepageBannerLayout,
      cta_signed_out_type: 'no_button' as CTASignedOutType,
      cta_signed_in_type: 'no_button' as CTASignedInType,
    },
  },
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
