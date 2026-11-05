import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

interface Props {
  values: number[];
}
const Svg = styled.svg`
  display: block;
  width: 100%;
  height: 34px;
`;

const WIDTH = 100;
const HEIGHT = 30;
const CLEARANCE = 1;
const BASELINE = HEIGHT - CLEARANCE;
const PEAK = CLEARANCE;

const getLinePoints = (values: number[]): string | null => {
  if (values.length < 2) return null;

  const max = Math.max(...values);

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * WIDTH;
      const y = BASELINE - (max === 0 ? 0 : value / max) * (BASELINE - PEAK);

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
};

const getAreaPoints = (linePoints: string): string =>
  `0,${HEIGHT} ${linePoints} ${WIDTH},${HEIGHT}`;

const Sparkline = ({ values }: Props) => {
  const linePoints = getLinePoints(values);

  if (!linePoints) return null;

  return (
    <Svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <polygon points={getAreaPoints(linePoints)} fill={colors.blue10} />
      <polyline
        points={linePoints}
        fill="none"
        stroke={colors.primary}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Sparkline;
