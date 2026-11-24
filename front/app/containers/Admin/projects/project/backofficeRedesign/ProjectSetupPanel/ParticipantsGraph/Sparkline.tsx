import React from 'react';

import styles from './ParticipantsGraph.module.css';

interface Props {
  values: number[];
}

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
    <svg
      className={styles.sparklineSvg}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <polygon
        className={styles.sparklineArea}
        points={getAreaPoints(linePoints)}
      />
      <polyline
        className={styles.sparklineLine}
        points={linePoints}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sparkline;
