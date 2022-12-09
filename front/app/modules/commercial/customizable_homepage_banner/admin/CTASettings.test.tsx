// for dev purposes
// @ts-nocheck
import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';

import CTASettings from './CTASettings';

jest.mock('utils/cl-router/Link', () => 'Link');
jest.mock('utils/cl-intl');
jest.mock('services/locale');
jest.mock('services/appConfiguration');

const props = {
  homepageSettings: {
    banner_layout: 'full_width_banner_layout',
    banner_cta_signed_out_type: 'no_button',
    banner_cta_signed_in_type: 'no_button',
  } as IHomepageSettingsAttributes,
  handleOnChange: (_settingKey, _settingValue) => {},
  errors: { base: [{ error: 'some error' }] },
};

describe.skip('<CTASettings />', () => {
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
