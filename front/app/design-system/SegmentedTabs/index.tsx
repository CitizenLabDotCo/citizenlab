import React, { ReactNode } from 'react';

import { Key, Tabs } from 'react-aria-components';
import '../tokens.css';

export { default as SegmentedTabList } from './SegmentedTabList';
export { default as SegmentedTab } from './SegmentedTab';

type SegmentedTabsProps = {
  // A SegmentedTabList, then a React Aria TabPanel per tab.
  children: ReactNode;
  selectedKey: Key;
  onSelectionChange?: (key: Key) => void;
};

const SegmentedTabs = ({
  children,
  selectedKey,
  onSelectionChange,
}: SegmentedTabsProps) => (
  <Tabs selectedKey={selectedKey} onSelectionChange={onSelectionChange}>
    {children}
  </Tabs>
);

export default SegmentedTabs;
