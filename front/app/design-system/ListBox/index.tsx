import React, { ReactNode } from 'react';

import { Key, ListBox as AriaListBox, Selection } from 'react-aria-components';

import {
  ReasonKeysContext,
  togglesReasonKey,
  useGuardedValue,
  useListBoxReasonKeys,
} from '../disabledReason/reasonKeys';
import '../tokens.css';

import styles from './ListBox.module.css';

export { default as ListBoxOption } from './ListBoxOption';
export type { ListBoxOptionProps } from './ListBoxOption';
export { default as ListBoxPopover } from './ListBoxPopover';

export type ListBoxProps<T extends object> = {
  // ListBoxOption elements, or a function of each item when `items` is set.
  children: ReactNode | ((item: T) => ReactNode);
  items?: Iterable<T>;
  'aria-label'?: string;
  // Single draws the check on the selected option, multiple the checkbox.
  selectionMode?: 'single' | 'multiple';
  selectedKeys?: Selection;
  defaultSelectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  disabledKeys?: Iterable<Key>;
  renderEmptyState?: () => ReactNode;
  'data-cy'?: string;
};

// Inside Select and ComboBox it takes its selection from them; on its own (the tag picker)
// pass selectionMode and the selection.
const ListBox = <T extends object>({
  children,
  items,
  'aria-label': ariaLabel,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  disabledKeys,
  renderEmptyState,
  'data-cy': dataCy,
}: ListBoxProps<T>) => {
  // A ListBoxOption with a disabled reason takes focus but is never selected. Inside
  // a Select or ComboBox, they guard the selection instead.
  const reasonKeys = useListBoxReasonKeys();
  const [currentKeys, handleSelectionChange] = useGuardedValue<Selection>(
    selectedKeys,
    defaultSelectedKeys ?? new Set(),
    onSelectionChange,
    (next, current) => togglesReasonKey(reasonKeys, next, current)
  );
  // Without its own selectionMode the selection belongs to a Select or ComboBox.
  const ownsSelection = selectionMode !== undefined;

  return (
    <ReasonKeysContext.Provider value={reasonKeys}>
      <AriaListBox
        items={items}
        aria-label={ariaLabel}
        selectionMode={selectionMode}
        selectedKeys={ownsSelection ? currentKeys : undefined}
        onSelectionChange={ownsSelection ? handleSelectionChange : undefined}
        disabledKeys={disabledKeys}
        renderEmptyState={renderEmptyState}
        className={styles.listBox}
        data-cy={dataCy}
      >
        {children}
      </AriaListBox>
    </ReasonKeysContext.Provider>
  );
};

export default ListBox;
