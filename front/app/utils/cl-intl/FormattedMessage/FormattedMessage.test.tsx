import React from 'react';
import FormattedMessage from './';
import { screen, render } from 'utils/testUtils/rtl';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  regular: {
    id: 'regular',
    defaultMessage: 'Message',
  },
  orgName: {
    id: 'orgName',
    defaultMessage: 'Message { orgName }',
  },
  tenantName: {
    id: 'tenant',
    defaultMessage: 'Message { tenantName }',
  },
});

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
    render(<FormattedMessage {...messages.regular} />);
    expect(screen.getByText('Message')).toBeInTheDocument();
  });
  it('renders orgName', () => {
    render(<FormattedMessage {...messages.orgName} />);
    expect(screen.getByText('Message organization name')).toBeInTheDocument();
  });
  it('renders tenantName', () => {
    render(<FormattedMessage {...messages.tenantName} />);
    expect(screen.getByText('Message tenant name')).toBeInTheDocument();
  });
});
