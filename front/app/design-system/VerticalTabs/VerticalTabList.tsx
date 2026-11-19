import React, { ReactNode } from 'react';

import { TabList as AriaTabList } from 'react-aria-components';

import styles from './VerticalTabs.module.css';
import '../tokens.css';

type Props = {
  // VerticalTab elements.
  children: ReactNode;
  // Settings: the sunken column of a settings modal. Rail: the lighter category rail of a picker.
  tabStyle?: 'settings' | 'rail';
};

const VerticalTabList = ({ children, tabStyle = 'settings' }: Props) => (
  <AriaTabList
    className={`${styles.tabList} ${tabStyle === 'rail' ? styles.rail : ''}`}
  >
    {children}
  </AriaTabList>
);

export default VerticalTabList;
