import React, { useRef } from 'react';

// hooks
import { useUsersByGenderLive } from 'api/graph_data_units';

// components
import GraphCard from 'components/admin/GraphCard';
import { NoDataContainer } from 'components/admin/GraphWrappers';
import Chart from './Chart';

// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import convertToGraphFormat from './convertToGraphFormat';
import moment from 'moment';

// typings
import { QueryParameters } from './typings';
import { usersByGenderXlsxEndpoint } from 'api/users_by_gender/util';

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
    startAtMoment: startAt ? moment(startAt) : null,
    endAtMoment: endAt ? moment(endAt) : null,
    groupId: currentGroupFilter,
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
