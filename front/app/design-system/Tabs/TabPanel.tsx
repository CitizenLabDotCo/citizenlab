import React, { ReactNode } from 'react';

import { Key, TabPanel as AriaTabPanel } from 'react-aria-components';

import styles from './Tabs.module.css';
import '../tokens.css';

type Props = {
  id: Key;
  children: ReactNode;
  className?: string;
};

const TabPanel = ({ id, children, className }: Props) => (
  <AriaTabPanel id={id} className={`${styles.tabPanel} ${className ?? ''}`}>
    {children}
  </AriaTabPanel>
);

export default TabPanel;
