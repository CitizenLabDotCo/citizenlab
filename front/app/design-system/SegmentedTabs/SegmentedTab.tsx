import React, { ReactNode } from 'react';

import { Key, SelectionIndicator, Tab } from 'react-aria-components';

import styles from './SegmentedTabs.module.css';
import '../tokens.css';

type Props = {
  id: Key;
  children: ReactNode;
  // Makes the tab a link, for views that each have their own route.
  href?: string;
};

const SegmentedTab = ({ id, children, href }: Props) => (
  <Tab id={id} className={styles.tab} href={href}>
    <SelectionIndicator className={styles.indicator} />
    <span className={styles.label}>{children}</span>
  </Tab>
);

export default SegmentedTab;
