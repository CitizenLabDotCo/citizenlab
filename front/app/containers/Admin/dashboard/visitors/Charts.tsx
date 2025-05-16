import React from 'react';

import { useBreakpoint, Box } from '@citizenlab/cl2-component-library';

import ParticipantsCard from 'components/admin/GraphCards/ParticipantsCard';
import RegistrationsCard from 'components/admin/GraphCards/RegistrationsCard';
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';
import VisitorsCard from 'components/admin/GraphCards/VisitorsCard';
import VisitorsTrafficSourcesCard from 'components/admin/GraphCards/VisitorsTrafficSourcesCard';
import VisitorsLanguageCard from 'components/admin/GraphCards/VisitorsLanguageCard';
import DeviceTypesCard from 'components/admin/GraphCards/DeviceTypesCard';

type Props = ProjectId & Dates & Resolution;

const Charts = (props: Props) => {
  const isSmallerThanSmallDesktop = useBreakpoint('smallDesktop');

  return (
    <>
      <VisitorsCard {...props} />
      <VisitorsTrafficSourcesCard {...props} />
      <Box display="flex" flexDirection="row">
        <Box width="50%">
          <RegistrationsCard
            {...props}
            layout={isSmallerThanSmallDesktop ? 'narrow' : 'wide'}
          />
        </Box>
        <Box width="50%">
          <ParticipantsCard
            {...props}
            layout={isSmallerThanSmallDesktop ? 'narrow' : 'wide'}
          />
        </Box>
      </Box>
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
