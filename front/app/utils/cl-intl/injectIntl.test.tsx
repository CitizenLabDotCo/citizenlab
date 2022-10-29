import React from 'react';
import injectIntl from './injectIntl';
import { screen, render } from 'utils/testUtils/rtl';
import regularMessages from 'components/Author/messages';
import orgNameMessages from 'components/CityLogoSection/messages';
import tenantNameMessages from 'containers/SignUpInPage/messages';

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocale');
jest.mock('hooks/useLocalize');
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
    const Component = injectIntl(({ intl: { formatMessage } }) => {
      return <p>{formatMessage(regularMessages.a11y_postedBy)}</p>;
    });
    render(<Component />);
    expect(screen.getByText('Posted by:')).toBeInTheDocument();
  });
  it('renders orgName', () => {
    const Component = injectIntl(({ intl: { formatMessage } }) => {
      return <p>{formatMessage(orgNameMessages.iframeTitle)}</p>;
    });
    render(<Component />);
    expect(
      screen.getByText('More information about organization name')
    ).toBeInTheDocument();
  });
  it('renders tenantName', () => {
    const Component = injectIntl(({ intl: { formatMessage } }) => {
      return <p>{formatMessage(tenantNameMessages.signUpMetaTitle)}</p>;
    });
    render(<Component />);
    expect(
      screen.getByText(
        'Sign up for the CitizenLab platform of tenant name | CitizenLab'
      )
    ).toBeInTheDocument();
  });
});
