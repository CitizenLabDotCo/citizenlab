import { createIntl, MessageDescriptor } from 'react-intl';
import messages from '../app/i18n/en';
const Intl = jest.requireActual('react-intl');

// Initialise the real provider so that we don't
// need to reimplement any internals
const defaultProps = {
  locale: 'en',
  defaultLocale: 'en',
};

// The exact same `intl` object the real code receives ;-)
const intl = createIntl({ locale: 'en', messages });

const formatMessageReplacement = (
  messageDescriptor: MessageDescriptor,
  values?: { [key: string]: string | number | boolean | Date } | undefined
) => {
  return intl.formatMessage(messageDescriptor, {
    ...(values || {}),
  });
};

const intlReplacement = {
  ...intl,
  formatMessage: formatMessageReplacement,
};

// Set displayName so that snapshots don't use "Uknown" as component name
Intl.FormattedDate.displayName = 'FormattedDate';
Intl.FormattedTime.displayName = 'FormattedTime';
Intl.FormattedNumber.displayName = 'FormattedNumber';
Intl.FormattedPlural.displayName = 'FormattedPlural';
Intl.FormattedMessage.displayName = 'FormattedMessage';

// Special hook for tests, real package does not export this
Intl.intl = intlReplacement;

module.exports = Intl;
