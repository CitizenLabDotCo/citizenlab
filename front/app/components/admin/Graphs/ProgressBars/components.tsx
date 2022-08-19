import React from 'react';

// styling
import { colors } from '../styling';
import { fontSizes } from 'utils/styleUtils';

interface CustomizedLabelProps {
  x?: string | number;
  y?: string | number;
  value?: string | number;
}

export const CustomizedLabel = ({ x, y, value }: CustomizedLabelProps) => (
  <text
    x={x}
    y={y}
    transform="translate(0px,-12px)"
    fill={colors.blue}
    fontSize={fontSizes.s}
  >
    {value}
  </text>
);

const CORNER_RADIUS = 3;
const r = CORNER_RADIUS;

interface OneSideRoundedBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  payload: { value: number; total: number };
  side: 'left' | 'right';
}

export const OneSideRoundedBar = ({
  x,
  y,
  width,
  height,
  fill,
  payload: { value, total },
  side,
}: OneSideRoundedBarProps) => {
  if (value === 0 || total === value) {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={CORNER_RADIUS}
        ry={CORNER_RADIUS}
      />
    );
  }

  const path =
    side === 'right'
      ? rightRoundedRect(x, y, width, height)
      : leftRoundedRect(x, y, width, height);

  return <path d={path} fill={fill} stroke="none" />;
};

const rightRoundedRect = (x: number, y: number, w: number, h: number) => `
  M${x},${y}
  h${w - r}
  a${r},${r} 0 0 1 ${r},${r}
  v${h - 2 * r}
  a${r},${r} 0 0 1 ${-r},${r}
  h${r - w}
  z`;

const leftRoundedRect = (x: number, y: number, w: number, h: number) => `
  M${x + r},${y}
  h${w - r}
  v${h}
  h${r - w}
  a${r},${r} 0 0 1 ${-r},${-r}
  v${2 * r - h}
  a${r},${r} 0 0 1 ${r},${-r}
  z`;
