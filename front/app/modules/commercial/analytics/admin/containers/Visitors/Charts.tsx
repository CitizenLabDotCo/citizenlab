import React from 'react';

// components
import VisitorsCard from '../../components/VisitorsCard';
import VisitorsLanguageCard from '../../components/VisitorsLanguageCard';
import VisitorsTrafficSourcesCard from '../../components/VisitorsTrafficSourcesCard';
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
