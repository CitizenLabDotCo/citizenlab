import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import DeviceTypesCard from 'components/admin/GraphCards/DeviceTypesCard';
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';
import VisitorsCard from 'components/admin/GraphCards/VisitorsCard';
import VisitorsLanguageCard from 'components/admin/GraphCards/VisitorsLanguageCard';
import VisitorsTrafficSourcesCard from 'components/admin/GraphCards/VisitorsTrafficSourcesCard';

type Props = ProjectId & Dates & Resolution;

const Charts = (props: Props) => {
  return (
    <>
      <VisitorsCard {...props} />
      <VisitorsTrafficSourcesCard {...props} />
      <Box display="flex" flexDirection="row">
        <Box width="50%">
          <VisitorsLanguageCard {...props} />
        </Box>
        <Box width="50%">
          <DeviceTypesCard {...props} />
        </Box>
      </Box>
    </>
  );
};

export default Charts;
