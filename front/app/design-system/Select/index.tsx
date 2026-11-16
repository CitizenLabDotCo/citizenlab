import React, { ReactNode } from 'react';

import {
  Button,
  Key,
  Select as AriaSelect,
  SelectValue,
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

import styles from './Select.module.css';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (a heading or the row already names it) it needs an aria-label.
  | { label?: undefined; 'aria-label': string };

export type SelectProps<T extends object> = LabelProps & {
  // ListBoxOption elements, or a function of each item when `items` is set.
  children: ReactNode | ((item: T) => ReactNode);
  items?: Iterable<T>;
  value?: Key | null;
  defaultValue?: Key | null;
  onChange?: (value: Key | null) => void;
  placeholder?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  isInvalid?: boolean;
  isDisabled?: boolean;
  disabledKeys?: Iterable<Key>;
  name?: string;
  id?: string;
  autoFocus?: boolean;
  'data-cy'?: string;
};

const Select = <T extends object>({
  label,
  children,
  items,
  value,
  defaultValue,
  onChange,
  placeholder,
  description,
  errorMessage,
  size = 36,
  isInvalid,
  isDisabled = false,
  disabledKeys,
  name,
  id,
  autoFocus,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: SelectProps<T>) => {
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
      <AriaSelect
        className={styles.field}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        disabledKeys={disabledKeys}
        name={name}
        id={id}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        data-cy={dataCy}
      >
        {label !== undefined && <FieldLabel>{label}</FieldLabel>}
        <div className={fieldStyles.control}>
          <Button className={`${styles.button} ${styles[`size${size}`]}`}>
            {/* Only the label text: the option's icon, description and count stay in the list. */}
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
    </SelectReasonKeysContext.Provider>
  );
};

export default Select;
