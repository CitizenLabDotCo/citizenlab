// i18n
import messages from 'containers/Admin/dashboard/messages';

// utils
import { binBirthyear } from 'utils/dataUtils';

// typings
import { FormatMessage } from 'typings';
import { UsersByBirthyearResponse } from './typings';

const convertToGraphFormat = (
  data: UsersByBirthyearResponse | undefined,
  formatMessage: FormatMessage
) => {
  if (!data) return null;

  return binBirthyear(data.data.attributes, {
    missingBin: formatMessage(messages._blank),
  });
};

export default convertToGraphFormat;
