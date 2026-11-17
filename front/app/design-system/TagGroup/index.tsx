import React, { ReactNode } from 'react';

import {
  Key,
  ListStateContext,
  TagGroup as AriaTagGroup,
  TagList,
} from 'react-aria-components';

import { FieldLabel } from '../Field';

import styles from './TagGroup.module.css';
import '../tokens.css';

export { default as Tag } from './Tag';
export { default as TagAdd } from './TagAdd';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (a heading or the row already names it) it needs an aria-label.
  | { label?: undefined; 'aria-label': string };

type TagGroupProps<T extends object> = LabelProps & {
  // Tag elements, or a function of each item when `items` is set.
  children: ReactNode | ((item: T) => ReactNode);
  items?: Iterable<T>;
  // Makes every tag removable.
  onRemove?: (keys: Set<Key>) => void;
  // The Add tag pill (a TagAdd, or a DialogTrigger with a TagAdd and a TagPicker), drawn last.
  add?: ReactNode;
};

const TagGroup = <T extends object>({
  label,
  children,
  items,
  onRemove,
  add,
  'aria-label': ariaLabel,
}: TagGroupProps<T>) => (
  <AriaTagGroup
    className={styles.group}
    onRemove={onRemove}
    aria-label={ariaLabel}
  >
    {label !== undefined && <FieldLabel>{label}</FieldLabel>}
    <div className={styles.list}>
      <TagList items={items} className={styles.tagList}>
        {children}
      </TagList>
      {/* The tag group's list state would otherwise leak into a ListBox in the add slot (the tag picker). */}
      <ListStateContext.Provider value={null}>{add}</ListStateContext.Provider>
    </div>
  </AriaTagGroup>
);

export default TagGroup;
