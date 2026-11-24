import React, { ReactNode } from 'react';

import {
  Button,
  ComboBox as AriaComboBox,
  Group,
  Input,
  Key,
} from 'react-aria-components';

import {
  ReasonKeysContext,
  useGuardedValue,
  useReasonKeys,
} from '../disabledReason/reasonKeys';
import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import Icon from '../Icon';
import ListBox, { ListBoxPopover } from '../ListBox';

import styles from './ComboBox.module.css';
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
  labelAccessory?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  isInvalid?: boolean;
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
  labelAccessory,
  description,
  errorMessage,
  size = 36,
  isInvalid,
  'data-cy': dataCy,
}: ComboBoxProps<T>) => {
  const reasonKeys = useReasonKeys();
  const [currentValue, handleChange] = useGuardedValue<Key | null>(
    value,
    null,
    onChange,
    (next) => next !== null && reasonKeys.has(next)
  );

  return (
    <ReasonKeysContext.Provider value={reasonKeys}>
      <AriaComboBox
        className={styles.field}
        defaultItems={defaultItems}
        items={items}
        value={currentValue}
        onChange={handleChange}
        onInputChange={onInputChange}
        isInvalid={isInvalid}
        data-cy={dataCy}
      >
        <FieldLabel tooltip={labelTooltip} labelAccessory={labelAccessory}>
          {label}
        </FieldLabel>
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
        <ListBoxPopover>
          <ListBox>{children}</ListBox>
        </ListBoxPopover>
      </AriaComboBox>
    </ReasonKeysContext.Provider>
  );
};

export default ComboBox;
