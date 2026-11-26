import React, { ReactNode } from 'react';

import { Key, Tabs as AriaTabs } from 'react-aria-components';

import Tab from './Tab';
import TabList from './TabList';
import TabPanel from './TabPanel';
import styles from './Tabs.module.css';
import '../tokens.css';

export { Tab, TabList, TabPanel };

type Props = {
  // A TabList followed by its TabPanels.
  children: ReactNode;
  selectedKey: Key;
  onSelectionChange: (key: Key) => void;
};

const Tabs = ({ children, selectedKey, onSelectionChange }: Props) => (
  <AriaTabs
    className={styles.tabs}
    selectedKey={selectedKey}
    onSelectionChange={onSelectionChange}
  >
    {children}
  </AriaTabs>
);

export default Tabs;
