import React, { ReactNode } from 'react';

import { Key, Tabs as AriaTabs } from 'react-aria-components';

import { TabPanel } from '../Tabs';

import VerticalTab from './VerticalTab';
import VerticalTabList from './VerticalTabList';
import styles from './VerticalTabs.module.css';
import '../tokens.css';

export { VerticalTab, VerticalTabList, TabPanel };

type Props = {
  // A VerticalTabList followed by its TabPanels.
  children: ReactNode;
  className?: string;
  selectedKey: Key;
  onSelectionChange: (key: Key) => void;
};

const VerticalTabs = ({
  children,
  className,
  selectedKey,
  onSelectionChange,
}: Props) => (
  <AriaTabs
    orientation="vertical"
    className={`${styles.tabs} ${className ?? ''}`}
    selectedKey={selectedKey}
    onSelectionChange={onSelectionChange}
  >
    {children}
  </AriaTabs>
);

export default VerticalTabs;
