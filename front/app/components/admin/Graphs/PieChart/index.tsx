import React from 'react';
import { PieChartStyleFixesDiv } from 'components/admin/GraphWrappers';
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Label,
} from 'recharts';

const CustomLabel = ({
  viewBox,
  noOfBubbleTeaSold = 0,
}: {
  viewBox?;
  noOfBubbleTeaSold;
}) => {
  const { cx, cy } = viewBox;
  return (
    <>
      <text x={cx - 15} y={cy - 5}>
        <tspan>{Math.round(noOfBubbleTeaSold * 100)}%</tspan>
      </text>
      <text x={cx - 50} y={cy + 15}>
        <tspan>Feedback given</tspan>
      </text>
    </>
  );
};

export default function ({ serie, value }) {
  return (
    <PieChartStyleFixesDiv>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            isAnimationActive={true}
            data={serie}
            dataKey="value"
            innerRadius={50}
          >
            {serie.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <Label
              content={<CustomLabel noOfBubbleTeaSold={value} />}
              position="center"
            />
          </Pie>
          <Tooltip isAnimationActive={false} />
        </PieChart>
      </ResponsiveContainer>
    </PieChartStyleFixesDiv>
  );
}
