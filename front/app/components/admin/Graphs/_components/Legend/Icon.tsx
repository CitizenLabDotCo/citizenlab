import React from 'react';

import { LegendItem } from './typings';

// Adapted from https://github.com/recharts/recharts/blob/master/src/component/DefaultLegendContent.tsx
const ICON_SIZE = 14;
const halfSize = ICON_SIZE / 2;
const sixthSize = ICON_SIZE / 6;
const thirdSize = ICON_SIZE / 3;

interface PlainLineProps {
  stroke: string;
  strokeDasharray?: string | number;
}

const PlainLine = ({ stroke, strokeDasharray }: PlainLineProps) => (
  <line
    x1={0}
    y1={halfSize}
    x2={ICON_SIZE}
    y2={halfSize}
    fill="none"
    stroke={stroke}
    strokeWidth={2}
    strokeDasharray={strokeDasharray}
    className="recharts-legend-icon"
  />
);

interface LineProps {
  stroke: string;
}

const Line = ({ stroke }: LineProps) => (
  <path
    d={`M0,${halfSize}h${thirdSize}
            A${sixthSize},${sixthSize},0,1,1,${2 * thirdSize},${halfSize}
            H${ICON_SIZE}M${2 * thirdSize},${halfSize}
            A${sixthSize},${sixthSize},0,1,1,${thirdSize},${halfSize}`}
    fill="none"
    stroke={stroke}
    strokeWidth={2}
    className="recharts-legend-icon"
  />
);

interface PolygonProps {
  fill: string;
}

const Rectangle = ({ fill }: PolygonProps) => (
  <path
    d={`M0,${ICON_SIZE / 8}h${ICON_SIZE}v${(ICON_SIZE * 3) / 4}h${-ICON_SIZE}z`}
    fill={fill}
    stroke="none"
    className="recharts-legend-icon"
  />
);

const Circle = ({ fill }: PolygonProps) => (
  <circle
    cx={halfSize}
    cy={halfSize}
    r={4}
    fill={fill}
    stroke="none"
    className="recharts-legend-icon"
  />
);

const Icon = ({ icon, color }: LegendItem) => {
  if (icon === 'plain-line') {
    return <PlainLine stroke={color} />;
  }

  if (icon === 'line') {
    return <Line stroke={color} />;
  }

  if (icon === 'rect') {
    return <Rectangle fill={color} />;
  }

  return <Circle fill={color} />;
};

export default Icon;
