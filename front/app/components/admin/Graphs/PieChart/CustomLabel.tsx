import React from 'react';

export default ({ viewBox, value, label }: { viewBox?; value; label }) => {
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
