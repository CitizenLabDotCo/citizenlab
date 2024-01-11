import React, { useRef } from 'react';

// hooks
import useUsersByGender from 'api/users_by_gender/useUsersByGender';
import useConvertToGraphFormat from './useConvertToGraphFormat';

// components
import GraphCard from 'components/admin/GraphCard';
import { NoDataContainer } from 'components/admin/GraphWrappers';
import Chart from './Chart';

// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
  const { data: usersByGender } = useUsersByGender({
    start_at: startAt,
    end_at: endAt,
    group: currentGroupFilter,
    enabled: true,
  });

  const serie = useConvertToGraphFormat(usersByGender);
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
