import React, { ReactNode } from 'react';

import { Button as AriaButton, PressEvent } from 'react-aria-components';

import '../tokens.css';

import styles from './MethodCard.module.css';

export type MethodCardProps = {
  title: ReactNode;
  description: ReactNode;
  // The resident preview shown above the text.
  art: ReactNode;
  // Badges with use="note"; the Notes row shows when set.
  notes?: ReactNode;
  onPress?: (e: PressEvent) => void;
  'data-cy'?: string;
};

const MethodCard = ({
  title,
  description,
  art,
  notes,
  onPress,
  'data-cy': dataCy,
}: MethodCardProps) => (
  <AriaButton className={styles.card} onPress={onPress} data-cy={dataCy}>
    <span className={styles.art}>{art}</span>
    <span className={styles.text}>
      <span className={styles.title}>{title}</span>
      <span className={styles.description}>{description}</span>
      {notes && <span className={styles.notes}>{notes}</span>}
    </span>
  </AriaButton>
);

export default MethodCard;
