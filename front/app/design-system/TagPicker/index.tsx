import React, { ReactNode, useState } from 'react';

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
import '../tokens.css';
import surfaces from '../surfaces.module.css';

import messages from './messages';
import styles from './TagPicker.module.css';

export type TagPickerProps<T extends { id: Key }> = {
  items: T[];
  // A ListBoxOption for each item.
  children: (item: T) => ReactNode;
  // Names the dialog and the list.
  'aria-label': string;
  selectedKeys?: Set<Key>;
  defaultSelectedKeys?: Set<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
  'data-cy'?: string;
};

// Put it in a DialogTrigger after the TagAdd pill of a TagGroup.
const TagPicker = <T extends { id: Key }>({
  items,
  children,
  'aria-label': ariaLabel,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  'data-cy': dataCy,
}: TagPickerProps<T>) => {
  const { formatMessage } = useIntl();
  const { contains } = useFilter({ sensitivity: 'base' });
  const [uncontrolledKeys, setUncontrolledKeys] = useState<Set<Key>>(
    defaultSelectedKeys ?? new Set()
  );
  const keys = selectedKeys ?? uncontrolledKeys;

  // Select all (Ctrl+A) reports 'all'; the picker always works with the keys.
  const handleSelectionChange = (selection: Selection) => {
    const next =
      selection === 'all'
        ? new Set(items.map((item) => item.id))
        : new Set(selection);
    setUncontrolledKeys(next);
    onSelectionChange?.(next);
  };

  return (
    <Popover
      placement="bottom start"
      offset={4}
      className={`${surfaces.dropdown} ${styles.popover}`}
    >
      <Dialog aria-label={ariaLabel} className={styles.dialog} data-cy={dataCy}>
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
                selectedKeys={keys}
                onSelectionChange={handleSelectionChange}
              >
                {children}
              </ListBox>
            </Autocomplete>
            <div className={styles.footer}>
              <span className={styles.count}>
                {formatMessage(messages.selectedCount, { count: keys.size })}
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
