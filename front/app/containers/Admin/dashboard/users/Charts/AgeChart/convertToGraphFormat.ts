import { FormatMessage } from 'typings';

import messages from 'containers/Admin/dashboard/messages';

import { binAge } from 'utils/dataUtils';

const convertToGraphFormat = (
  data: Record<string, number> | undefined,
  formatMessage: FormatMessage
) => {
  if (!data) return null;

  return binAge(data, {
    missingBin: formatMessage(messages._blank),
  });
};

export default convertToGraphFormat;
