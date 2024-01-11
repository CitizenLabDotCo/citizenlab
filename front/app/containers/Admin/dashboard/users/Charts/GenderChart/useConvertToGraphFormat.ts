// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { roundPercentages } from 'utils/math';

// typings
import { GenderSerie } from './typings';
import { genderOptions } from 'api/users_by_gender/types';

interface GraphData {
  data: {
    attributes: {
      series: {
        users: {
          [key: string]: number;
        };
      };
    };
  };
}

const useConvertToGraphFormat = (
  data: GraphData | undefined
): GenderSerie | null => {
  const { formatMessage } = useIntl();

  if (!data) return null;
  const users = data.data.attributes.series.users;

  const percentages = roundPercentages(
    genderOptions.map((gender) => users[gender])
  );
  const res = genderOptions.map((gender, i) => ({
    value: users[gender],
    name: formatMessage(messages[gender]),
    code: gender,
    percentage: percentages[i],
  }));
  return res.length > 0 ? res : null;
};

export default useConvertToGraphFormat;
