import React, { useState } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import PieChart from 'components/admin/Graphs/PieChart';
import renderTooltip from './renderTooltip';
import ReferrerListLink from './RefferListLink';

// typings
import { PieRow } from '../../hooks/useVisitorReferrerTypes/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

interface Props {
  pieData: PieRow[];
  innerRef: React.RefObject<any>;
  onOpenModal: () => void;
}

const Chart = ({ pieData, innerRef, onOpenModal }: Props) => {
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
    <>
      <Box width="100%" height="initial" display="flex" alignItems="center">
        <PieChart
          width={164}
          height={164}
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
      </Box>

      <Box ml="20px" mt="40px">
        <ReferrerListLink onOpenModal={onOpenModal} />
      </Box>
    </>
  );
};

export default Chart;
