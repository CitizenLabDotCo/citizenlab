import React from 'react';
import FormattedMessage from './';
import { screen, render } from 'utils/testUtils/rtl';
import regularMessages from 'components/Author/messages';
import orgNameMessages from 'components/CityLogoSection/messages';
import tenantNameMessages from 'containers/SignUpInPage/messages';

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocale');
jest.mock('hooks/useAppConfiguration', () => () => ({
  attributes: {
    name: 'tenant name',
    settings: {
      core: { organization_name: { en: 'organization name' }, locales: ['en'] },
    },
  },
}));

describe('FormattedMessage', () => {
  it('renders', () => {
    render(<FormattedMessage {...regularMessages.a11y_postedBy} />);
    expect(screen.getByText('Posted by:')).toBeInTheDocument();
  });
  it('renders orgName', () => {
    render(<FormattedMessage {...orgNameMessages.iframeTitle} />);
    expect(
      screen.getByText('More information about organization name')
    ).toBeInTheDocument();
  });
  it('renders tenantName', () => {
    render(<FormattedMessage {...tenantNameMessages.signUpMetaTitle} />);
    expect(
      screen.getByText(
        'Sign up for the CitizenLab platform of tenant name | CitizenLab'
      )
    ).toBeInTheDocument();
  });
});
