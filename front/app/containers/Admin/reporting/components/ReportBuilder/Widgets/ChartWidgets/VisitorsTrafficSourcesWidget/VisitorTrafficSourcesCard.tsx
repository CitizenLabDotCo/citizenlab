import React from 'react';

import useVisitorReferrerTypes from './useVisitorReferrerTypes';
import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { Box } from '@citizenlab/cl2-component-library';
import Chart from './Chart';
import NoData from '../../_shared/NoData';

import messages from '../messages';

import { isNilOrError } from 'utils/helperUtils';

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
      <Chart pieData={pieData} layout={layout} />
    </Box>
  );
};

export default VisitorsTrafficSourcesCard;
