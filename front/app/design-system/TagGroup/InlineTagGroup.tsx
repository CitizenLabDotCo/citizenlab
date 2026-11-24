import React, { ReactNode } from 'react';

import { Key, TagGroup as AriaTagGroup, TagList } from 'react-aria-components';

import styles from './TagGroup.module.css';

type Props = {
  // Named by a column head or row label instead of its own.
  'aria-label': string;
  // Tag elements.
  children: ReactNode;
  // Lays out the tags: the group itself draws no box.
  className: string;
  onRemove?: (keys: Set<Key>) => void;
};

// Tags inside a table cell or a property row, which lay them out themselves.
const InlineTagGroup = ({
  'aria-label': ariaLabel,
  children,
  className,
  onRemove,
}: Props) => (
  <AriaTagGroup
    aria-label={ariaLabel}
    onRemove={onRemove}
    className={styles.inlineGroup}
  >
    <TagList className={className}>{children}</TagList>
  </AriaTagGroup>
);

export default InlineTagGroup;
