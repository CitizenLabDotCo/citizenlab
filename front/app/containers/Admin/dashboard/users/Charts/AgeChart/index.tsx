import React, { useRef } from 'react';

// services
import { usersByBirthyearXlsxEndpoint } from 'services/userCustomFieldStats';

// components
import GraphCard from 'components/admin/GraphCard';
import Chart from './Chart';

// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
}

const AgeChart = ({
  startAt,
  endAt,
  currentGroupFilter,
  currentGroupFilterLabel,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const ageSerie = useAgeSerie();
  const cardTitle = formatMessage(messages.usersByAgeTitle);

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
      <Chart data={ageSerie} innerRef={graphRef} />
    </GraphCard>
  );
};

export default AgeChart;
