import React, { useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import { useDemographicsLive } from 'api/graph_data_units';
import { usersByAgeXlsxEndpoint } from 'api/users_by_age/util';

import messages from 'containers/Admin/dashboard/messages';

import GraphCard from 'components/admin/GraphCard';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import Chart from './Chart';
import convertToGraphFormat from './convertToGraphFormat';
import { QueryParameters } from './typings';

interface Props extends QueryParameters {
  currentGroupFilterLabel?: string | undefined;
  customFieldId: string;
}

const AgeChart = ({
  startAt,
  endAt,
  currentGroupFilter,
  currentGroupFilterLabel,
  customFieldId,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();

  const { data: usersByAge } = useDemographicsLive({
    custom_field_id: customFieldId,
    start_at: startAt ? moment(startAt).local().format('YYYY-MM-DD') : null,
    end_at: endAt ? moment(endAt).local().format('YYYY-MM-DD') : null,
    group_id: currentGroupFilter,
  });
  const ageSerie = convertToGraphFormat(
    usersByAge?.data.attributes.series,
    formatMessage
  );

  const cardTitle = formatMessage(messages.usersByAgeTitle);

  if (isNilOrError(ageSerie)) return null;

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: { endpoint: usersByAgeXlsxEndpoint },
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
