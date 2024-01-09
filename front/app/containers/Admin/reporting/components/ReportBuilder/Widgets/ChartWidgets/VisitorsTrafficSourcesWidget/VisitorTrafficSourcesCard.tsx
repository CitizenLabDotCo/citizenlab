import React from 'react';

// hooks
import useVisitorReferrerTypes from './useVisitorReferrerTypes';
import useLayout from 'containers/Admin/reporting/hooks/useLayout';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Chart from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/Chart';
import NoData from '../../_shared/NoData';

// i18n
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { ProjectId, Dates } from 'components/admin/GraphCards/typings';

type Props = ProjectId & Dates;

const VisitorsTrafficSourcesCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: Props) => {
  const { pieData } = useVisitorReferrerTypes({
    projectId,
    startAtMoment,
    endAtMoment,
  });
  const layout = useLayout();

  if (isNilOrError(pieData)) {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box width="100%" height="220px" mt="20px" pb="10px">
      <Chart
        pieData={pieData}
        pieConfig={{
          startAngle: 0,
          endAngle: 360,
          outerRadius: 60,
        }}
        layout={layout}
      />
    </Box>
  );
};

export default VisitorsTrafficSourcesCard;
