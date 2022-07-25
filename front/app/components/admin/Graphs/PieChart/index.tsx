import React from 'react';
import { PieChartStyleFixesDiv } from 'components/admin/GraphWrappers';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';

export default function ({ serie, labelColors }) {
  return (
    <PieChartStyleFixesDiv>
      <ResponsiveContainer height={175} width="100%" minWidth={175}>
        <PieChart>
          <Pie
            isAnimationActive={true}
            data={serie}
            dataKey="value"
            outerRadius={60}
          >
            {serie.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={labelColors[entry.code]} />
            ))}
          </Pie>
          <Tooltip isAnimationActive={false} />
        </PieChart>
      </ResponsiveContainer>
    </PieChartStyleFixesDiv>
  );
}
