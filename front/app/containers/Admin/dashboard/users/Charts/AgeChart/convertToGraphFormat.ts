// i18n
import messages from 'containers/Admin/dashboard/messages';

// utils
import { binBirthyear } from 'utils/dataUtils';

// typings
import { IUsersByBirthyear } from 'api/users_by_birthyear/types';
import { FormatMessage } from 'typings';

const convertToGraphFormat = (
  data: IUsersByBirthyear | undefined,
  formatMessage: FormatMessage
) => {
  if (!data) return null;

  return binBirthyear(data.data.attributes.series.users, {
    missingBin: formatMessage(messages._blank),
  });
};

export default convertToGraphFormat;
