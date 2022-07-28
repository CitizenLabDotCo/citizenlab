import React from 'react';
import { PieChart, Pie, Tooltip, Cell, Label } from 'recharts';

const CustomLabel = ({ viewBox, value = 0 }: { viewBox?; value }) => {
  const { cy } = viewBox;
  return (
    <>
      <text textAnchor="middle" x="50%" y={cy - 10}>
        <tspan fontWeight="bold" fontSize="23px">
          {Math.round(value * 100)}%
        </tspan>
      </text>
      <text textAnchor="middle" x="50%" y={cy + 12}>
        <tspan fontSize="14px">feedback given</tspan>
      </text>
    </>
  );
};

export default function ({ serie, value }) {
  return (
    <PieChart width={210} height={210}>
      <Pie
        isAnimationActive={true}
        data={serie}
        dataKey="value"
        innerRadius={88}
        outerRadius={104}
      >
        {serie.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
        <Label content={<CustomLabel value={value} />} position="center" />
      </Pie>
      <Tooltip isAnimationActive={false} />
    </PieChart>
  );
}
