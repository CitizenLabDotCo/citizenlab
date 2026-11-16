import React, { ReactNode } from 'react';

import { Key, Tabs as AriaTabs } from 'react-aria-components';

import {
  ReasonKeysContext,
  useTabsSelection,
} from '../disabledReason/reasonKeys';
import '../tokens.css';

import Tab from './Tab';
import TabList from './TabList';
import TabPanel from './TabPanel';
import styles from './Tabs.module.css';

export { Tab, TabList, TabPanel };
export type { TabProps } from './Tab';
export type { TabListProps } from './TabList';
export type { TabPanelProps } from './TabPanel';

export type TabsProps = {
  // A TabList followed by its TabPanels.
  children: ReactNode;
  selectedKey?: Key | null;
  defaultSelectedKey?: Key;
  onSelectionChange?: (key: Key) => void;
  isDisabled?: boolean;
  disabledKeys?: Iterable<Key>;
};

const Tabs = ({
  children,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  isDisabled,
  disabledKeys,
}: TabsProps) => {
  const selection = useTabsSelection(
    selectedKey,
    defaultSelectedKey,
    onSelectionChange
  );

  return (
    <ReasonKeysContext.Provider value={selection.reasonKeys}>
      <AriaTabs
        className={styles.tabs}
        selectedKey={selection.selectedKey}
        onSelectionChange={selection.onSelectionChange}
        isDisabled={isDisabled}
        disabledKeys={disabledKeys}
      >
        {children}
      </AriaTabs>
    </ReasonKeysContext.Provider>
  );
};

export default Tabs;
