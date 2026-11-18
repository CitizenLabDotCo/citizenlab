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

import styles from './ColumnHeader.module.css';
import '../tokens.css';

export const ColumnSortContext = createContext<SortDirection | undefined>(
  undefined
);

type ColumnHeaderProps = {
  id: Key;
  // The label.
  children: string;
  // Sort lives in the menu; the head only shows it.
  sortDirection?: SortDirection;
  showChevron?: boolean;
  // A ColumnMenu; a press on the head opens it.
  menu?: ReactElement;
  isRowHeader?: boolean;
  defaultWidth?: ColumnProps['defaultWidth'];
  minWidth?: ColumnProps['minWidth'];
};

const ColumnHeader = ({
  id,
  children,
  sortDirection,
  showChevron = true,
  menu,
  isRowHeader,
  defaultWidth,
  minWidth,
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
      <div className={styles.cell} data-on={sortDirection ? true : undefined}>
        {menu ? (
          <ColumnSortContext.Provider value={sortDirection}>
            <MenuTrigger>
              <AriaButton className={styles.trigger}>{label}</AriaButton>
              {menu}
            </MenuTrigger>
          </ColumnSortContext.Provider>
        ) : (
          <span className={styles.trigger}>{label}</span>
        )}
      </div>
    </AriaColumn>
  );
};

export default ColumnHeader;
