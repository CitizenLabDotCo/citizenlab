import React, { ReactElement, ReactNode } from 'react';

import {
  Button as AriaButton,
  Column as AriaColumn,
  ColumnProps,
  Key,
  MenuTrigger,
} from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Icon from '../Icon';
import '../tokens.css';

import styles from './ColumnHeader.module.css';
import ColumnResizer from './ColumnResizer';
import messages from './messages';

export type ColumnIndicator = 'none' | 'ascending' | 'descending' | 'filtered';

type ExpandAllProps =
  | { hasExpandAll?: false; isAllExpanded?: undefined; onExpandAll?: undefined }
  // Only on the Name head of a nested list.
  | {
      hasExpandAll: true;
      // Every row is open: the control reads Collapse all.
      isAllExpanded: boolean;
      onExpandAll: () => void;
    };

export type ColumnHeaderProps = ExpandAllProps & {
  id: Key;
  // The label.
  children: string;
  size?: 36 | 32;
  // Sort and filter live in the menu; the head only shows them.
  indicator?: ColumnIndicator;
  showChevron?: boolean;
  // End-aligns number columns.
  align?: 'start' | 'end';
  // A ColumnMenu; a press on the head opens it.
  menu?: ReactElement;
  allowsResizing?: boolean;
  isRowHeader?: boolean;
  width?: ColumnProps['width'];
  defaultWidth?: ColumnProps['defaultWidth'];
  minWidth?: ColumnProps['minWidth'];
  maxWidth?: ColumnProps['maxWidth'];
  'data-cy'?: string;
};

const ColumnHeader = ({
  id,
  children,
  size = 36,
  indicator = 'none',
  showChevron = true,
  align = 'start',
  menu,
  allowsResizing = true,
  isRowHeader,
  width,
  defaultWidth,
  minWidth,
  maxWidth,
  hasExpandAll,
  isAllExpanded,
  onExpandAll,
  'data-cy': dataCy,
}: ColumnHeaderProps) => {
  const { formatMessage } = useIntl();
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
      {indicator === 'filtered' && (
        <Icon name="filter-lines-12" className={styles.filter} />
      )}
      {showChevron && (
        <Icon name="chevron-down-12" className={styles.chevron} />
      )}
    </>
  );

  const triggerClassName = `${styles.trigger} ${
    hasExpandAll ? styles.afterExpandAll : ''
  }`;

  return (
    <AriaColumn
      id={id}
      textValue={children}
      isRowHeader={isRowHeader}
      width={width}
      defaultWidth={defaultWidth}
      minWidth={minWidth}
      maxWidth={maxWidth}
      className={`${styles.column} ${styles[`size${size}`]}`}
      data-cy={dataCy}
    >
      <div
        className={styles.cell}
        data-align={align}
        data-on={isOn || undefined}
      >
        {hasExpandAll && (
          <span className={styles.expandAll}>
            <AriaButton
              className={styles.expandToggle}
              onPress={onExpandAll}
              aria-label={formatMessage(
                isAllExpanded ? messages.collapseAll : messages.expandAll
              )}
            >
              <Icon
                name={
                  isAllExpanded ? 'chevrons-down-up-12' : 'chevrons-up-down-12'
                }
                className={styles.expandIcon}
              />
            </AriaButton>
          </span>
        )}
        {menu ? (
          <MenuTrigger>
            <AriaButton className={triggerClassName}>{label}</AriaButton>
            {menu}
          </MenuTrigger>
        ) : (
          <span className={triggerClassName}>{label}</span>
        )}
      </div>
      {allowsResizing && <ColumnResizer />}
    </AriaColumn>
  );
};

export default ColumnHeader;
