import React from 'react';

// hooks
import useVisitorReferrerTypes from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes';
import useNarrow from 'containers/Admin/reporting/hooks/useNarrow';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import Chart from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/Chart';
import NoChartData from '../NoChartData';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import {
  ProjectId,
  Dates,
  ChartDisplay,
} from 'components/admin/GraphCards/typings';

type Props = ProjectId & Dates & ChartDisplay;

const VisitorsTrafficSourcesCard = ({
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
  const narrow = useNarrow();

  if (isNilOrError(pieData)) return <NoChartData title={title} />;

  return (
    <Box width="100%" height="260px" pb="20px">
      <Title variant="h3" color="primary" m="16px">
        {title}
      </Title>
      <Box height="200px">
        <Chart pieData={pieData} narrow={narrow} />
      </Box>
    </Box>
  );
};

export default VisitorsTrafficSourcesCard;
