import React from 'react';

// hooks
import useVisitorReferrerTypes from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import EmptyPieChart from 'components/admin/GraphCards/EmptyPieChart';
import Chart from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/Chart';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import {
  ProjectId,
  Dates,
  ChartDisplay,
} from 'components/admin/GraphCards/typings';

type Props = ProjectId & Dates & ChartDisplay;

const VisitorsTrafficSourcesReportCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  title,
}: Props) => {
  const { pieData } = useVisitorReferrerTypes({
    projectId,
    startAtMoment,
    endAtMoment,
  });

  return (
    <Box width="100%" height="260px" pb="20px">
      <Title variant="h3" color="primary" m="16px">
        {title}
      </Title>
      {isNilOrError(pieData) ? (
        <EmptyPieChart />
      ) : (
        <Chart pieData={pieData} showReferrers={false} />
      )}
    </Box>
  );
};

export default VisitorsTrafficSourcesReportCard;
