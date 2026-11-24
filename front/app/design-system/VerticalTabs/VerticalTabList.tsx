import React, { ReactNode } from 'react';

import { TabList as AriaTabList } from 'react-aria-components';

import styles from './VerticalTabs.module.css';
import '../tokens.css';

type Props = {
  // VerticalTab elements.
  children: ReactNode;
  className?: string;
  tabStyle?: 'settings' | 'rail';
};

const VerticalTabList = ({
  children,
  className,
  tabStyle = 'settings',
}: Props) => (
  <AriaTabList
    className={`${styles.tabList} ${tabStyle === 'rail' ? styles.rail : ''} ${
      className ?? ''
    }`}
  >
    {children}
  </AriaTabList>
);

export default VerticalTabList;
