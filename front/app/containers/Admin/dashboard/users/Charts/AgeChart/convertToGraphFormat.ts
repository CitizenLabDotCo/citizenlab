import { FormatMessage } from 'typings';

import { UsersByAgeResponse } from 'api/graph_data_units/responseTypes/_deprecated';

import messages from 'containers/Admin/dashboard/messages';

import { binAge } from 'utils/dataUtils';

const convertToGraphFormat = (
  data: UsersByAgeResponse | undefined,
  formatMessage: FormatMessage
) => {
  if (!data) return null;

  return binAge(data.data.attributes, {
    missingBin: formatMessage(messages._blank),
  });
};

export default convertToGraphFormat;
