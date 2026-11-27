import React, { ReactNode } from 'react';

import styles from './ManageLayout.module.css';
import 'design-system/tokens.css';

interface Props {
  side: ReactNode;
  children: ReactNode;
}

// The frame every method's Manage view shares. Each column scrolls on its own,
// so the cards stay in view while the list is scrolled. Both are positioned
// so the hidden input of a toggle stays in its column when it gets focus.
const ManageLayout = ({ side, children }: Props) => (
  <div className={styles.layout}>
    <div className={styles.side}>{side}</div>
    <div className={styles.main}>{children}</div>
  </div>
);

export default ManageLayout;
