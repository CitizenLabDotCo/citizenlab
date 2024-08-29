import { MessageDescriptor } from 'utils/cl-intl';
import { FormatMessageValues } from 'utils/cl-intl/useIntl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

type GetInstructionMessageProps = {
  minItems: number | undefined;
  maxItems: number | undefined;
  options: any[] | null;
  formatMessage: (
    messageDescriptor: MessageDescriptor,
    values?: FormatMessageValues
  ) => string;
};

export const getInstructionMessage = ({
  minItems,
  maxItems,
  formatMessage,
  options,
}: GetInstructionMessageProps) => {
  if (!isNilOrError(minItems) && !isNilOrError(maxItems)) {
    if (minItems < 1 && maxItems === options?.length) {
      return formatMessage(messages.selectAsManyAsYouLike);
    }
    if (maxItems === minItems) {
      return formatMessage(messages.selectExactly, {
        selectExactly: maxItems,
      });
    }
    if (minItems !== maxItems) {
      return formatMessage(messages.selectBetween, {
        minItems,
        maxItems,
      });
    }
  }
  return null;
};
