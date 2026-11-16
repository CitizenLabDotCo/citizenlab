import React, { ReactNode } from 'react';

import { Button as AriaButton } from 'react-aria-components';

import Icon from '../Icon';
import '../tokens.css';

import styles from './CellEditor.module.css';

export type CellEditorKind = 'status' | 'manager' | 'managers';

export type CellEditorProps = {
  // Status: a StatusWord. Manager: the person's name. Managers: e.g. 2 managers.
  children: ReactNode;
  kind?: CellEditorKind;
  // Manager: a 24 Avatar. Managers: an Avatar stack.
  avatar?: ReactNode;
  // The chevron also shows on its own while the row or the editor is hovered, focused or open.
  showChevron?: boolean;
  'aria-label'?: string;
};

// The trigger of a Select or DialogTrigger inside a Cell with hasEditor.
// When the admin cannot change the value, render the value without an editor.
const CellEditor = ({
  children,
  kind = 'status',
  avatar,
  showChevron = false,
  'aria-label': ariaLabel,
}: CellEditorProps) => (
  <AriaButton
    className={`${styles.editor} ${
      kind === 'status' ? styles.status : styles.person
    }`}
    data-show-chevron={showChevron || undefined}
    aria-label={ariaLabel}
  >
    {kind === 'status' ? (
      children
    ) : (
      <span className={styles.personGroup}>
        {avatar}
        <span className={styles.name}>{children}</span>
      </span>
    )}
    <Icon name="chevron-down-12" className={styles.chevron} />
  </AriaButton>
);

export default CellEditor;
