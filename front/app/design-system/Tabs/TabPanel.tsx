import React, { ReactNode } from 'react';

import { Key, TabPanel as AriaTabPanel } from 'react-aria-components';

import '../tokens.css';
import styles from './Tabs.module.css';

export type TabPanelProps = {
  id: Key;
  children: ReactNode;
  // Keep the panel mounted while another tab is selected.
  shouldForceMount?: boolean;
};

const TabPanel = ({ id, children, shouldForceMount }: TabPanelProps) => (
  <AriaTabPanel
    id={id}
    shouldForceMount={shouldForceMount}
    className={styles.tabPanel}
  >
    {children}
  </AriaTabPanel>
);

export default TabPanel;
