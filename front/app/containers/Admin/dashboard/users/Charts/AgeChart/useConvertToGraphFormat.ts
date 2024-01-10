// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { binBirthyear } from 'utils/dataUtils';

// typings
import { IUsersByBirthyear } from 'api/users_by_birthyear/types';

const useConvertToGraphFormat = (data: IUsersByBirthyear | undefined) => {
  const { formatMessage } = useIntl();
  if (isNilOrError(data)) return null;

  return binBirthyear(data.data.attributes.series.users, {
    missingBin: formatMessage(messages._blank),
  });
};

export default useConvertToGraphFormat;
