import React, { ReactNode } from 'react';

import 'design-system/tokens.css';

import styles from './SideColumn.module.css';

interface Props {
  fillHeight?: boolean;
  children: ReactNode;
}

const Card = ({ fillHeight = false, children }: Props) => (
  <div
    className={fillHeight ? `${styles.card} ${styles.fillHeight}` : styles.card}
  >
    {children}
  </div>
);

export default Card;
