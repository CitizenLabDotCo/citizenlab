import React from 'react';
import { MessageDescriptor, createIntl } from 'react-intl';
const Intl = jest.requireActual('react-intl');

const defaultProps = {
  locale: 'en',
  defaultLocale: 'en',
};

const intl = createIntl({ locale: 'en', messages: {} });

const formatMessageReplacement = (
  messageDescriptor: MessageDescriptor,
  values?: { [key: string]: string | number | boolean | Date } | undefined
) => {
  return intl.formatMessage(messageDescriptor, {
    tenantName: 'The Test',
    orgName: 'Test Town',
    orgType: 'testing',
    ...(values || {}),
  });
};

const intlReplacement = {
  ...intl,
  formatMessage: formatMessageReplacement,
};

const injectIntlReplacement = (Node) => {
  const renderWrapped = (props) => <Node {...props} intl={intl} />;
  renderWrapped.displayName = Node.displayName || Node.name || 'Component';
  return renderWrapped;
};

Intl.injectIntl = injectIntlReplacement;

// Override components by implementing the real components
//  providing them the context they need in order to function
const {
  IntlProvider,
  FormattedDate,
  FormattedTime,
  FormattedNumber,
  FormattedPlural,
  FormattedMessage,
} = Intl;

Intl.FormattedDate = (props) => (
  <IntlProvider {...defaultProps}>
    <FormattedDate {...props} />
  </IntlProvider>
);
Intl.FormattedTime = (props) => (
  <IntlProvider {...defaultProps}>
    <FormattedTime {...props} />
  </IntlProvider>
);
Intl.FormattedNumber = (props) => (
  <IntlProvider {...defaultProps}>
    <FormattedNumber {...props} />
  </IntlProvider>
);
Intl.FormattedPlural = (props) => (
  <IntlProvider {...defaultProps}>
    <FormattedPlural {...props} />
  </IntlProvider>
);
Intl.FormattedMessage = (props) => (
  <IntlProvider {...defaultProps}>
    <FormattedMessage {...props} />
  </IntlProvider>
);

// Set displayName so that snapshots don't use "Uknown" as component name
Intl.FormattedDate.displayName = 'FormattedDate';
Intl.FormattedTime.displayName = 'FormattedTime';
Intl.FormattedRelativeTime.displayName = 'FormattedRelative';
Intl.FormattedNumber.displayName = 'FormattedNumber';
Intl.FormattedPlural.displayName = 'FormattedPlural';
Intl.FormattedMessage.displayName = 'FormattedMessage';

// Special hook for tests, real package does not export this
Intl.intl = intlReplacement;

module.exports = Intl;
