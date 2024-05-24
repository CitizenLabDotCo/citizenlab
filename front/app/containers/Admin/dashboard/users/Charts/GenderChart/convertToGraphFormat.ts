import { FormatMessage } from 'typings';

import { GenderOption } from 'api/graph_data_units/responseTypes/_deprecated';

import messages from 'containers/Admin/dashboard/messages';

import { roundPercentages } from 'utils/math';

import { GenderSerie } from './typings';

interface GraphData {
  data: {
    attributes: {
      [key: string]: number;
    };
  };
}

const genderOptions: GenderOption[] = [
  'male',
  'female',
  'unspecified',
  '_blank',
];

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
