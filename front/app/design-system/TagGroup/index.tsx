import React, { ReactNode } from 'react';

import {
  Key,
  ListStateContext,
  TagGroup as AriaTagGroup,
  TagList,
  Text,
} from 'react-aria-components';

import { FieldLabel, fieldStyles } from '../Field';
import '../tokens.css';

import styles from './TagGroup.module.css';

export { default as Tag } from './Tag';
export type { TagProps } from './Tag';
export { default as TagAdd } from './TagAdd';
export type { TagAddProps } from './TagAdd';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (a heading or the row already names it) it needs an aria-label.
  | { label?: undefined; 'aria-label': string };

export type TagGroupProps<T extends object> = LabelProps & {
  // Tag elements, or a function of each item when `items` is set.
  children: ReactNode | ((item: T) => ReactNode);
  items?: Iterable<T>;
  // Makes every tag removable.
  onRemove?: (keys: Set<Key>) => void;
  // The Add tag pill (a TagAdd, or a DialogTrigger with a TagAdd and a TagPicker), drawn last.
  add?: ReactNode;
  description?: ReactNode;
  isRequired?: boolean;
  disabledKeys?: Iterable<Key>;
  'data-cy'?: string;
};

const TagGroup = <T extends object>({
  label,
  children,
  items,
  onRemove,
  add,
  description,
  isRequired = false,
  disabledKeys,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: TagGroupProps<T>) => (
  <AriaTagGroup
    className={styles.group}
    onRemove={onRemove}
    disabledKeys={disabledKeys}
    aria-label={ariaLabel}
    data-cy={dataCy}
  >
    {label !== undefined && (
      <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
    )}
    <div className={styles.list}>
      <TagList items={items} className={styles.tagList}>
        {children}
      </TagList>
      {/* The tag group's list state would otherwise leak into a ListBox in the add slot (the tag picker). */}
      <ListStateContext.Provider value={null}>{add}</ListStateContext.Provider>
    </div>
    {description && (
      <Text slot="description" className={fieldStyles.description}>
        {description}
      </Text>
    )}
  </AriaTagGroup>
);

export default TagGroup;
