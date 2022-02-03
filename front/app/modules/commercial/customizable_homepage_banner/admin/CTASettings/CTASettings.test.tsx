import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import CTASettings from './';

describe('<CTASettings />', () => {
  it('renders the correct input', () => {
    const props = {
      latestAppConfigSettings: {
        customizable_homepage_banner: {
          cta_signed_out_type: 'no_button',
          cta_signed_in_type: 'no_button',
        },
      },
      handleOnChange: (value) => (settingKey, settingValue) => {},
      errors: null,
    };

    render(<CTASettings {...props} />);
    expect(
      screen.getByText('Button for non-registered visitors')
    ).toBeInTheDocument();
  });
});
