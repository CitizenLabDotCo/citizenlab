import React, { useState } from 'react';

// components
import PieChart from 'components/admin/Graphs/PieChart';
import renderTooltip from './renderTooltip';

// typings
import { PieRow } from './useVisitorReferrerTypes/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

interface Props {
  pieData: PieRow[];
  innerRef?: React.RefObject<any>;
}

const Chart = ({ pieData, innerRef }: Props) => {
  const [hoverIndex, setHoverIndex] = useState<number | undefined>();

  const onMouseOver = ({ rowIndex }) => {
    setHoverIndex(rowIndex);
  };

  const onMouseOut = () => {
    setHoverIndex(undefined);
  };

  const legend = pieData.map(
    (row): LegendItem => ({
      icon: 'circle',
      color: row.color,
      label: `${row.name} (${row.percentage}%)`,
    })
  );

  return (
    <PieChart
      width={164}
      height={195}
      data={pieData}
      mapping={{
        angle: 'value',
        name: 'name',
        opacity: ({ rowIndex }) => {
          if (hoverIndex === undefined) return 1;
          return hoverIndex === rowIndex ? 1 : 0.3;
        },
      }}
      tooltip={renderTooltip()}
      legend={{
        items: legend,
        marginLeft: 50,
        maintainGraphSize: true,
        position: 'right-center',
      }}
      innerRef={innerRef}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    />
  );
};

export default Chart;
