import React from 'react';

// hooks
import useVisitorReferrerTypes from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes';
import useNarrow from 'containers/Admin/reporting/hooks/useNarrow';

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
  const narrow = useNarrow();

  if (isNilOrError(pieData)) {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box width="100%" height="220px" mt="20px" pb="10px">
      <Box height="200px">
        <Chart
          pieData={pieData}
          pieConfig={{
            startAngle: 0,
            endAngle: 360,
            outerRadius: 60,
          }}
          narrow={narrow}
        />
      </Box>
    </Box>
  );
};

export default VisitorsTrafficSourcesCard;
