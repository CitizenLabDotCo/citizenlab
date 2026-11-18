import React, { useContext } from 'react';

import {
  Key,
  Menu as AriaMenu,
  MenuSection,
  Popover,
  Selection,
  Separator,
  SortDirection,
} from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import { MenuItem } from '../Menu';
import surfaces from '../surfaces.module.css';

import { ColumnSortContext } from './ColumnHeader';
import styles from './ColumnMenu.module.css';
import messages from './messages';
import '../tokens.css';

type ColumnMenuProps = {
  // Picks the sort copy: A to Z, Smallest first or Earliest first.
  columnType: 'text' | 'number' | 'date';
  // The current order gets the check. Inside a ColumnHeader it defaults to the head's.
  sortDirection?: SortDirection;
  onSortChange: (direction: SortDirection) => void;
  onHide?: () => void;
};

const sortMessages = {
  text: [messages.sortAscendingText, messages.sortDescendingText],
  number: [messages.sortAscendingNumber, messages.sortDescendingNumber],
  date: [messages.sortAscendingDate, messages.sortDescendingDate],
};

const toKeySet = (keys: Selection) =>
  keys === 'all' ? new Set<Key>() : new Set(keys);

// Pass as the menu of a ColumnHeader: it opens under the head.
const ColumnMenu = ({
  columnType,
  sortDirection,
  onSortChange,
  onHide,
}: ColumnMenuProps) => {
  const { formatMessage } = useIntl();
  const columnSortDirection = useContext(ColumnSortContext);
  const checked = sortDirection ?? columnSortDirection;
  const [ascending, descending] = sortMessages[columnType];

  return (
    <Popover
      placement="bottom start"
      offset={4}
      className={`${surfaces.dropdown} ${styles.popover}`}
    >
      <AriaMenu className={styles.menu}>
        <MenuSection
          id="sort"
          aria-label={formatMessage(messages.sortSection)}
          selectionMode="single"
          selectedKeys={checked ? [checked] : []}
          onSelectionChange={(keys) => {
            const [direction] = toKeySet(keys);
            if (direction === 'ascending' || direction === 'descending') {
              onSortChange(direction);
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
      </AriaMenu>
    </Popover>
  );
};

export default ColumnMenu;
