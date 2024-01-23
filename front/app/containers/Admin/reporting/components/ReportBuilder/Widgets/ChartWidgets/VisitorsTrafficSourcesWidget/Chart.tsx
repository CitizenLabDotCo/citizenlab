import React, { useState } from 'react';

// components
import PieChart from 'components/admin/Graphs/PieChart';
import renderTooltip from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/renderTooltip';

// typings
import { PieRow } from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import { Layout } from 'components/admin/GraphCards/typings';

interface Props {
  pieData: PieRow[];
  layout?: Layout;
}

const Chart = ({ pieData, layout = 'wide' }: Props) => {
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
      width={layout === 'narrow' ? '100%' : 164}
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
      pie={{
        startAngle: 0,
        endAngle: 360,
        outerRadius: 60,
      }}
      tooltip={renderTooltip()}
      legend={{
        items: legend,
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
