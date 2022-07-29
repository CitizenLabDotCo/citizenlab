import React from 'react';
import { PieChart, Pie, Cell, Label } from 'recharts';

const CustomLabel = ({ viewBox, value, label }: { viewBox?; value; label }) => {
  const { cy } = viewBox;
  return (
    <>
      <text textAnchor="middle" x="50%" y={cy - 10}>
        <tspan fontWeight="bold" fontSize="23px">
          {value}
        </tspan>
      </text>
      <text textAnchor="middle" x="50%" y={cy + 12}>
        <tspan fontSize="14px">{label}</tspan>
      </text>
    </>
  );
};

export default function ({ serie, center: { label, value } }) {
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
        <Label
          content={<CustomLabel value={value} label={label} />}
          position="center"
        />
      </Pie>
    </PieChart>
  );
}
