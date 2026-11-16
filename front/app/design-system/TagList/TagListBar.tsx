import React, { ReactNode } from 'react';

import { Toolbar } from 'react-aria-components';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import Button from '../Button';
import Checkbox from '../Checkbox';
import '../tokens.css';

import messages from './messages';
import styles from './TagListBar.module.css';

export type TagListBarMode =
  | 'count'
  | 'search'
  | 'selected'
  | 'undo'
  | 'disabled';

export type TagListBarProps = {
  // Count: all tags. Search: select-all takes only the tags shown. Selected: Delete.
  // Undo: the deletion is undone from here. Disabled: Perspectives on.
  mode?: TagListBarMode;
  // "24 tags", "2 of 24 tags", "23 selected", "“Parking” deleted".
  label: ReactNode;
  // The select-all checkbox.
  isSelected?: boolean;
  isIndeterminate?: boolean;
  onChange?: (isSelected: boolean) => void;
  onDelete?: () => void;
  onUndo?: () => void;
  'data-cy'?: string;
};

const TagListBar = ({
  mode = 'count',
  label,
  isSelected,
  isIndeterminate,
  onChange,
  onDelete,
  onUndo,
  'data-cy': dataCy,
}: TagListBarProps) => {
  const { formatMessage } = useIntl();

  return (
    <Toolbar className={styles.bar} data-cy={dataCy}>
      <span className={styles.checkboxSlot}>
        <Checkbox
          aria-label={formatMessage(
            mode === 'search' ? messages.selectShown : messages.selectAll
          )}
          isSelected={isSelected}
          isIndeterminate={isIndeterminate}
          isDisabled={mode === 'disabled'}
          onChange={onChange}
        />
      </span>
      <span className={styles.label}>{label}</span>
      {mode === 'selected' && (
        <Button variant="quiet" size={28} onPress={onDelete}>
          <FormattedMessage {...messages.delete} />
        </Button>
      )}
      {mode === 'undo' && (
        <Button variant="quiet" size={28} onPress={onUndo}>
          <FormattedMessage {...messages.undo} />
        </Button>
      )}
    </Toolbar>
  );
};

export default TagListBar;
