import React, { ReactNode } from 'react';

import {
  Key,
  ToggleButtonGroup as AriaToggleButtonGroup,
} from 'react-aria-components';

import '../tokens.css';

import styles from './ToggleButtonGroup.module.css';

type ToggleButtonGroupProps = {
  // Two or three design-system ToggleButtons, each with an id.
  children: ReactNode;
  'aria-label': string;
  selectedKeys: Iterable<Key>;
  onSelectionChange: (keys: Set<Key>) => void;
};

const ToggleButtonGroup = ({
  children,
  'aria-label': ariaLabel,
  selectedKeys,
  onSelectionChange,
}: ToggleButtonGroupProps) => (
  <AriaToggleButtonGroup
    className={styles.group}
    selectionMode="single"
    disallowEmptySelection
    selectedKeys={selectedKeys}
    onSelectionChange={onSelectionChange}
    aria-label={ariaLabel}
  >
    {children}
  </AriaToggleButtonGroup>
);

export default ToggleButtonGroup;
