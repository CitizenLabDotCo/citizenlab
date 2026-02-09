import React from 'react';

import { isEmpty } from 'lodash-es';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  ResponsiveContainer,
} from 'recharts';

import { NoDataContainer } from 'components/admin/GraphWrappers';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import { ProgressBarsProps } from './typings';
import { parseData } from './utils';

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

export default function ({
  data,
  width,
  height,
  emptyContainerContent,
  innerRef,
}: ProgressBarsProps) {
  const noData = isNilOrError(data) || data.every(isEmpty) || data.length <= 0;

  if (noData) {
    return (
      <NoDataContainer>
        {emptyContainerContent ? (
          <>{emptyContainerContent}</>
        ) : (
          <FormattedMessage {...messages.noData} />
        )}
      </NoDataContainer>
    );
  }

  const parsedData = parseData(data);

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        data={parsedData}
        layout="vertical"
        stackOffset="expand"
        barSize={8}
        margin={{ bottom: 0 }}
        ref={innerRef}
        accessibilityLayer
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
          <LabelList dataKey="label" content={renderCustomizedLabel} />
        </Bar>
        <Bar
          dataKey="remainder"
          stackId="a"
          fill="#E0E0E0"
          isAnimationActive={false}
          shape={<OneSideRoundedBar side="right" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
