import React from 'react';

// Adapted from https://github.com/recharts/recharts/blob/master/src/component/DefaultLegendContent.tsx
const SIZE = 32;
const halfSize = SIZE / 2;
const sixthSize = SIZE / 6;
const thirdSize = SIZE / 3;

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
    x2={SIZE}
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
            H${SIZE}M${2 * thirdSize},${halfSize}
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
    d={`M0,${SIZE / 8}h${SIZE}v${(SIZE * 3) / 4}h${-SIZE}z`}
    className="recharts-legend-icon"
  />
);
