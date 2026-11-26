import React, { useState } from 'react';

import styles from './Skeleton.module.css';
import '../tokens.css';

// One sweep of the shine, in ms. Matches the animation in Skeleton.module.css.
const WAVE_DURATION = 1600;

type Props = {
  // Line = a row of text; Block = a card, image or chart.
  shape?: 'line' | 'block';
  // onGrey = on a grey surface, such as the preview stage: one step darker.
  tone?: 'default' | 'onGrey';
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
};

// Decorative: the region that is loading carries aria-busy.
const Skeleton = ({
  shape = 'line',
  tone = 'default',
  width,
  height,
  radius,
  className,
}: Props) => {
  // Every skeleton runs on the page's clock, so the shine is one band that
  // crosses all of them, even ones that mount later.
  const [delay] = useState(() => -(performance.now() % WAVE_DURATION));

  return (
    <span
      className={`${styles.skeleton} ${styles[shape]} ${
        tone === 'onGrey' ? styles.onGrey : ''
      } ${className ?? ''}`}
      style={{
        width,
        height,
        borderRadius: radius,
        animationDelay: `${delay}ms`,
      }}
      aria-hidden
    />
  );
};

export default Skeleton;
