import React, { ReactNode } from 'react';

import { CheckboxGroup as AriaCheckboxGroup } from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import '../tokens.css';

import styles from './Checkbox.module.css';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (a heading or the row already names it) it needs an aria-label.
  | { label?: undefined; 'aria-label': string };

export type CheckboxGroupProps = LabelProps & {
  // Checkbox items.
  children: ReactNode;
  errorMessage?: ReactNode;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  name?: string;
  'data-cy'?: string;
};

// The error of an invalid Checkbox shows under the group, not under each box.
const CheckboxGroup = ({
  label,
  children,
  errorMessage,
  value,
  defaultValue,
  onChange,
  isDisabled,
  isInvalid,
  isRequired,
  isReadOnly,
  name,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: CheckboxGroupProps) => (
  <AriaCheckboxGroup
    className={fieldStyles.field}
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    isDisabled={isDisabled}
    isInvalid={isInvalid}
    isRequired={isRequired}
    isReadOnly={isReadOnly}
    name={name}
    aria-label={ariaLabel}
    data-cy={dataCy}
  >
    {label !== undefined && (
      <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
    )}
    <div className={fieldStyles.control}>
      <div className={styles.options}>{children}</div>
      <FieldHelp errorMessage={errorMessage} />
    </div>
  </AriaCheckboxGroup>
);

export default CheckboxGroup;
