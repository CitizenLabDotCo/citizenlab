import React from 'react';

interface Props {
  value: string;
  label: string;
}

const CenterLabel = ({ value, label }: Props) => (
  <>
    <text textAnchor="middle" x="50%">
      <tspan fontWeight="bold" fontSize="23px">
        {value}
      </tspan>
    </text>
    <text textAnchor="middle" x="50%">
      <tspan fontSize="14px">{label}</tspan>
    </text>
  </>
);

export default CenterLabel;
