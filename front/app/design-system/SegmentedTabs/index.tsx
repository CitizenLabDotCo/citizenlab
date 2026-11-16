import React, { ReactNode } from 'react';

import { Key, Tabs } from 'react-aria-components';

import {
  ReasonKeysContext,
  useTabsSelection,
} from '../disabledReason/reasonKeys';
import '../tokens.css';

export { default as SegmentedTabList } from './SegmentedTabList';
export { default as SegmentedTab } from './SegmentedTab';

export type SegmentedTabsProps = {
  // A SegmentedTabList, then a React Aria TabPanel per tab.
  children: ReactNode;
  selectedKey?: Key | null;
  defaultSelectedKey?: Key;
  onSelectionChange?: (key: Key) => void;
  disabledKeys?: Iterable<Key>;
  isDisabled?: boolean;
};

const SegmentedTabs = ({
  children,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  disabledKeys,
  isDisabled,
}: SegmentedTabsProps) => {
  const selection = useTabsSelection(
    selectedKey,
    defaultSelectedKey,
    onSelectionChange
  );

  return (
    <ReasonKeysContext.Provider value={selection.reasonKeys}>
      <Tabs
        selectedKey={selection.selectedKey}
        onSelectionChange={selection.onSelectionChange}
        disabledKeys={disabledKeys}
        isDisabled={isDisabled}
      >
        {children}
      </Tabs>
    </ReasonKeysContext.Provider>
  );
};

export default SegmentedTabs;
