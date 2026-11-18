import React, { ReactNode } from 'react';

import {
  Button,
  Key,
  Select as AriaSelect,
  SelectValue,
} from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import Icon from '../Icon';
import ListBox, { ListBoxPopover } from '../ListBox';

import styles from './Select.module.css';
import '../tokens.css';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (a heading or the row already names it) it needs an aria-label.
  | { label?: undefined; 'aria-label': string };

type SelectProps<T extends object> = LabelProps & {
  // ListBoxOption elements, or a function of each item when `items` is set.
  children: ReactNode | ((item: T) => ReactNode);
  items?: Iterable<T>;
  value?: Key | null;
  onChange?: (value: Key | null) => void;
  placeholder?: string;
  labelTooltip?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  isInvalid?: boolean;
  id?: string;
  'data-cy'?: string;
};

const Select = <T extends object>({
  label,
  children,
  items,
  value,
  onChange,
  placeholder,
  labelTooltip,
  description,
  errorMessage,
  size = 36,
  isInvalid,
  id,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: SelectProps<T>) => (
  <AriaSelect
    className={styles.field}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    isInvalid={isInvalid}
    id={id}
    aria-label={ariaLabel}
    data-cy={dataCy}
  >
    {label !== undefined && (
      <FieldLabel tooltip={labelTooltip}>{label}</FieldLabel>
    )}
    <div className={fieldStyles.control}>
      <Button className={`${styles.button} ${styles[`size${size}`]}`}>
        {/* Only the label text: the option's icon stays in the list. */}
        <SelectValue className={styles.value}>
          {({ isPlaceholder, selectedText, defaultChildren }) =>
            isPlaceholder ? defaultChildren : selectedText
          }
        </SelectValue>
        <Icon name="chevron-down-12" className={styles.chevron} />
      </Button>
      <FieldHelp description={description} errorMessage={errorMessage} />
    </div>
    <ListBoxPopover>
      <ListBox items={items}>{children}</ListBox>
    </ListBoxPopover>
  </AriaSelect>
);

export default Select;
