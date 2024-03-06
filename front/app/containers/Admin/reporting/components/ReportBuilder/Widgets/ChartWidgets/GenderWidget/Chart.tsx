import React, { useState } from 'react';

import { makeLegendItem } from 'containers/Admin/dashboard/users/Charts/GenderChart/Chart';
import renderTooltip from 'containers/Admin/dashboard/users/Charts/GenderChart/renderTooltip';
import { GenderSerie } from 'containers/Admin/dashboard/users/Charts/GenderChart/typings';

import { Layout } from 'components/admin/GraphCards/typings';
import PieChart from 'components/admin/Graphs/PieChart';

interface Props {
  layout?: Layout;
  data: GenderSerie;
}

const Chart = ({ layout = 'wide', data }: Props) => {
  const [hoverIndex, setHoverIndex] = useState<number | undefined>();

  const onMouseOver = ({ rowIndex }) => setHoverIndex(rowIndex);
  const onMouseOut = () => setHoverIndex(undefined);

  return (
    <PieChart
      data={data}
      width={layout === 'narrow' ? '100%' : 164}
      height={195}
      mapping={{
        angle: 'value',
        name: 'name',
        opacity: ({ rowIndex }) => {
          if (hoverIndex === undefined) return 1;
          return hoverIndex === rowIndex ? 1 : 0.3;
        },
      }}
      pie={{
        startAngle: 0,
        endAngle: 360,
        outerRadius: 60,
      }}
      tooltip={renderTooltip()}
      legend={{
        items: data.map(makeLegendItem),
        marginTop: layout === 'narrow' ? 0 : undefined,
        marginLeft: layout === 'narrow' ? 10 : 50,
        maintainGraphSize: layout !== 'narrow',
        position: layout === 'narrow' ? 'bottom-center' : 'right-center',
      }}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    />
  );
};

export default Chart;
