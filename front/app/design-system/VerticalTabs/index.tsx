import React, { ReactNode } from 'react';

import { Key, Tabs as AriaTabs } from 'react-aria-components';

import {
  ReasonKeysContext,
  useTabsSelection,
} from '../disabledReason/reasonKeys';
import { TabPanel } from '../Tabs';
import '../tokens.css';

import { StyleContext, VerticalTabsStyle } from './context';
import VerticalTab from './VerticalTab';
import VerticalTabList from './VerticalTabList';
import styles from './VerticalTabs.module.css';

export { VerticalTab, VerticalTabList, TabPanel };
export type { VerticalTabProps } from './VerticalTab';
export type { VerticalTabListProps } from './VerticalTabList';
export type { TabPanelProps } from '../Tabs';
export type { VerticalTabsStyle };

export type VerticalTabsProps = {
  // A VerticalTabList followed by its TabPanels.
  children: ReactNode;
  style?: VerticalTabsStyle;
  selectedKey?: Key | null;
  defaultSelectedKey?: Key;
  onSelectionChange?: (key: Key) => void;
  isDisabled?: boolean;
  disabledKeys?: Iterable<Key>;
};

const VerticalTabs = ({
  children,
  style = 'settings',
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  isDisabled,
  disabledKeys,
}: VerticalTabsProps) => {
  const selection = useTabsSelection(
    selectedKey,
    defaultSelectedKey,
    onSelectionChange
  );

  return (
    <StyleContext.Provider value={style}>
      <ReasonKeysContext.Provider value={selection.reasonKeys}>
        <AriaTabs
          orientation="vertical"
          className={styles.tabs}
          selectedKey={selection.selectedKey}
          onSelectionChange={selection.onSelectionChange}
          isDisabled={isDisabled}
          disabledKeys={disabledKeys}
        >
          {children}
        </AriaTabs>
      </ReasonKeysContext.Provider>
    </StyleContext.Provider>
  );
};

export default VerticalTabs;
