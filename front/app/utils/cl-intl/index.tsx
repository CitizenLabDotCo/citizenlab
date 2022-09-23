import FormattedMessage from './FormattedMessage';
import { MessageDescriptor } from 'react-intl';

type IMessageInfo = {
  message: MessageDescriptor;
  values?: OriginalFormattedMessage.Props['values'];
};

export { FormattedMessage, IMessageInfo };
