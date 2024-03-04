import messages from 'containers/Admin/dashboard/messages';
import { FormatMessage } from 'typings';

import { binBirthyear } from 'utils/dataUtils';

import { UsersByBirthyearResponse } from 'api/graph_data_units/responseTypes';

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
