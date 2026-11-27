import React, { ReactNode } from 'react';

import {
  Autocomplete,
  Button,
  Dialog,
  Key,
  Popover,
  Selection,
  useFilter,
} from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import ListBox from '../ListBox';
import SearchField from '../SearchField';
import surfaces from '../surfaces.module.css';

import messages from './messages';
import styles from './TagPicker.module.css';
import '../tokens.css';

type TagPickerProps<T extends { id: Key }> = {
  items: T[];
  // A ListBoxOption for each item.
  children: (item: T) => ReactNode;
  // Names the dialog and the list.
  'aria-label': string;
  selectedKeys: Set<Key>;
  onSelectionChange: (keys: Set<Key>) => void;
};

// Put it in a DialogTrigger after the TagAdd pill of a TagGroup.
const TagPicker = <T extends { id: Key }>({
  items,
  children,
  'aria-label': ariaLabel,
  selectedKeys,
  onSelectionChange,
}: TagPickerProps<T>) => {
  const { formatMessage } = useIntl();
  const { contains } = useFilter({ sensitivity: 'base' });

  // Select all (Ctrl+A) reports 'all'; the picker always works with the keys.
  const handleSelectionChange = (selection: Selection) => {
    onSelectionChange(
      selection === 'all'
        ? new Set(items.map((item) => item.id))
        : new Set(selection)
    );
  };

  return (
    <Popover
      placement="bottom start"
      offset={4}
      className={`${surfaces.dropdown} ${styles.popover}`}
    >
      <Dialog aria-label={ariaLabel} className={styles.dialog}>
        {({ close }) => (
          <>
            <Autocomplete filter={contains}>
              <SearchField
                aria-label={formatMessage(messages.search)}
                placeholder={formatMessage(messages.search)}
                size={36}
                autoFocus
              />
              <ListBox
                items={items}
                aria-label={ariaLabel}
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={handleSelectionChange}
              >
                {children}
              </ListBox>
            </Autocomplete>
            <div className={styles.footer}>
              <span className={styles.count}>
                {formatMessage(messages.selectedCount, {
                  count: selectedKeys.size,
                })}
              </span>
              <Button className={styles.done} onPress={close}>
                {formatMessage(messages.done)}
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </Popover>
  );
};

export default TagPicker;
