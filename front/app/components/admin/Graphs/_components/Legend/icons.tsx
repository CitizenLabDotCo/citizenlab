import React from 'react';

// Adapted from https://github.com/recharts/recharts/blob/master/src/component/DefaultLegendContent.tsx
export const ICON_SIZE = 14;
const halfSize = ICON_SIZE / 2;
const sixthSize = ICON_SIZE / 6;
const thirdSize = ICON_SIZE / 3;

interface PlainLineProps {
  stroke: string;
  strokeDasharray?: string | number;
}

export const PlainLine = ({ stroke, strokeDasharray }: PlainLineProps) => (
  <line
    strokeWidth={4}
    fill="none"
    stroke={stroke}
    strokeDasharray={strokeDasharray}
    x1={0}
    y1={halfSize}
    x2={ICON_SIZE}
    y2={halfSize}
    className="recharts-legend-icon"
  />
);

interface LineProps {
  stroke: string;
}

export const Line = ({ stroke }: LineProps) => (
  <path
    strokeWidth={4}
    fill="none"
    stroke={stroke}
    d={`M0,${halfSize}h${thirdSize}
            A${sixthSize},${sixthSize},0,1,1,${2 * thirdSize},${halfSize}
            H${ICON_SIZE}M${2 * thirdSize},${halfSize}
            A${sixthSize},${sixthSize},0,1,1,${thirdSize},${halfSize}`}
    className="recharts-legend-icon"
  />
);

interface RectangleProps {
  fill: string;
}

export const Rectangle = ({ fill }: RectangleProps) => (
  <path
    stroke="none"
    fill={fill}
    d={`M0,${ICON_SIZE / 8}h${ICON_SIZE}v${(ICON_SIZE * 3) / 4}h${-ICON_SIZE}z`}
    className="recharts-legend-icon"
  />
);
