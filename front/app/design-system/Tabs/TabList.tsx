import React, { ReactNode } from 'react';

import { TabList as AriaTabList } from 'react-aria-components';

import '../tokens.css';
import styles from './Tabs.module.css';

export type TabListProps = {
  // Tab elements.
  children: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

const TabList = ({
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: TabListProps) => (
  <AriaTabList
    className={styles.tabList}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy}
  >
    {children}
  </AriaTabList>
);

export default TabList;
