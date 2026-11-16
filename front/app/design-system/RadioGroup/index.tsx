import React, { ReactNode } from 'react';

import { RadioGroup as AriaRadioGroup } from 'react-aria-components';

import {
  ReasonKeysContext,
  useGuardedValue,
  useReasonKeys,
} from '../disabledReason/reasonKeys';
import { FieldLabel, fieldStyles } from '../Field';
import '../tokens.css';

import styles from './RadioGroup.module.css';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (the heading above already names it) the group needs an aria-label.
  | { label?: undefined; 'aria-label': string };

export type RadioGroupProps = LabelProps & {
  // Radio items.
  children: ReactNode;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  name?: string;
  'data-cy'?: string;
};

const RadioGroup = ({
  label,
  children,
  value,
  defaultValue,
  onChange,
  isDisabled,
  isReadOnly,
  name,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: RadioGroupProps) => {
  // A Radio with a disabled reason takes focus (arrow keys included) but is never chosen.
  const reasonKeys = useReasonKeys();
  const [currentValue, handleChange] = useGuardedValue<string | null>(
    value,
    defaultValue ?? null,
    (newValue) => {
      if (newValue !== null) onChange?.(newValue);
    },
    (next) => next !== null && reasonKeys.has(next)
  );

  return (
    <ReasonKeysContext.Provider value={reasonKeys}>
      <AriaRadioGroup
        className={fieldStyles.field}
        value={currentValue}
        onChange={handleChange}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        name={name}
        aria-label={ariaLabel}
        data-cy={dataCy}
      >
        {label !== undefined && <FieldLabel>{label}</FieldLabel>}
        <div className={styles.options}>{children}</div>
      </AriaRadioGroup>
    </ReasonKeysContext.Provider>
  );
};

export { default as Radio } from './Radio';
export type { RadioProps } from './Radio';

export default RadioGroup;
