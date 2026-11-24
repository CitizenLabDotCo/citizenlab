import React, { ReactNode } from 'react';

import { Button as AriaButton, PressEvent } from 'react-aria-components';

import styles from './MethodCard.module.css';
import '../tokens.css';

type MethodCardProps = {
  title: ReactNode;
  description: ReactNode;
  // The resident preview shown above the text.
  art: ReactNode;
  // Badges with use="note"; the Notes row shows when set.
  notes?: ReactNode;
  onPress?: (e: PressEvent) => void;
};

const MethodCard = ({
  title,
  description,
  art,
  notes,
  onPress,
}: MethodCardProps) => (
  <AriaButton className={styles.card} onPress={onPress}>
    <span className={styles.art}>{art}</span>
    <span className={styles.text}>
      <span className={styles.title}>{title}</span>
      <span className={styles.description}>{description}</span>
      {notes && <span className={styles.notes}>{notes}</span>}
    </span>
  </AriaButton>
);

export default MethodCard;
