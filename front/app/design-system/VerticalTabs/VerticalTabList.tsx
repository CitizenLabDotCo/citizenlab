import React, { ReactNode } from 'react';

import { TabList as AriaTabList } from 'react-aria-components';

import styles from './VerticalTabs.module.css';
import '../tokens.css';

type Props = {
  // VerticalTab elements.
  children: ReactNode;
};

const VerticalTabList = ({ children }: Props) => (
  <AriaTabList className={styles.tabList}>{children}</AriaTabList>
);

export default VerticalTabList;
