import React, { ReactNode } from 'react';

import {
  Button,
  ComboBox as AriaComboBox,
  Group,
  Input,
  Key,
} from 'react-aria-components';

import {
  SelectReasonKeysContext,
  useGuardedValue,
  useReasonKeys,
} from '../disabledReason/reasonKeys';
import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import Icon from '../Icon';
import ListBox, { ListBoxPopover } from '../ListBox';
import '../tokens.css';

import styles from './ComboBox.module.css';
import OpenOnMount from './OpenOnMount';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (a heading or the row already names it) it needs an aria-label.
  | { label?: undefined; 'aria-label': string };

export type ComboBoxProps<T extends object> = LabelProps & {
  // ListBoxOption elements, or a function of each item when `items` or `defaultItems` is set.
  children: ReactNode | ((item: T) => ReactNode);
  // Typing filters these; pass `items` instead to filter them yourself.
  defaultItems?: Iterable<T>;
  items?: Iterable<T>;
  value?: Key | null;
  defaultValue?: Key | null;
  onChange?: (value: Key | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  disabledKeys?: Iterable<Key>;
  name?: string;
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
  defaultValue,
  onChange,
  inputValue,
  defaultInputValue,
  onInputChange,
  placeholder,
  description,
  errorMessage,
  size = 36,
  isRequired = false,
  isInvalid,
  isDisabled = false,
  disabledKeys,
  name,
  autoFocus,
  defaultOpen = false,
  onOpenChange,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: ComboBoxProps<T>) => {
  // A ListBoxOption with a disabled reason takes focus but is never chosen.
  const reasonKeys = useReasonKeys();
  const [currentValue, handleChange] = useGuardedValue<Key | null>(
    value,
    defaultValue ?? null,
    onChange,
    (next) => next !== null && reasonKeys.has(next)
  );

  return (
    <SelectReasonKeysContext.Provider value={reasonKeys}>
      <AriaComboBox
        className={styles.field}
        defaultItems={defaultItems}
        items={items}
        value={currentValue}
        onChange={handleChange}
        inputValue={inputValue}
        defaultInputValue={defaultInputValue}
        onInputChange={onInputChange}
        isRequired={isRequired}
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        disabledKeys={disabledKeys}
        name={name}
        autoFocus={autoFocus}
        onOpenChange={onOpenChange}
        aria-label={ariaLabel}
        data-cy={dataCy}
      >
        {label !== undefined && (
          <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
        )}
        <div className={fieldStyles.control}>
          <Group
            className={`${styles.frame} ${styles[`size${size}`]}`}
            isInvalid={isInvalid}
            isDisabled={isDisabled}
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
    </SelectReasonKeysContext.Provider>
  );
};

export default ComboBox;
