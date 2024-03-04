import messages from 'containers/Admin/dashboard/messages';
import { FormatMessage } from 'typings';

import { roundPercentages } from 'utils/math';

import { genderOptions } from 'api/users_by_gender/types';

import { GenderSerie } from './typings';

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
