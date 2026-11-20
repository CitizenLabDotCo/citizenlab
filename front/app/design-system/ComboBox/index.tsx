import React, { ReactNode } from 'react';

import {
  Button,
  ComboBox as AriaComboBox,
  Group,
  Input,
  Key,
} from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import Icon from '../Icon';
import ListBox, { ListBoxPopover } from '../ListBox';

import styles from './ComboBox.module.css';
import OpenOnMount from './OpenOnMount';
import '../tokens.css';

type ComboBoxProps<T extends object> = {
  label: ReactNode;
  // ListBoxOption elements, or a function of each item when `items` or `defaultItems` is set.
  children: ReactNode | ((item: T) => ReactNode);
  // Typing filters these; pass `items` instead to filter them yourself.
  defaultItems?: Iterable<T>;
  items?: Iterable<T>;
  value?: Key | null;
  onChange?: (value: Key | null) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  labelTooltip?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  isInvalid?: boolean;
  autoFocus?: boolean;
  // Opens the list on mount, e.g. when a link points straight at this field.
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  'data-cy'?: string;
};

const ComboBox = <T extends object>({
  label,
  children,
  defaultItems,
  items,
  value,
  onChange,
  onInputChange,
  placeholder,
  labelTooltip,
  description,
  errorMessage,
  size = 36,
  isInvalid,
  autoFocus,
  defaultOpen = false,
  onOpenChange,
  'data-cy': dataCy,
}: ComboBoxProps<T>) => (
  <AriaComboBox
    className={styles.field}
    defaultItems={defaultItems}
    items={items}
    value={value}
    onChange={onChange}
    onInputChange={onInputChange}
    isInvalid={isInvalid}
    autoFocus={autoFocus}
    onOpenChange={onOpenChange}
    data-cy={dataCy}
  >
    <FieldLabel tooltip={labelTooltip}>{label}</FieldLabel>
    <div className={fieldStyles.control}>
      <Group
        className={`${styles.frame} ${styles[`size${size}`]}`}
        isInvalid={isInvalid}
      >
        <Input className={styles.input} placeholder={placeholder} />
        <Button className={styles.button}>
          <Icon name="chevron-down-12" className={styles.chevron} />
        </Button>
      </Group>
      <FieldHelp description={description} errorMessage={errorMessage} />
    </div>
    {defaultOpen && <OpenOnMount />}
    <ListBoxPopover>
      <ListBox>{children}</ListBox>
    </ListBoxPopover>
  </AriaComboBox>
);

export default ComboBox;
