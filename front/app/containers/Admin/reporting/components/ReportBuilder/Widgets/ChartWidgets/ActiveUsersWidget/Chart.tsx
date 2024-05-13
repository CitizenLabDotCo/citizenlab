import React from 'react';

import ActiveUsersChart from 'components/admin/GraphCards/ActiveUsersCard/Chart';
import { TimeSeries } from 'components/admin/GraphCards/ActiveUsersCard/useActiveUsers/typings';
import { Dates, Resolution, Layout } from 'components/admin/GraphCards/typings';
import { YAxisProps } from 'components/admin/Graphs/typings';

type Props = Dates &
  Resolution & {
    timeSeries: TimeSeries | null;
    layout?: Layout;
    yaxis?: YAxisProps;
  };

const Chart = ({ layout = 'wide', ...props }: Props) => {
  return (
    <ActiveUsersChart
      {...props}
      layout={layout}
      margin={
        layout === 'narrow'
          ? {
              left: 5,
              right: -20,
              top: 0,
              bottom: 0,
            }
          : undefined
      }
    />
  );
};

export default Chart;
