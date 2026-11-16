import React, { ReactNode } from 'react';

import {
  Key,
  ToggleButtonGroup as AriaToggleButtonGroup,
} from 'react-aria-components';

import '../tokens.css';

import styles from './ToggleButtonGroup.module.css';

export type ToggleButtonGroupProps = {
  // Two or three design-system ToggleButtons, each with an id.
  children: ReactNode;
  'aria-label': string;
  selectedKeys?: Iterable<Key>;
  defaultSelectedKeys?: Iterable<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
  isDisabled?: boolean;
  'data-cy'?: string;
};

const ToggleButtonGroup = ({
  children,
  'aria-label': ariaLabel,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  isDisabled = false,
  'data-cy': dataCy,
}: ToggleButtonGroupProps) => (
  <AriaToggleButtonGroup
    className={styles.group}
    selectionMode="single"
    disallowEmptySelection
    selectedKeys={selectedKeys}
    defaultSelectedKeys={defaultSelectedKeys}
    onSelectionChange={onSelectionChange}
    isDisabled={isDisabled}
    aria-label={ariaLabel}
    data-cy={dataCy}
  >
    {children}
  </AriaToggleButtonGroup>
);

export default ToggleButtonGroup;
