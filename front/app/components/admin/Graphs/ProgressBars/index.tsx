import React from 'react';
import { BarChart, Bar, XAxis, YAxis, LabelList } from 'recharts';

const renderCustomizedLabel = (props) => {
  const { x, y, value } = props;
  return (
    <text fill="#044D6C" x={x} y={y - 13} fontSize={14}>
      {value}
    </text>
  );
};

const rightRoundedRect = (x, y, w, h, r) => `
  M${x},${y}
  h${w - r}
  a${r},${r} 0 0 1 ${r},${r}
  v${h - 2 * r}
  a${r},${r} 0 0 1 ${-r},${r}
  h${r - w}
  z`;

const leftRoundedRect = (x, y, w, h, r) => `
  M${x + r},${y}
  h${w - r}
  v${h}
  h${r - w}
  a${r},${r} 0 0 1 ${-r},${-r}
  v${2 * r - h}
  a${r},${r} 0 0 1 ${r},${-r}
  z`;

const OneSideRoundedBar = (props) => {
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
  if (value === 0 || total === 0) {
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

export default function ({ data }) {
  return (
    <BarChart
      height={data.length * 68}
      width={257}
      data={data}
      layout="vertical"
      stackOffset="expand"
      barSize={8}
      margin={{ bottom: 0 }}
    >
      <XAxis hide type="number" />
      <YAxis width={0} type="category" dataKey="name" />
      <Bar
        dataKey="value"
        stackId="a"
        fill="#044D6C"
        isAnimationActive={false}
        shape={<OneSideRoundedBar />}
      >
        <LabelList
          dataKey="label"
          data={data}
          content={renderCustomizedLabel}
        />
      </Bar>
      <Bar
        dataKey="total"
        stackId="a"
        fill="#E0E0E0"
        isAnimationActive={false}
        shape={<OneSideRoundedBar side="right" />}
      />
    </BarChart>
  );
}
