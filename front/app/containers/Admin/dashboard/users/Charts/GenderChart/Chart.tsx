import React, { useState } from 'react';

// components
import PieChart from 'components/admin/Graphs/PieChart';
import renderTooltip from './renderTooltip';

// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

// typings
import { GenderSerie } from './typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

interface Props {
  innerRef?: React.RefObject<any>;
  data: GenderSerie;
}

export const makeLegendItem = (
  row: GenderSerie[number],
  i: number
): LegendItem => ({
  icon: 'circle',
  color: categoricalColorScheme({ rowIndex: i }),
  label: `${row.name} (${row.percentage}%)`,
});

const Chart = ({ innerRef, data }: Props) => {
  const [hoverIndex, setHoverIndex] = useState<number | undefined>();

  const onMouseOver = ({ rowIndex }) => setHoverIndex(rowIndex);
  const onMouseOut = () => setHoverIndex(undefined);

  return (
    <PieChart
      data={data}
      width={164}
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
      innerRef={innerRef}
      tooltip={renderTooltip()}
      legend={{
        items: data.map(makeLegendItem),
        maintainGraphSize: true,
        marginLeft: 50,
        position: 'right-center',
      }}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    />
  );
};

export default Chart;
