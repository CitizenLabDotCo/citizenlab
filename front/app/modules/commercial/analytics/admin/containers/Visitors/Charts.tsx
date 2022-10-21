import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import VisitorsCard from '../../components/VisitorsCard';
import VisitorsLanguageCard from '../../components/VisitorsLanguageCard';
import VisitorsTrafficSourcesCard from '../../components/VisitorsTrafficSourcesCard';
import VisitorsTypeCard from '../../components/VisitorsTypeCard';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';

interface Props {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  projectFilter: string | undefined;
  resolution: IResolution;
}

const Charts = (props: Props) => (
  <>
    <VisitorsCard {...props} />
    <VisitorsTrafficSourcesCard {...props} />
    <Box display="flex" flexDirection="row">
      <VisitorsLanguageCard {...props} />
      <VisitorsTypeCard {...props} />
    </Box>
  </>
);

export default Charts;
