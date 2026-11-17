import React, { ReactElement, ReactNode } from 'react';

import {
  Button as AriaButton,
  Column as AriaColumn,
  ColumnProps,
  Key,
  MenuTrigger,
} from 'react-aria-components';

import Icon from '../Icon';

import styles from './ColumnHeader.module.css';
import '../tokens.css';

export type ColumnIndicator = 'none' | 'ascending' | 'descending';

type ColumnHeaderProps = {
  id: Key;
  // The label.
  children: string;
  // Sort lives in the menu; the head only shows it.
  indicator?: ColumnIndicator;
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
  indicator = 'none',
  showChevron = true,
  menu,
  isRowHeader,
  defaultWidth,
  minWidth,
}: ColumnHeaderProps) => {
  const isOn = indicator !== 'none';

  const label: ReactNode = (
    <>
      <span className={styles.labelGroup}>
        <span className={styles.label}>{children}</span>
        {indicator === 'ascending' && (
          <Icon name="arrow-up-12" className={styles.arrow} />
        )}
        {indicator === 'descending' && (
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
      id={id}
      textValue={children}
      isRowHeader={isRowHeader}
      defaultWidth={defaultWidth}
      minWidth={minWidth}
      className={styles.column}
    >
      <div className={styles.cell} data-on={isOn || undefined}>
        {menu ? (
          <MenuTrigger>
            <AriaButton className={styles.trigger}>{label}</AriaButton>
            {menu}
          </MenuTrigger>
        ) : (
          <span className={styles.trigger}>{label}</span>
        )}
      </div>
    </AriaColumn>
  );
};

export default ColumnHeader;
