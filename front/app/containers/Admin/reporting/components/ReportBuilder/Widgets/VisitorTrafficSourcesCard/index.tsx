import React, { useRef } from 'react';

// hooks
import useVisitorReferrerTypes from '../../../../../../../components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes';

// components
import GraphCard from 'components/admin/GraphCard';
import EmptyPieChart from '../../../../../../../components/admin/GraphCards/EmptyPieChart';
import Chart from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/Chart';

// i18n
import messages from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import {
  ProjectId,
  Dates,
  ChartDisplay,
} from '../../../../../../../components/admin/GraphCards/typings';

type Props = ProjectId & Dates & ChartDisplay;

// Report specific version of <VisitorsTrafficSourcesCard/>
const VisitorsTrafficSourcesReportCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  title,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { pieData } = useVisitorReferrerTypes({
    projectId,
    startAtMoment,
    endAtMoment,
  });

  const cardTitle = title
    ? title
    : formatMessage(messages.visitorsTrafficSources);

  if (isNilOrError(pieData)) {
    return (
      <GraphCard title={cardTitle}>
        <EmptyPieChart />
      </GraphCard>
    );
  }

  return (
    <GraphCard title={cardTitle}>
      <Chart pieData={pieData} innerRef={graphRef} showReferrers={false} />
    </GraphCard>
  );
};

export default VisitorsTrafficSourcesReportCard;
