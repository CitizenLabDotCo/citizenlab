import React, { ReactNode } from 'react';

import {
  Key,
  Menu as AriaMenu,
  Placement,
  Popover,
  Selection,
} from 'react-aria-components';

import {
  ReasonKeysContext,
  togglesReasonKey,
  useGuardedValue,
  useReasonKeys,
} from '../disabledReason/reasonKeys';
import '../tokens.css';
import surfaces from '../surfaces.module.css';

import styles from './Menu.module.css';

export { MenuTrigger, SubmenuTrigger } from 'react-aria-components';
export { default as MenuItem } from './MenuItem';
export type { MenuItemProps, MenuItemVariant } from './MenuItem';
export { default as MenuSeparator } from './MenuSeparator';

export type MenuProps = {
  // MenuItem, MenuSeparator and SubmenuTrigger.
  children: ReactNode;
  'aria-label'?: string;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: Selection;
  defaultSelectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  disabledKeys?: Iterable<Key>;
  onAction?: (key: Key) => void;
  // A top-level menu opens below, start-aligned; a submenu opens to the end.
  placement?: Placement;
  'data-cy'?: string;
};

// Pair it with a design-system Button (hasMenu) inside MenuTrigger, or with a
// MenuItem inside SubmenuTrigger.
const Menu = ({
  children,
  'aria-label': ariaLabel,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  disabledKeys,
  onAction,
  placement,
  'data-cy': dataCy,
}: MenuProps) => {
  // A MenuItem with a disabled reason takes focus but its action and selection are dropped.
  const reasonKeys = useReasonKeys();
  const [currentKeys, handleSelectionChange] = useGuardedValue<Selection>(
    selectedKeys,
    defaultSelectedKeys ?? new Set(),
    onSelectionChange,
    (next, current) => togglesReasonKey(reasonKeys, next, current)
  );
  const hasSelection =
    selectionMode === 'single' || selectionMode === 'multiple';

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
          data-cy={dataCy}
        >
          {children}
        </AriaMenu>
      </ReasonKeysContext.Provider>
    </Popover>
  );
};

export default Menu;
