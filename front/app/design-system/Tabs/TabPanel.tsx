import React, { ReactNode } from 'react';

import { Key, TabPanel as AriaTabPanel } from 'react-aria-components';

import '../tokens.css';
import styles from './Tabs.module.css';

type Props = {
  id: Key;
  children: ReactNode;
};

const TabPanel = ({ id, children }: Props) => (
  <AriaTabPanel id={id} className={styles.tabPanel}>
    {children}
  </AriaTabPanel>
);

export default TabPanel;
