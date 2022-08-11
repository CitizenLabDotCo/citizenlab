import React from 'react';

// components
import { 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Label,
  ResponsiveContainer
} from 'recharts';
import {
  NoDataContainer,
  PieChartStyleFixesDiv,
} from 'components/admin/GraphWrappers';
import CustomLabel from './CustomLabel';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { hasNoData } from '../utils';

// typings
import { Props } from './typings';

const PieChart = <T,>({
  data,
  mapping,
  centerLabel,
  centerValue,
  emptyContainerContent,
  width,
  height,
}: Props<T>) => {
  if (hasNoData(data)) {
    return (
      <NoDataContainer>
        {emptyContainerContent ? (
          <>{emptyContainerContent}</>
        ) : (
          <FormattedMessage {...messages.noData} />
        )}
      </NoDataContainer>
    );
  }

  return (
    <PieChartStyleFixesDiv>
      <ResponsiveContainer width={width} height={height}>
        <RechartsPieChart>
          <Pie
            isAnimationActive={true}
            data={data}
            dataKey="value"
            innerRadius={88}
            outerRadius={104}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <Label
              content={<CustomLabel value={centerValue} label={centerLabel} />}
              position="center"
            />
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </PieChartStyleFixesDiv>
  );
}

export default PieChart;
