import React from 'react';

// components
import { PieChart, Pie, Cell, Label, ResponsiveContainer } from 'recharts';
import {
  NoDataContainer,
  PieChartStyleFixesDiv,
} from 'components/admin/GraphWrappers';
import CustomLabel from './CustomLabel';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// typings
import { PieProps } from './typings';

export default function ({
  data,
  centerLabel,
  centerValue,
  emptyContainerContent,
  width,
  height,
}: PieProps) {
  const noData = isNilOrError(data) || data.every(isEmpty) || data.length <= 0;

  if (noData) {
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
        <PieChart>
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
        </PieChart>
      </ResponsiveContainer>
    </PieChartStyleFixesDiv>
  );
}
