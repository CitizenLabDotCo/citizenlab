import React, { useRef } from 'react';

import moment from 'moment';

import { useUsersByGenderLive } from 'api/graph_data_units';
import { formatMoment } from 'api/graph_data_units/utils';
import { usersByGenderXlsxEndpoint } from 'api/users_by_gender/util';

import messages from 'containers/Admin/dashboard/messages';

import GraphCard from 'components/admin/GraphCard';
import { NoDataContainer } from 'components/admin/GraphWrappers';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import Chart from './Chart';
import convertToGraphFormat from './convertToGraphFormat';
import { QueryParameters } from './typings';

interface Props extends QueryParameters {
  currentGroupFilterLabel?: string;
}

const GenderChart = ({
  startAt,
  endAt,
  currentGroupFilter,
  currentGroupFilterLabel,
}: Props) => {
  const { formatMessage } = useIntl();

  const { data: usersByGender } = useUsersByGenderLive({
    start_at: startAt ? formatMoment(moment(startAt)) : null,
    end_at: endAt ? formatMoment(moment(endAt)) : null,
    group_id: currentGroupFilter,
  });
  const serie = convertToGraphFormat(usersByGender, formatMessage);
  const graphRef = useRef();
  const cardTitle = formatMessage(messages.usersByGenderTitle);

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: { endpoint: usersByGenderXlsxEndpoint },
        currentGroupFilterLabel,
        currentGroupFilter,
        startAt,
        endAt,
      }}
    >
      {isNilOrError(serie) ? (
        <NoDataContainer>{formatMessage(messages.noData)}</NoDataContainer>
      ) : (
        <Chart data={serie} innerRef={graphRef} />
      )}
    </GraphCard>
  );
};

export default GenderChart;
