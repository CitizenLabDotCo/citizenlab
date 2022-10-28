import React from 'react';

// hooks
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// components
import VisitorsCard from '../../components/VisitorsCard';
import VisitorsTrafficSourcesCard from '../../components/VisitorsTrafficSourcesCard';
import RegistrationsCard from '../../components/RegistrationsCard';
import ActiveUsersCard from '../../components/ActiveUsersCard';
import VisitorsLanguageCard from '../../components/VisitorsLanguageCard';
import VisitorsTypeCard from '../../components/VisitorsTypeCard';
import { Box } from '@citizenlab/cl2-component-library';

// typings
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  projectFilter: string | undefined;
  resolution: IResolution;
}

const Charts = (props: Props) => {
  const smallerThanTablet = useBreakpoint('tablet');

  return (
    <>
      <VisitorsCard {...props} />
      <VisitorsTrafficSourcesCard {...props} />
      <Box display="flex" flexDirection="row">
        <Box width="50%">
          <RegistrationsCard
            {...props}
            layout={smallerThanTablet ? 'narrow' : 'wide'}
          />
        </Box>
        <Box width="50%">
          <ActiveUsersCard {...props} />
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
