import React from 'react';

// typings
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  startAtMoment: Moment | null;
  endAtMoment: Moment | null;
  projectFilter: string | undefined;
  resolution: IResolution
}

const Charts = ({ }: Props) => (
  <>
    Bla
  </>
)

export default Charts;
