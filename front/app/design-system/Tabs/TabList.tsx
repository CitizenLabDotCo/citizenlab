import React, { ReactNode } from 'react';

import { TabList as AriaTabList } from 'react-aria-components';

import styles from './Tabs.module.css';
import '../tokens.css';

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
