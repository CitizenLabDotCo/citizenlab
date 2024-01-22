// i18n
import messages from 'containers/Admin/dashboard/messages';

// utils
import { roundPercentages } from 'utils/math';

// typings
import { GenderSerie } from './typings';
import { genderOptions } from 'api/users_by_gender/types';
import { FormatMessage } from 'typings';

interface GraphData {
  data: {
    attributes: {
      [key: string]: number;
    };
  };
}

const convertToGraphFormat = (
  data: GraphData | undefined,
  formatMessage: FormatMessage
): GenderSerie | null => {
  if (!data) return null;
  const users = data.data.attributes;

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

export default convertToGraphFormat;
