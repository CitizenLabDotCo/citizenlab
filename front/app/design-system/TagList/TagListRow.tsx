import React, { ReactNode, useEffect, useRef, useState } from 'react';

import {
  Input,
  Key,
  TextField as AriaTextField,
  TreeItem,
  TreeItemContent,
} from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Checkbox from '../Checkbox';
import IconButton from '../IconButton';
import inputStyles from '../TextField/input.module.css';
import '../tokens.css';

import messages from './messages';
import styles from './TagListRow.module.css';

export type TagListRowProps = {
  id: Key;
  name: string;
  // "2 subtags". Leave it out to hide it (Show count = false).
  count?: ReactNode;
  level?: 'tag' | 'subtag';
  // "Other": it can be renamed but not picked or deleted.
  isLocked?: boolean;
  // The name becomes an inline text field. Enter saves, Escape cancels.
  isEditing?: boolean;
  // The tag you just added: a surface/row-new flash that fades out.
  isCreated?: boolean;
  onRename?: () => void;
  onRenameSubmit?: (name: string) => void;
  onRenameCancel?: () => void;
  onDelete?: () => void;
  // Subtag rows and the TagListAddSubtag line of an open tag.
  children?: ReactNode;
  'data-cy'?: string;
};

const TagListRow = ({
  id,
  name,
  count,
  level = 'tag',
  isLocked = false,
  isEditing = false,
  isCreated = false,
  onRename,
  onRenameSubmit,
  onRenameCancel,
  onDelete,
  children,
  'data-cy': dataCy,
}: TagListRowProps) => {
  const { formatMessage } = useIntl();
  const isTag = level === 'tag';

  const [draft, setDraft] = useState(name);
  const rowRef = useRef<HTMLDivElement>(null);
  const wasEditing = useRef(isEditing);

  // The field unmounts on save or cancel; give focus back to the row.
  useEffect(() => {
    if (wasEditing.current && !isEditing) rowRef.current?.focus();
    wasEditing.current = isEditing;
  }, [isEditing]);

  const startRename = () => {
    setDraft(name);
    onRename?.();
  };

  const handleKeyDown = (e: { key: string }) => {
    if (e.key === 'Enter') {
      onRenameSubmit?.(draft.trim());
    } else if (e.key === 'Escape') {
      onRenameCancel?.();
    }
  };

  return (
    <TreeItem
      ref={rowRef}
      id={id}
      textValue={name}
      className={styles.row}
      isDisabled={isLocked || !isTag}
      data-level-type={level}
      data-editing={isEditing || undefined}
      data-created={isCreated || undefined}
      data-cy={dataCy}
    >
      <TreeItemContent>
        {({ isSelected, isExpanded, state }) => (
          <>
            {isTag && (
              <span className={styles.checkboxSlot}>
                {/* Driven by the row state: the design-system Checkbox takes no slot. */}
                <Checkbox
                  aria-label={name}
                  isSelected={isSelected}
                  isDisabled={isLocked}
                  onChange={() => state.selectionManager.toggleSelection(id)}
                />
              </span>
            )}
            {isTag && (
              <span className={styles.expand}>
                <IconButton
                  slot="chevron"
                  variant="ghost"
                  size={24}
                  icon="chevron-right-16"
                  aria-label={formatMessage(
                    isExpanded ? messages.collapse : messages.expand
                  )}
                />
              </span>
            )}
            {isEditing ? (
              <AriaTextField
                aria-label={formatMessage(messages.rename)}
                value={draft}
                onChange={setDraft}
                autoFocus
                onKeyDown={handleKeyDown}
                className={styles.renameField}
              >
                <Input
                  className={`${inputStyles.input} ${inputStyles.size36}`}
                />
              </AriaTextField>
            ) : (
              <>
                <span className={styles.label}>
                  <span className={styles.name}>{name}</span>
                  {count && <span className={styles.count}>{count}</span>}
                </span>
                <span className={styles.actions}>
                  <IconButton
                    variant="ghost"
                    size={24}
                    icon="square-pen-16"
                    aria-label={formatMessage(messages.rename)}
                    onPress={startRename}
                  />
                  <IconButton
                    variant="ghost"
                    size={24}
                    icon="trash-2-16"
                    aria-label={formatMessage(
                      isLocked ? messages.cannotDelete : messages.delete
                    )}
                    isDisabled={isLocked}
                    onPress={onDelete}
                  />
                </span>
              </>
            )}
          </>
        )}
      </TreeItemContent>
      {children}
    </TreeItem>
  );
};

export default TagListRow;
