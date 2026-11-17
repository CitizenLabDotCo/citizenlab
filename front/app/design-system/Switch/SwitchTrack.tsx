import React from 'react';

import '../tokens.css';

import styles from './Switch.module.css';

type SwitchSize = 36 | 28 | 26;

type Props = {
  size: SwitchSize;
  isSelected: boolean;
  isFocusVisible?: boolean;
  isDisabled?: boolean;
};

// The track and thumb alone, for rows that own the interaction (the popover switch row).
const SwitchTrack = ({
  size,
  isSelected,
  isFocusVisible,
  isDisabled,
}: Props) => (
  <span
    className={`${styles.track} ${styles[`size${size}`]}`}
    data-selected={isSelected || undefined}
    data-focus-visible={isFocusVisible || undefined}
    data-disabled={isDisabled || undefined}
    aria-hidden
  >
    <span className={styles.thumb} />
  </span>
);

export default SwitchTrack;
