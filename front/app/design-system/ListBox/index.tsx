import React, { ReactNode, useContext } from 'react';

import { Key, ListBox as AriaListBox, Selection } from 'react-aria-components';

import {
  ReasonKeysContext,
  togglesReasonKey,
  useGuardedValue,
  useReasonKeys,
} from '../disabledReason/reasonKeys';

import styles from './ListBox.module.css';
import '../tokens.css';

export { default as ListBoxOption } from './ListBoxOption';
export { default as ListBoxPopover } from './ListBoxPopover';

type ListBoxProps<T extends object> = {
  // ListBoxOption elements, or a function of each item when `items` is set.
  children: ReactNode | ((item: T) => ReactNode);
  items?: Iterable<T>;
  'aria-label'?: string;
  // Single draws the check on the selected option, multiple the checkbox.
  selectionMode?: 'single' | 'multiple';
  selectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  disabledKeys?: Iterable<Key>;
};

// Inside Select and ComboBox it takes its selection from them; on its own (the tag picker)
// pass selectionMode and the selection.
const ListBox = <T extends object>({
  children,
  items,
  'aria-label': ariaLabel,
  selectionMode,
  selectedKeys,
  onSelectionChange,
  disabledKeys,
}: ListBoxProps<T>) => {
  // Without its own selectionMode the selection belongs to a Select or ComboBox.
  const ownsSelection = selectionMode !== undefined;

  // A ListBoxOption with a disabled reason takes focus but is never selected.
  // A list with its own selectionMode keeps its own keys, even inside a Menu or
  // RadioGroup; without one it uses the keys of its Select or ComboBox.
  const fieldReasonKeys = useContext(ReasonKeysContext);
  const listReasonKeys = useReasonKeys();
  const reasonKeys = ownsSelection
    ? listReasonKeys
    : fieldReasonKeys ?? listReasonKeys;
  const [currentKeys, handleSelectionChange] = useGuardedValue<Selection>(
    selectedKeys,
    new Set(),
    onSelectionChange,
    (next, current) => togglesReasonKey(reasonKeys, next, current)
  );

  return (
    <ReasonKeysContext.Provider value={reasonKeys}>
      <AriaListBox
        items={items}
        aria-label={ariaLabel}
        selectionMode={selectionMode}
        selectedKeys={ownsSelection ? currentKeys : undefined}
        onSelectionChange={ownsSelection ? handleSelectionChange : undefined}
        disabledKeys={disabledKeys}
        className={styles.listBox}
      >
        {children}
      </AriaListBox>
    </ReasonKeysContext.Provider>
  );
};

export default ListBox;
