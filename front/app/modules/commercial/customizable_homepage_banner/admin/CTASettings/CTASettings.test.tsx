import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import CTASettings from './';

jest.mock('utils/cl-router/Link', () => 'Link');
jest.mock('utils/cl-intl');
jest.mock(
  'components/UI/InputMultilocWithLocaleSwitcher',
  () => 'InputMultilocWithLocaleSwitcher'
);
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

const latestAppConfigSettings = {
  customizable_homepage_banner: {
    cta_signed_out_type: 'no_button',
    cta_signed_in_type: 'no_button',
  },
};

const handleOnChange = (value) => (settingKey, settingValue) => {};

const errors = null;

const props = { latestAppConfigSettings, handleOnChange, errors };
console.log(props);

describe('TestDescribe', () => {
  it('Test1', () => {
    render(<CTASettings {...props} />);
    expect(
      screen.getByText('Button for non-registered visitors')
    ).toBeInTheDocument();
  });
});
