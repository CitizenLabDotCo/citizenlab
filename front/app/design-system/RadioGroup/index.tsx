import React, { ReactNode } from 'react';

import { RadioGroup as AriaRadioGroup } from 'react-aria-components';

import {
  ReasonKeysContext,
  useGuardedValue,
  useReasonKeys,
} from '../disabledReason/reasonKeys';
import { FieldLabel, fieldStyles } from '../Field';

import styles from './RadioGroup.module.css';
import '../tokens.css';

type LabelProps =
  | {
      label: ReactNode;
      'aria-label'?: undefined;
      'aria-labelledby'?: undefined;
    }
  // Without a visible label (the heading above already names it) the group needs an aria-label.
  | { label?: undefined; 'aria-label': string; 'aria-labelledby'?: undefined }
  // Or the id of the text that names it.
  | { label?: undefined; 'aria-label'?: undefined; 'aria-labelledby': string };

type RadioGroupProps = LabelProps & {
  // Radio items.
  children: ReactNode;
  value?: string | null;
  onChange?: (value: string) => void;
  name?: string;
  // Side by side: a short choice nested under a setting row.
  orientation?: 'vertical' | 'horizontal';
};

const RadioGroup = ({
  label,
  children,
  value,
  onChange,
  name,
  orientation = 'vertical',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
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
        orientation={orientation}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {label !== undefined && <FieldLabel>{label}</FieldLabel>}
        <div className={styles.options} data-orientation={orientation}>
          {children}
        </div>
      </AriaRadioGroup>
    </ReasonKeysContext.Provider>
  );
};

export { default as Radio } from './Radio';

export default RadioGroup;
