import FormattedMessage from './FormattedMessage';
import injectIntl from './injectIntl';
import useIntl from './useIntl';
import { MessageDescriptor } from 'react-intl';

type Props = React.ComponentProps<typeof FormattedMessage>;

type IMessageInfo = {
  message: MessageDescriptor;
  values?: Props['values'];
};

export {
  FormattedMessage,
  injectIntl,
  IMessageInfo,
  MessageDescriptor,
  useIntl,
};
