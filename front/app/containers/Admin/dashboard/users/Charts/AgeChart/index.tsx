import React, { useRef } from 'react';

import { useUsersByAgeLive } from 'api/graph_data_units';

import GraphCard from 'components/admin/GraphCard';
import Chart from './Chart';
import { Box } from '@citizenlab/cl2-component-library';

import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

import { QueryParameters } from './typings';
import { isNilOrError } from 'utils/helperUtils';
import { usersByBirthyearXlsxEndpoint } from 'api/users_by_birthyear/util';
import moment from 'moment';

import convertToGraphFormat from './convertToGraphFormat';

interface Props extends QueryParameters {
  currentGroupFilterLabel?: string | undefined;
}

const AgeChart = ({
  startAt,
  endAt,
  currentGroupFilter,
  currentGroupFilterLabel,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();

  const { data: usersByBirthyear } = useUsersByAgeLive({
    startAtMoment: startAt ? moment(startAt) : null,
    endAtMoment: endAt ? moment(endAt) : null,
    groupId: currentGroupFilter,
  });
  const ageSerie = convertToGraphFormat(usersByBirthyear, formatMessage);

  const cardTitle = formatMessage(messages.usersByAgeTitle);

  if (isNilOrError(ageSerie)) return null;

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: { endpoint: usersByBirthyearXlsxEndpoint },
        currentGroupFilterLabel,
        currentGroupFilter,
        startAt,
        endAt,
      }}
    >
      <Box height="195px">
        <Chart data={ageSerie} innerRef={graphRef} />
      </Box>
    </GraphCard>
  );
};

export default AgeChart;
