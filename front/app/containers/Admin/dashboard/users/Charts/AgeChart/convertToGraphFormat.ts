import { FormatMessage } from 'typings';

import { UsersByBirthyearResponse } from 'api/graph_data_units/responseTypes';

import messages from 'containers/Admin/dashboard/messages';

import { binBirthyear } from 'utils/dataUtils';

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
