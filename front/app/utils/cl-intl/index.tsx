import FormattedMessage from './FormattedMessage';
import injectIntl from './injectIntl';
import {
  Messages,
  // eslint-disable-next-line no-restricted-imports
  FormattedMessage as OriginalFormattedMessage,
} from 'react-intl';

type IMessageInfo = {
  message: Messages['key'];
  values?: OriginalFormattedMessage.Props['values'];
};

type MessageDescriptor = OriginalFormattedMessage.MessageDescriptor;

export { FormattedMessage, injectIntl, IMessageInfo, MessageDescriptor };
