import React from 'react';

import { DatesStrings } from 'components/admin/GraphCards/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { CombinedTimeSeriesRow } from '../typings';

export interface Props extends DatesStrings {
  timeSeries: CombinedTimeSeriesRow[] | null;
  hideStatistics: boolean;
  // stats: Stats;
  currentResolution: IResolution;
}

const Wide = (_props: Props) => {
  return <></>;
};

export default Wide;
