import React from 'react';

interface CustomizedLabelProps {
  x: number;
  y: number;
  value: string;
}

export const CustomizedLabel = ({ x, y, value }: CustomizedLabelProps) => (
  <text fill="#044D6C" x={x} y={y - 13} fontSize={14}>
    {value}
  </text>
);

const rightRoundedRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => `
  M${x},${y}
  h${w - r}
  a${r},${r} 0 0 1 ${r},${r}
  v${h - 2 * r}
  a${r},${r} 0 0 1 ${-r},${r}
  h${r - w}
  z`;

const leftRoundedRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => `
  M${x + r},${y}
  h${w - r}
  v${h}
  h${r - w}
  a${r},${r} 0 0 1 ${-r},${-r}
  v${2 * r - h}
  a${r},${r} 0 0 1 ${r},${-r}
  z`;

export const OneSideRoundedBar = (props) => {
  const {
    fill,
    x,
    y,
    width,
    height,
    payload: { value, total },
    side,
  } = props;

  const radius = 3;
  let shape;
  if (value === 0 || total === value) {
    shape = (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={radius}
        ry={radius}
      />
    );
  } else {
    const drawPath =
      side === 'right'
        ? rightRoundedRect(x, y, width, height, radius)
        : leftRoundedRect(x, y, width, height, radius);
    shape = <path d={drawPath} fill={fill} stroke="none" />;
  }

  return shape;
};