import React, {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
} from 'react';

import {
  Button as AriaButton,
  Column as AriaColumn,
  ColumnProps,
  Key,
  MenuTrigger,
  SortDirection,
} from 'react-aria-components';

import Icon from '../Icon';
import Tooltip from '../Tooltip';

import styles from './ColumnHeader.module.css';
import '../tokens.css';

export const ColumnSortContext = createContext<SortDirection | undefined>(
  undefined
);

type ColumnHeaderProps = {
  id: Key;
  // The label.
  children: string;
  sortDirection?: SortDirection;
  sortAction?: { onPress: () => void; label: string };
  showChevron?: boolean;
  // A ColumnMenu; a press on the head opens it.
  menu?: ReactElement;
  isRowHeader?: boolean;
  defaultWidth?: ColumnProps['defaultWidth'];
  minWidth?: ColumnProps['minWidth'];
  align?: 'start' | 'end';
};

const ColumnHeader = ({
  id,
  children,
  sortDirection,
  sortAction,
  showChevron = true,
  menu,
  isRowHeader,
  defaultWidth,
  minWidth,
  align = 'start',
}: ColumnHeaderProps) => {
  // React Aria only sets aria-sort with allowsSorting, which would make a
  // press on the head sort instead of opening the menu.
  const ref = useCallback(
    (column: HTMLTableCellElement | null) => {
      if (!column) return;
      if (sortDirection) {
        column.setAttribute('aria-sort', sortDirection);
      } else {
        column.removeAttribute('aria-sort');
      }
    },
    [sortDirection]
  );

  const label: ReactNode = (
    <>
      <span className={styles.labelGroup}>
        <span className={styles.label}>{children}</span>
        {sortDirection === 'ascending' && (
          <Icon name="arrow-up-12" className={styles.arrow} />
        )}
        {sortDirection === 'descending' && (
          <Icon name="arrow-down-12" className={styles.arrow} />
        )}
      </span>
      {showChevron && (
        <Icon name="chevron-down-12" className={styles.chevron} />
      )}
    </>
  );

  return (
    <AriaColumn
      ref={ref}
      id={id}
      textValue={children}
      isRowHeader={isRowHeader}
      defaultWidth={defaultWidth}
      minWidth={minWidth}
      className={styles.column}
    >
      <div
        className={`${styles.cell} ${align === 'end' ? styles.end : ''}`}
        data-on={sortDirection ? true : undefined}
      >
        {menu ? (
          <ColumnSortContext.Provider value={sortDirection}>
            <MenuTrigger>
              <AriaButton className={styles.trigger}>{label}</AriaButton>
              {menu}
            </MenuTrigger>
          </ColumnSortContext.Provider>
        ) : sortAction ? (
          <Tooltip content={sortAction.label}>
            <AriaButton className={styles.trigger} onPress={sortAction.onPress}>
              {label}
            </AriaButton>
          </Tooltip>
        ) : (
          <span className={styles.trigger}>{label}</span>
        )}
      </div>
    </AriaColumn>
  );
};

export default ColumnHeader;
