import React, { ReactNode } from 'react';

import { Toolbar as AriaToolbar } from 'react-aria-components';

import '../tokens.css';

import styles from './Toolbar.module.css';

export type ToolbarProps = {
  'aria-label': string;
  // What you see: QuickFilter and AddFilter, 16 apart.
  filters?: ReactNode;
  // How you see it: ViewPills, ViewIconButtons or the SearchField (240 wide), 8 apart.
  display?: ReactNode;
};

const Toolbar = ({
  'aria-label': ariaLabel,
  filters,
  display,
}: ToolbarProps) => (
  <AriaToolbar className={styles.toolbar} aria-label={ariaLabel}>
    <div className={styles.filters}>{filters}</div>
    <div className={styles.display}>{display}</div>
  </AriaToolbar>
);

export default Toolbar;
