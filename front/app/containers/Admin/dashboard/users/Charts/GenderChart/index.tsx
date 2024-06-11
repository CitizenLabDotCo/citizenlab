import React, { useRef } from 'react';

import moment from 'moment';

import { useUsersByGenderLive } from 'api/graph_data_units';
import { usersByCustomFieldXlsxEndpoint } from 'api/users_by_custom_field/util';

import messages from 'containers/Admin/dashboard/messages';

import GraphCard from 'components/admin/GraphCard';
import { NoDataContainer } from 'components/admin/GraphWrappers';

import { useIntl } from 'utils/cl-intl';
import { momentToIsoDate } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

import Chart from './Chart';
import convertToGraphFormat from './convertToGraphFormat';
import { QueryParameters } from './typings';

interface Props extends QueryParameters {
  currentGroupFilterLabel?: string;
  customFieldId: string;
}

const GenderChart = ({
  startAt,
  endAt,
  currentGroupFilter,
  currentGroupFilterLabel,
  customFieldId,
}: Props) => {
  const { formatMessage } = useIntl();

  const { data: usersByGender } = useUsersByGenderLive({
    start_at: startAt ? momentToIsoDate(moment(startAt)) : null,
    end_at: endAt ? momentToIsoDate(moment(endAt)) : null,
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
        xlsx: { endpoint: usersByCustomFieldXlsxEndpoint(customFieldId) },
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
