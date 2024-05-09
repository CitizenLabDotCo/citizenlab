import React from 'react';

import ActiveUsersChart from 'components/admin/GraphCards/ActiveUsersCard/Chart';
import { TimeSeries } from 'components/admin/GraphCards/ActiveUsersCard/useActiveUsers/typings';
import { Dates, Resolution, Layout } from 'components/admin/GraphCards/typings';

type Props = Dates &
  Resolution & {
    timeSeries: TimeSeries | null;
    layout?: Layout;
  };

const MARGINS = {
  wide: {
    top: 10,
  },
  narrow: {
    right: -20,
  },
} as const;

const Chart = ({ layout = 'wide', ...props }: Props) => {
  return (
    <ActiveUsersChart {...props} layout={layout} margin={MARGINS[layout]} />
  );
};

export default Chart;
