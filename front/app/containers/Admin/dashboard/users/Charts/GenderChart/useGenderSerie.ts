// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { roundPercentages } from 'utils/math';

// typings
import { QueryParameters, GenderSerie } from './typings';
import { FormatMessage } from 'typings';
import useUsersByGender from 'api/users_by_gender/useUsersByGender';
import { IUsersByCustomField } from 'api/users_by_custom_field/types';

export default function useGenderSerie({
  startAt,
  endAt,
  currentGroupFilter,
  projectId,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const { data: usersByGender } = useUsersByGender({
    start_at: startAt,
    end_at: endAt,
    group: currentGroupFilter,
    project: projectId,
    enabled: true,
  });

  const serie = usersByGender
    ? convertToGraphFormat(usersByGender, formatMessage)
    : usersByGender;

  return serie;
}

const options = ['male', 'female', 'unspecified', '_blank'];

const convertToGraphFormat = (
  data: IUsersByCustomField,
  formatMessage: FormatMessage
): GenderSerie | null => {
  const { users } = data.data.attributes.series;

  const percentages = roundPercentages(options.map((gender) => users[gender]));
  const res = options.map((gender, i) => ({
    value: users[gender] || 0,
    name: formatMessage(messages[gender]),
    code: gender,
    percentage: percentages[i],
  }));
  return res.length > 0 ? res : null;
};
