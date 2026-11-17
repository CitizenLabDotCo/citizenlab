import React, { ReactNode } from 'react';

import { TabList as AriaTabList } from 'react-aria-components';

import '../tokens.css';
import styles from './Tabs.module.css';

type Props = {
  // Tab elements.
  children: ReactNode;
  'aria-label'?: string;
};

const TabList = ({ children, 'aria-label': ariaLabel }: Props) => (
  <AriaTabList className={styles.tabList} aria-label={ariaLabel}>
    {children}
  </AriaTabList>
);

export default TabList;
