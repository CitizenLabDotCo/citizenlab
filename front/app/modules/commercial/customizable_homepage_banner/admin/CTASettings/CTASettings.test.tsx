import React from 'react';
import { IAppConfigurationSettings } from 'services/appConfiguration';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import CTASettings from './';

jest.mock('utils/cl-router/Link', () => 'Link');
jest.mock('utils/cl-intl');
jest.mock('services/locale');
jest.mock('services/appConfiguration');

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
  it('Custom button error fields', () => {
    render(<CTASettings {...props} />);

    const radioCustom = screen.getAllByRole('radio');
    // fireEvent.change(radioCustom[1], {checked: 'true'})
    fireEvent.click(radioCustom[1]);
    expect(screen.queryByText('This cannot be empty.')).toBeInTheDocument();
  });
});
