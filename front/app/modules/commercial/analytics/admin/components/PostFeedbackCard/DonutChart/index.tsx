import React from 'react';

// components
import PieChart from 'components/admin/Graphs/PieChart';
import CenterLabel from './CenterLabel';

// typings
import { PostFeedback } from '../../../hooks/usePostsFeedback/typings';

interface Props {
  data: PostFeedback;
  innerRef: React.RefObject<any>;
}

const DonutChart = ({ data, innerRef }: Props) => {
  const { pieData, pieCenterValue, pieCenterLabel } = data;

  return (
    <PieChart
      data={pieData}
      height={200}
      mapping={{
        angle: 'value',
        name: 'name',
        fill: ({ row: { color } }) => color,
      }}
      pie={{
        innerRadius: '85%',
      }}
      centerLabel={({ viewBox: { cy } }) => (
        <CenterLabel y={cy - 5} value={pieCenterValue} label={pieCenterLabel} />
      )}
      innerRef={innerRef}
    />
  );
};

export default DonutChart;
