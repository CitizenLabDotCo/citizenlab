import React, { KeyboardEvent, ReactNode } from 'react';

import { Key, Selection, Tree } from 'react-aria-components';

import '../tokens.css';

import styles from './TagList.module.css';

export type TagListProps = {
  'aria-label': string;
  // TagListRow, with its subtag rows and a TagListAddSubtag nested inside.
  children: ReactNode;
  selectedKeys?: 'all' | Iterable<Key>;
  defaultSelectedKeys?: 'all' | Iterable<Key>;
  onSelectionChange?: (keys: Selection) => void;
  expandedKeys?: Iterable<Key>;
  defaultExpandedKeys?: Iterable<Key>;
  onExpandedChange?: (keys: Set<Key>) => void;
  // Perspectives on: nothing can be picked and the list sits at opacity/disabled.
  isDisabled?: boolean;
  'data-cy'?: string;
};

// Tree rows move focus between their buttons on Left/Right in the capture phase, which
// would pull focus out of the rename field. Stopping the React event here keeps the
// caret movement, which is the browser default and still runs.
const CARET_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'Home', 'End']);
const keepCaretKeysInFields = (e: KeyboardEvent<HTMLDivElement>) => {
  if (
    e.target instanceof HTMLInputElement &&
    e.target.type === 'text' &&
    CARET_KEYS.has(e.key)
  ) {
    e.stopPropagation();
  }
};

const TagList = ({
  'aria-label': ariaLabel,
  children,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  isDisabled = false,
  'data-cy': dataCy,
}: TagListProps) => (
  <div
    role="presentation"
    className={styles.wrapper}
    onKeyDownCapture={keepCaretKeysInFields}
  >
    <Tree
      aria-label={ariaLabel}
      className={`${styles.list} ${isDisabled ? styles.disabled : ''}`}
      selectionMode={isDisabled ? 'none' : 'multiple'}
      // A locked tag, a subtag and the Add subtag line can't be picked but stay usable.
      disabledBehavior="selection"
      selectedKeys={selectedKeys}
      defaultSelectedKeys={defaultSelectedKeys}
      onSelectionChange={onSelectionChange}
      expandedKeys={expandedKeys}
      defaultExpandedKeys={defaultExpandedKeys}
      onExpandedChange={onExpandedChange}
      data-cy={dataCy}
    >
      {children}
    </Tree>
  </div>
);

export default TagList;
