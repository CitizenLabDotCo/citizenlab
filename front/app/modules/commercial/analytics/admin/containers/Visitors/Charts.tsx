import React from 'react';

// hooks
import { useBreakpoint, Box } from '@citizenlab/cl2-component-library';

// components
import VisitorsCard from 'components/admin/GraphCards/VisitorsCard';
import VisitorsTrafficSourcesCard from 'components/admin/GraphCards/VisitorsTrafficSourcesCard';
import RegistrationsCard from '../../components/RegistrationsCard';
import ActiveUsersCard from '../../components/ActiveUsersCard';
import VisitorsLanguageCard from '../../components/VisitorsLanguageCard';
import VisitorsTypeCard from '../../components/VisitorsTypeCard';

// typings
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

type Props = ProjectId & Dates & Resolution;

const Charts = (props: Props) => {
  const smallerThanSmallDesktop = useBreakpoint('smallDesktop');

  return (
    <>
      <VisitorsCard {...props} />
      <VisitorsTrafficSourcesCard {...props} />
      <Box display="flex" flexDirection="row">
        <Box width="50%">
          <RegistrationsCard
            {...props}
            layout={smallerThanSmallDesktop ? 'narrow' : 'wide'}
          />
        </Box>
        <Box width="50%">
          <ActiveUsersCard
            {...props}
            layout={smallerThanSmallDesktop ? 'narrow' : 'wide'}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="row">
        <Box width="50%">
          <VisitorsLanguageCard {...props} />
        </Box>
        <Box width="50%">
          <VisitorsTypeCard {...props} />
        </Box>
      </Box>
    </>
  );
};

export default Charts;
