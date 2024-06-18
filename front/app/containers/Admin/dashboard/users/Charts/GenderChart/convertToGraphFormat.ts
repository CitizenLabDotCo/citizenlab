import { FormatMessage } from 'typings';

import messages from 'containers/Admin/dashboard/messages';

import { roundPercentages } from 'utils/math';

import { GenderSerie } from './typings';

const genderOptions = ['male', 'female', 'unspecified', '_blank'];

const convertToGraphFormat = (
  users: Record<string, number> | undefined,
  formatMessage: FormatMessage
): GenderSerie | null => {
  if (!users) return null;

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
