import React, { ReactNode } from 'react';

import Checkbox from '../Checkbox';
import Icon from '../Icon';
import UnstyledButton from '../UnstyledButton';

import styles from './TagList.module.css';
import '../tokens.css';

type BarProps = {
  // Checked when every row is, indeterminate when some are.
  isSelected: boolean;
  isIndeterminate?: boolean;
  onSelectAll: (isSelected: boolean) => void;
  selectAllLabel: string;
  // "24 tags", "3 selected" or "3 tags deleted".
  children: ReactNode;
  // A text button on the right: Delete, or Undo.
  action?: ReactNode;
};

// The row above a tag list: select all, the count, and what to do with the
// selection.
export const TagListBar = ({
  isSelected,
  isIndeterminate,
  onSelectAll,
  selectAllLabel,
  children,
  action,
}: BarProps) => (
  <div className={styles.bar}>
    <span className={styles.check}>
      <Checkbox
        aria-label={selectAllLabel}
        isSelected={isSelected}
        isIndeterminate={isIndeterminate}
        onChange={onSelectAll}
      />
    </span>
    <span className={styles.count}>{children}</span>
    {action && <span className={styles.barAction}>{action}</span>}
  </div>
);

type RowProps = {
  title: ReactNode;
  // A short fact after the title, like "2 subtags".
  meta?: ReactNode;
  // Leave both out for a row that can't be selected (a subtag).
  isSelected?: boolean;
  onSelectionChange?: (isSelected: boolean) => void;
  selectLabel?: string;
  // Shows every row's box, once anything in the list is selected.
  showsSelection?: boolean;
  expand?: {
    isExpanded: boolean;
    onToggle: () => void;
    label: string;
    // The id of the element holding the nested rows.
    controls: string;
  };
  // Icon buttons, shown on hover and focus.
  actions?: ReactNode;
  // A nested row starts under its parent's title.
  isNested?: boolean;
};

// One tag in a tag list. Its box shows on hover, on focus, once checked, or
// while anything in the list is selected.
export const TagListRow = ({
  title,
  meta,
  isSelected = false,
  onSelectionChange,
  selectLabel,
  showsSelection = false,
  expand,
  actions,
  isNested = false,
}: RowProps) => {
  const selectable = !!onSelectionChange && !!selectLabel;

  return (
    <div
      className={styles.row}
      data-selected={isSelected || undefined}
      data-shows-selection={showsSelection || undefined}
      data-nested={isNested || undefined}
    >
      {!isNested && (
        <span className={styles.check}>
          {selectable && (
            <Checkbox
              aria-label={selectLabel}
              isSelected={isSelected}
              onChange={onSelectionChange}
            />
          )}
        </span>
      )}
      {!isNested && (
        <span className={styles.toggle}>
          {expand && (
            <UnstyledButton
              className={styles.toggleButton}
              aria-label={expand.label}
              aria-expanded={expand.isExpanded}
              aria-controls={expand.controls}
              onPress={expand.onToggle}
            >
              <Icon
                name={
                  expand.isExpanded ? 'chevron-down-16' : 'chevron-right-16'
                }
              />
            </UnstyledButton>
          )}
        </span>
      )}
      <span className={styles.title}>{title}</span>
      {meta && <span className={styles.meta}>{meta}</span>}
      {actions && <span className={styles.actions}>{actions}</span>}
    </div>
  );
};
