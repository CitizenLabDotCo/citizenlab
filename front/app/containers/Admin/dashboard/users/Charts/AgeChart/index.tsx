import React, { useRef } from 'react';

// services
import { usersByBirthyearXlsxEndpoint } from 'services/userCustomFieldStats';

// hooks
import useAgeSerie from './useAgeSerie';

// components
import GraphCard from 'components/admin/GraphCard';
import Chart from './Chart';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { QueryParameters } from './typings';
import { isNilOrError } from 'utils/helperUtils';

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
  const ageSerie = useAgeSerie({
    startAt,
    endAt,
    currentGroupFilter,
  });
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
