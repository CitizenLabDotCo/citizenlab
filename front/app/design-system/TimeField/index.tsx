import React, { ReactNode } from 'react';

import { Time } from '@internationalized/date';
import { TimeField as AriaTimeField } from 'react-aria-components';

import dateInputStyles from '../DateField/DateInput.module.css';
import DateSegments from '../DateField/DateSegments';
import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import '../tokens.css';

import styles from './TimeField.module.css';

export type TimeFieldProps = {
  label: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  value?: Time | null;
  defaultValue?: Time | null;
  onChange?: (value: Time | null) => void;
  minValue?: Time;
  maxValue?: Time;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  name?: string;
  autoFocus?: boolean;
  'data-cy'?: string;
};

const TimeField = ({
  label,
  description,
  errorMessage,
  size = 36,
  value,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  isRequired,
  isInvalid,
  isDisabled,
  isReadOnly,
  name,
  autoFocus,
  'data-cy': dataCy,
}: TimeFieldProps) => (
  <AriaTimeField<Time>
    className={dateInputStyles.field}
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    minValue={minValue}
    maxValue={maxValue}
    hourCycle={24}
    isRequired={isRequired}
    isInvalid={isInvalid}
    isDisabled={isDisabled}
    isReadOnly={isReadOnly}
    name={name}
    autoFocus={autoFocus}
    data-cy={dataCy}
  >
    <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
    <div className={fieldStyles.control}>
      <DateSegments
        className={`${styles.input} ${dateInputStyles[`size${size}`]}`}
      />
      <FieldHelp description={description} errorMessage={errorMessage} />
    </div>
  </AriaTimeField>
);

export default TimeField;
