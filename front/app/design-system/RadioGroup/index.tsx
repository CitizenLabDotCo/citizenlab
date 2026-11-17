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

type RadioGroupProps = LabelProps & {
  // Radio items.
  children: ReactNode;
  value?: string | null;
  onChange?: (value: string) => void;
  name?: string;
};

const RadioGroup = ({
  label,
  children,
  value,
  onChange,
  name,
  'aria-label': ariaLabel,
}: RadioGroupProps) => {
  // A Radio with a disabled reason takes focus (arrow keys included) but is never chosen.
  const reasonKeys = useReasonKeys();
  const [currentValue, handleChange] = useGuardedValue<string | null>(
    value,
    null,
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
        name={name}
        aria-label={ariaLabel}
      >
        {label !== undefined && <FieldLabel>{label}</FieldLabel>}
        <div className={styles.options}>{children}</div>
      </AriaRadioGroup>
    </ReasonKeysContext.Provider>
  );
};

export { default as Radio } from './Radio';

export default RadioGroup;
