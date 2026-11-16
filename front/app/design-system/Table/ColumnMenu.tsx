import React from 'react';

import {
  Autocomplete,
  Input,
  Key,
  Menu as AriaMenu,
  MenuSection,
  Popover,
  SearchField as AriaSearchField,
  Selection,
  Separator,
  SortDirection,
  useFilter,
} from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import { MenuItem } from '../Menu';
import surfaces from '../surfaces.module.css';
import '../tokens.css';

import styles from './ColumnMenu.module.css';
import messages from './messages';

export type ColumnMenuValue = { id: Key; label: string };

export type ColumnMenuProps = {
  // Picks the sort copy: A to Z, Smallest first or Earliest first.
  columnType?: 'text' | 'number' | 'date';
  // The current order gets the check.
  sortDirection?: SortDirection;
  onSortChange?: (direction: SortDirection) => void;
  onHide?: () => void;
  // The column's values, each a checkbox row; picks become filter chips.
  values?: ColumnMenuValue[];
  selectedValues?: Iterable<Key>;
  onSelectedValuesChange?: (keys: Set<Key>) => void;
  // E.g. Filter status.
  filterPlaceholder?: string;
};

const VALUES_SECTION = 'values';

const sortMessages = {
  text: [messages.sortAscendingText, messages.sortDescendingText],
  number: [messages.sortAscendingNumber, messages.sortDescendingNumber],
  date: [messages.sortAscendingDate, messages.sortDescendingDate],
};

const toKeySet = (keys: Selection) =>
  keys === 'all' ? new Set<Key>() : new Set(keys);

// Pass as the menu of a ColumnHeader: it opens under the head.
const ColumnMenu = ({
  columnType = 'text',
  sortDirection,
  onSortChange,
  onHide,
  values,
  selectedValues,
  onSelectedValuesChange,
  filterPlaceholder,
}: ColumnMenuProps) => {
  const { formatMessage } = useIntl();
  const { contains } = useFilter({ sensitivity: 'base' });
  const [ascending, descending] = sortMessages[columnType];
  const hasValues = !!values && values.length > 0;

  // The search only narrows the values; sort and Hide column stay.
  const filter = (
    textValue: string,
    inputValue: string,
    node: { parentKey?: Key | null }
  ) => node.parentKey !== VALUES_SECTION || contains(textValue, inputValue);

  return (
    <Popover
      placement="bottom start"
      offset={4}
      className={`${surfaces.dropdown} ${styles.popover}`}
    >
      <Autocomplete filter={filter}>
        <AriaMenu className={styles.menu}>
          <MenuSection
            id="sort"
            aria-label={formatMessage(messages.sortSection)}
            selectionMode="single"
            selectedKeys={sortDirection ? [sortDirection] : []}
            onSelectionChange={(keys) => {
              const [direction] = toKeySet(keys);
              if (direction === 'ascending' || direction === 'descending') {
                onSortChange?.(direction);
              }
            }}
            className={styles.section}
          >
            <MenuItem id="ascending" icon="arrow-up-16">
              {formatMessage(ascending)}
            </MenuItem>
            <MenuItem id="descending" icon="arrow-down-16">
              {formatMessage(descending)}
            </MenuItem>
          </MenuSection>
          <Separator className={styles.separator} />
          <MenuItem id="hide" icon="eye-off-16" onAction={onHide}>
            {formatMessage(messages.hideColumn)}
          </MenuItem>
          {hasValues && <Separator className={styles.separator} />}
          {hasValues && (
            <MenuSection
              id={VALUES_SECTION}
              aria-label={formatMessage(messages.valuesSection)}
              selectionMode="multiple"
              selectedKeys={selectedValues}
              onSelectionChange={(keys) =>
                onSelectedValuesChange?.(toKeySet(keys))
              }
              className={`${styles.section} ${styles.values}`}
            >
              {values.map((value) => (
                <MenuItem key={value.id} id={value.id}>
                  {value.label}
                </MenuItem>
              ))}
            </MenuSection>
          )}
        </AriaMenu>
        {hasValues && (
          <AriaSearchField
            className={styles.search}
            aria-label={filterPlaceholder}
          >
            <Input className={styles.input} placeholder={filterPlaceholder} />
          </AriaSearchField>
        )}
      </Autocomplete>
    </Popover>
  );
};

export default ColumnMenu;
