import React, { ReactNode } from 'react';

import { TabList } from 'react-aria-components';

import '../tokens.css';

import styles from './SegmentedTabs.module.css';

type Props = {
  // Two or three SegmentedTabs.
  children: ReactNode;
  'aria-label': string;
};

const SegmentedTabList = ({ children, 'aria-label': ariaLabel }: Props) => (
  <TabList className={styles.tabList} aria-label={ariaLabel}>
    {children}
  </TabList>
);

export default SegmentedTabList;
