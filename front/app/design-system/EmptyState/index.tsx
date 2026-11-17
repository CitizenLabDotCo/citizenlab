import React, { ReactNode } from 'react';

import styles from './EmptyState.module.css';
import '../tokens.css';

type Props = {
  // One sentence saying what is missing and, if it helps, when it will appear.
  children: ReactNode;
  // List = where the rows would be; Card = inside a dashboard card.
  context?: 'list' | 'card';
};

const EmptyState = ({ children, context = 'list' }: Props) => (
  <div className={`${styles.emptyState} ${styles[context]}`}>{children}</div>
);

export default EmptyState;
