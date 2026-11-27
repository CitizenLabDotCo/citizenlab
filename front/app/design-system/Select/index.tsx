import React, { ReactNode } from 'react';

import {
  Button,
  Key,
  Label,
  Select as AriaSelect,
  SelectValue,
} from 'react-aria-components';

import {
  ReasonKeysContext,
  useGuardedValue,
  useReasonKeys,
} from '../disabledReason/reasonKeys';
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
  // Inline: the label on the left of a row and a compact grey select on the
  // right, as in the project context of the settings modal.
  layout?: 'stacked' | 'inline';
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
  layout = 'stacked',
  isInvalid,
  id,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: SelectProps<T>) => {
  const reasonKeys = useReasonKeys();
  const [currentValue, handleChange] = useGuardedValue<Key | null>(
    value,
    null,
    onChange,
    (next) => next !== null && reasonKeys.has(next)
  );

  const inline = layout === 'inline';

  return (
    <ReasonKeysContext.Provider value={reasonKeys}>
      <AriaSelect
        className={`${styles.field} ${inline ? styles.inline : ''}`}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        isInvalid={isInvalid}
        id={id}
        aria-label={ariaLabel}
        data-cy={dataCy}
      >
        {label !== undefined &&
          (inline ? (
            <Label className={styles.inlineLabel}>{label}</Label>
          ) : (
            <FieldLabel tooltip={labelTooltip}>{label}</FieldLabel>
          ))}
        <div className={fieldStyles.control}>
          <Button
            className={
              inline
                ? styles.compact
                : `${styles.button} ${styles[`size${size}`]}`
            }
          >
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
    </ReasonKeysContext.Provider>
  );
};

export default Select;
