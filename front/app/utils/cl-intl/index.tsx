import FormattedMessage from './FormattedMessage';
import injectIntl from './injectIntl';
import { MessageDescriptor } from 'react-intl';

type IMessageInfo = {
  message: MessageDescriptor;
  values?: OriginalFormattedMessage.Props['values'];
};

export { FormattedMessage, injectIntl, IMessageInfo };
