import React, { ReactNode } from 'react';

import {
  DisclosureGroup as AriaDisclosureGroup,
  Key,
} from 'react-aria-components';

import '../tokens.css';

import styles from './Disclosure.module.css';

export type DisclosureGroupProps = {
  // Disclosure cards of any Header.
  children: ReactNode;
  allowsMultipleExpanded?: boolean;
  expandedKeys?: Iterable<Key>;
  defaultExpandedKeys?: Iterable<Key>;
  onExpandedChange?: (keys: Set<Key>) => void;
  'data-cy'?: string;
};

const DisclosureGroup = ({
  children,
  allowsMultipleExpanded = true,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  'data-cy': dataCy,
}: DisclosureGroupProps) => (
  <AriaDisclosureGroup
    className={styles.group}
    allowsMultipleExpanded={allowsMultipleExpanded}
    expandedKeys={expandedKeys}
    defaultExpandedKeys={defaultExpandedKeys}
    onExpandedChange={onExpandedChange}
    data-cy={dataCy}
  >
    {children}
  </AriaDisclosureGroup>
);

export default DisclosureGroup;
