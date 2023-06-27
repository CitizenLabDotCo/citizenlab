// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { binBirthyear } from 'utils/dataUtils';

// typings
import { QueryParameters } from './typings';
import { FormatMessage } from 'typings';
import useUsersByBirthyear from 'api/users_by_birthyear/useUsersByBirthyear';
import { IUsersByBirthyear } from 'api/users_by_birthyear/types';

export default function useAgeSerie({
  startAt,
  endAt,
  currentGroupFilter,
  projectId,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const { data: usersByBirthyear } = useUsersByBirthyear({
    start_at: startAt,
    end_at: endAt,
    group: currentGroupFilter,
    project: projectId,
    enabled: true,
  });

  const serie = usersByBirthyear
    ? convertToGraphFormat(usersByBirthyear, formatMessage)
    : null;

  return serie;
}

const convertToGraphFormat = (
  data: IUsersByBirthyear,
  formatMessage: FormatMessage
) => {
  if (isNilOrError(data)) return null;

  return binBirthyear(data.data.attributes.series.users, {
    missingBin: formatMessage(messages._blank),
  });
};
