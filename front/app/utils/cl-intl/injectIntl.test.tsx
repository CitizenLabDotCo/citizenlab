import React from 'react';

import { defineMessages } from 'react-intl';

import { screen, render } from 'utils/testUtils/rtl';

import injectIntl from './injectIntl';

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

jest.mock('api/app_configuration/useAppConfiguration', () => () => ({
  data: {
    data: {
      attributes: {
        name: 'tenant name',
        settings: {
          core: {
            organization_name: { en: 'organization name' },
            locales: ['en'],
          },
        },
      },
    },
  },
}));

describe('FormattedMessage', () => {
  it('renders', () => {
    const Component = injectIntl(({ intl: { formatMessage } }) => {
      return <p>{formatMessage(messages.regular)}</p>;
    });
    render(<Component />);
    expect(screen.getByText('Message')).toBeInTheDocument();
  });
  it('renders orgName', () => {
    const Component = injectIntl(({ intl: { formatMessage } }) => {
      return <p>{formatMessage(messages.orgName)}</p>;
    });
    render(<Component />);
    expect(screen.getByText('Message organization name')).toBeInTheDocument();
  });
  it('renders tenantName', () => {
    const Component = injectIntl(({ intl: { formatMessage } }) => {
      return <p>{formatMessage(messages.tenantName)}</p>;
    });
    render(<Component />);
    expect(screen.getByText('Message tenant name')).toBeInTheDocument();
  });
});
