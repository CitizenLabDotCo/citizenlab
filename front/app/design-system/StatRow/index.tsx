import React, { ReactNode } from 'react';

import { Button as AriaButton, PressEvent } from 'react-aria-components';

import Icon from '../Icon';

import styles from './StatRow.module.css';
import '../tokens.css';

// A pressable row is a toggle that filters the list: isPressed sets aria-pressed
// and draws it as a picked row.
type PressableProps =
  | { onPress: (e: PressEvent) => void; isPressed: boolean }
  | { onPress?: undefined; isPressed?: undefined };

type StatRowProps = PressableProps & {
  label: ReactNode;
  value: ReactNode;
};

const StatRow = ({ label, value, onPress, isPressed }: StatRowProps) => {
  const content = (
    <>
      <span className={styles.label}>
        <span className={styles.labelText}>{label}</span>
      </span>
      <span className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {onPress && <Icon name="chevron-right-16" className={styles.chevron} />}
      </span>
    </>
  );

  if (onPress) {
    return (
      <AriaButton
        className={`${styles.statRow} ${styles.pressable}`}
        onPress={onPress}
        aria-pressed={isPressed}
      >
        {content}
      </AriaButton>
    );
  }

  return <div className={styles.statRow}>{content}</div>;
};

export default StatRow;
