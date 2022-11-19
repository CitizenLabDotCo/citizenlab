import React from 'react';

interface Props {
  y: number;
  value: string;
  label: string;
}

const VALUE_FONT_SIZE = 23;

const CenterLabel = ({ y, value, label }: Props) => (
  <g>
    <text textAnchor="middle" x="50%" y={y}>
      <tspan fontWeight="bold" fontSize={`${VALUE_FONT_SIZE}px`}>
        {value}
      </tspan>
    </text>
    <text textAnchor="middle" x="50%" y={y + VALUE_FONT_SIZE}>
      <tspan fontSize="14px">{label}</tspan>
    </text>
  </g>
);

export default CenterLabel;
