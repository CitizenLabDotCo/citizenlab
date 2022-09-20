import React from 'react';

// components
import VisitorsCard from '../../components/VisitorsCard';

// typings
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  projectFilter: string | undefined;
  resolution: IResolution
}

const Charts = ({ }: Props) => (
  <>
    <VisitorsCard />
  </>
)

export default Charts;
