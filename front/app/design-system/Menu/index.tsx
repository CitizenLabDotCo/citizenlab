import React, { ReactNode } from 'react';

import {
  Key,
  Menu as AriaMenu,
  Popover,
  Selection,
} from 'react-aria-components';

import {
  ReasonKeysContext,
  togglesReasonKey,
  useGuardedValue,
  useReasonKeys,
} from '../disabledReason/reasonKeys';
import surfaces from '../surfaces.module.css';

import styles from './Menu.module.css';
import '../tokens.css';

export { MenuTrigger, SubmenuTrigger } from 'react-aria-components';
export { default as MenuItem } from './MenuItem';
export { default as MenuSeparator } from './MenuSeparator';

type MenuProps = {
  // MenuItem, MenuSeparator and SubmenuTrigger.
  children: ReactNode;
  'aria-label'?: string;
  selectionMode?: 'single' | 'multiple';
  selectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  disabledKeys?: Iterable<Key>;
  onAction?: (key: Key) => void;
  // A top-level menu opens below, start-aligned; a submenu opens to the end.
  placement?: 'bottom end';
};

// Pair it with a design-system Button (hasMenu) inside MenuTrigger, or with a
// MenuItem inside SubmenuTrigger.
const Menu = ({
  children,
  'aria-label': ariaLabel,
  selectionMode,
  selectedKeys,
  onSelectionChange,
  disabledKeys,
  onAction,
  placement,
}: MenuProps) => {
  // A MenuItem with a disabled reason takes focus but its action and selection are dropped.
  const reasonKeys = useReasonKeys();
  const [currentKeys, handleSelectionChange] = useGuardedValue<Selection>(
    selectedKeys,
    new Set(),
    onSelectionChange,
    (next, current) => togglesReasonKey(reasonKeys, next, current)
  );
  const hasSelection = selectionMode !== undefined;

  const handleAction = (key: Key) => {
    if (reasonKeys.has(key)) return;
    onAction?.(key);
  };

  return (
    <Popover
      placement={placement}
      className={`${surfaces.dropdown} ${styles.popover}`}
    >
      <ReasonKeysContext.Provider value={reasonKeys}>
        <AriaMenu
          aria-label={ariaLabel}
          selectionMode={selectionMode}
          selectedKeys={hasSelection ? currentKeys : undefined}
          onSelectionChange={hasSelection ? handleSelectionChange : undefined}
          disabledKeys={disabledKeys}
          onAction={handleAction}
          className={styles.menu}
        >
          {children}
        </AriaMenu>
      </ReasonKeysContext.Provider>
    </Popover>
  );
};

export default Menu;
