import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { ProjectId, DatesStrings } from 'components/admin/GraphCards/typings';

import { isNilOrError } from 'utils/helperUtils';

import NoData from '../../_shared/NoData';
import messages from '../messages';

import Chart from './Chart';
import useVisitorReferrerTypes from './useVisitorReferrerTypes';

type Props = ProjectId & DatesStrings;

const VisitorsTrafficSourcesCard = ({ projectId, startAt, endAt }: Props) => {
  const { pieData } = useVisitorReferrerTypes({
    projectId,
    startAt,
    endAt,
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
